/**
 * Audio recording and waveform analysis utility for pronunciation practice
 * Provides recording, playback, and audio feature extraction capabilities
 */

export interface AudioRecording {
  blob: Blob;
  url: string;
  duration: number;
  waveform: number[]; // Normalized amplitude values for visualization
}

export interface AudioFeatures {
  pitch: number[]; // Fundamental frequency over time
  energy: number[]; // Audio energy/volume over time
  duration: number;
  spectralCentroid: number; // Average frequency weighted by amplitude
}

/**
 * Record audio from the user's microphone
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm',
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Microphone access denied or not available');
    }
  }

  async stopRecording(): Promise<AudioRecording> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        try {
          const audioContext = new AudioContext();
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const waveform = extractWaveform(audioBuffer);
          
          resolve({
            blob,
            url,
            duration: audioBuffer.duration,
            waveform,
          });
        } catch (error) {
          reject(error);
        } finally {
          // Stop all tracks
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
          }
        }
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.audioChunks = [];
  }
}

/**
 * Extract waveform data from audio buffer for visualization
 */
function extractWaveform(audioBuffer: AudioBuffer, samples: number = 100): number[] {
  const channelData = audioBuffer.getChannelData(0); // Use first channel
  const blockSize = Math.floor(channelData.length / samples);
  const waveform: number[] = [];

  for (let i = 0; i < samples; i++) {
    const start = i * blockSize;
    const end = start + blockSize;
    let sum = 0;

    // Calculate RMS (root mean square) for this block
    for (let j = start; j < end && j < channelData.length; j++) {
      sum += channelData[j] * channelData[j];
    }

    const rms = Math.sqrt(sum / blockSize);
    waveform.push(rms);
  }

  // Normalize to 0-1 range
  const max = Math.max(...waveform);
  return waveform.map(v => max > 0 ? v / max : 0);
}

/**
 * Extract audio features for pronunciation comparison
 */
export async function extractAudioFeatures(audioBlob: Blob): Promise<AudioFeatures> {
  const audioContext = new AudioContext();
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  // Extract pitch using autocorrelation
  const pitch = extractPitch(channelData, sampleRate);
  
  // Extract energy (volume) over time
  const energy = extractEnergy(channelData);
  
  // Calculate spectral centroid (brightness of sound)
  const spectralCentroid = calculateSpectralCentroid(channelData, sampleRate);
  
  return {
    pitch,
    energy,
    duration: audioBuffer.duration,
    spectralCentroid,
  };
}

/**
 * Extract pitch using autocorrelation method
 */
function extractPitch(channelData: Float32Array, sampleRate: number, windowSize: number = 2048): number[] {
  const pitches: number[] = [];
  const hopSize = windowSize / 2;
  
  for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
    const window = channelData.slice(i, i + windowSize);
    const pitch = detectPitch(window, sampleRate);
    pitches.push(pitch);
  }
  
  return pitches;
}

/**
 * Detect pitch in a window using autocorrelation
 */
function detectPitch(buffer: Float32Array, sampleRate: number): number {
  const minFreq = 80; // Minimum human voice frequency
  const maxFreq = 400; // Maximum for typical speech
  const minPeriod = Math.floor(sampleRate / maxFreq);
  const maxPeriod = Math.floor(sampleRate / minFreq);
  
  let bestCorrelation = 0;
  let bestPeriod = 0;
  
  // Autocorrelation
  for (let period = minPeriod; period < maxPeriod; period++) {
    let correlation = 0;
    for (let i = 0; i < buffer.length - period; i++) {
      correlation += buffer[i] * buffer[i + period];
    }
    
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestPeriod = period;
    }
  }
  
  return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
}

/**
 * Extract energy (volume) over time
 */
function extractEnergy(channelData: Float32Array, windowSize: number = 2048): number[] {
  const energy: number[] = [];
  const hopSize = windowSize / 2;
  
  for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
    let sum = 0;
    for (let j = i; j < i + windowSize; j++) {
      sum += channelData[j] * channelData[j];
    }
    energy.push(Math.sqrt(sum / windowSize));
  }
  
  // Normalize
  const max = Math.max(...energy);
  return energy.map(e => max > 0 ? e / max : 0);
}

/**
 * Calculate spectral centroid (brightness)
 */
function calculateSpectralCentroid(channelData: Float32Array, sampleRate: number): number {
  const fftSize = 2048;
  const audioContext = new OfflineAudioContext(1, channelData.length, sampleRate);
  
  // Simple approximation: weighted average of frequency bins
  let weightedSum = 0;
  let magnitudeSum = 0;
  
  for (let i = 0; i < Math.min(fftSize / 2, channelData.length); i++) {
    const magnitude = Math.abs(channelData[i]);
    const frequency = (i * sampleRate) / fftSize;
    weightedSum += frequency * magnitude;
    magnitudeSum += magnitude;
  }
  
  return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
}

/**
 * Generate TTS audio and extract its features for comparison
 */
export async function generateNativeAudio(text: string, languageCode: string): Promise<AudioRecording | null> {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Find appropriate voice for the language
    const voice = voices.find(v => v.lang.startsWith(languageCode));
    if (!voice) {
      resolve(null);
      return;
    }
    
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.85;
    
    // Note: Browser TTS doesn't provide direct audio buffer access
    // This is a placeholder - in production, you'd use a server-side TTS API
    // that returns audio files which can be analyzed
    
    utterance.onend = () => {
      // For now, return null as we can't capture browser TTS audio
      // In production, use server-side TTS API
      resolve(null);
    };
    
    window.speechSynthesis.speak(utterance);
  });
}
