/**
 * Pronunciation practice component
 * Allows users to record their pronunciation and compare with native audio
 * Uses AI-powered analysis for accurate pronunciation scoring
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Mic, Square, Play, RotateCcw, Volume2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AudioRecorder, type AudioRecording } from '@/lib/audioRecording';
import { WaveformDisplay } from './WaveformDisplay';
import { speakInLanguage, isSpeechSynthesisSupported } from '@/lib/languageTTS';
import { trpc } from '@/lib/trpc';

interface PronunciationPracticeProps {
  word: string;
  languageCode: string;
  onClose?: () => void;
}

interface PronunciationAnalysis {
  overallScore: number;
  pitchScore: number;
  clarityScore: number;
  timingScore: number;
  accentScore: number;
  feedback: string;
  tips: string[];
}

export function PronunciationPractice({ word, languageCode, onClose }: PronunciationPracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [userRecording, setUserRecording] = useState<AudioRecording | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PronunciationAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [nativeWaveform, setNativeWaveform] = useState<number[]>([]);
  
  const recorderRef = useRef<AudioRecorder>(new AudioRecorder());
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Use tRPC mutation for AI-powered pronunciation analysis
  const analyzePronunciation = trpc.learning.analyzePronunciation.useMutation();
  
  // Server-side TTS for high-quality native pronunciation
  const generateAudio = trpc.learning.generatePronunciationAudio.useMutation();
  const nativeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingNative, setIsPlayingNative] = useState(false);
  
  // TTS speed control with localStorage persistence
  const [ttsSpeed, setTtsSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('ttsSpeed');
    return saved ? parseFloat(saved) : 0.85;
  });
  
  // Save speed to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('ttsSpeed', ttsSpeed.toString());
  }, [ttsSpeed]);

  const startRecording = async () => {
    try {
      await recorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingTime(0);
      setAnalysisResult(null);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 0.1);
      }, 100);
      
      toast.info('Recording started. Say the word clearly!');
    } catch (error) {
      toast.error('Failed to start recording. Please allow microphone access.');
      console.error(error);
    }
  };

  const stopRecording = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      setIsRecording(false);
      setIsProcessing(true);
      
      const recording = await recorderRef.current.stopRecording();
      setUserRecording(recording);
      
      // Generate a reference waveform pattern for the word
      // This creates a distinct "ideal" waveform based on word characteristics
      const referenceWaveform = generateReferenceWaveform(word, languageCode);
      setNativeWaveform(referenceWaveform);
      
      // Analyze pronunciation using AI
      await analyzeWithAI(recording, word, languageCode);
      
    } catch (error) {
      toast.error('Failed to process recording.');
      console.error(error);
      setIsProcessing(false);
    }
  };

  const analyzeWithAI = async (recording: AudioRecording, targetWord: string, lang: string) => {
    try {
      // Extract audio characteristics for analysis
      const audioCharacteristics = {
        duration: recording.duration,
        waveformPeaks: recording.waveform.filter(v => v > 0.5).length,
        waveformAvg: recording.waveform.reduce((a, b) => a + b, 0) / recording.waveform.length,
        waveformVariance: calculateVariance(recording.waveform),
        silenceRatio: recording.waveform.filter(v => v < 0.1).length / recording.waveform.length,
      };

      // Call AI analysis endpoint
      const result = await analyzePronunciation.mutateAsync({
        word: targetWord,
        languageCode: lang,
        duration: audioCharacteristics.duration,
        waveformStats: {
          peaks: audioCharacteristics.waveformPeaks,
          average: audioCharacteristics.waveformAvg,
          variance: audioCharacteristics.waveformVariance,
          silenceRatio: audioCharacteristics.silenceRatio,
        },
      });

      setAnalysisResult(result);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to local analysis if AI fails
      const fallbackResult = performLocalAnalysis(recording, targetWord);
      setAnalysisResult(fallbackResult);
      toast.info('Analysis complete (offline mode)');
    } finally {
      setIsProcessing(false);
    }
  };

  const performLocalAnalysis = (recording: AudioRecording, targetWord: string): PronunciationAnalysis => {
    // Calculate scores based on actual audio characteristics
    const waveform = recording.waveform;
    const duration = recording.duration;
    
    // Expected duration based on word length (roughly 0.3-0.5s per syllable)
    const expectedSyllables = countSyllables(targetWord);
    const expectedDuration = expectedSyllables * 0.4;
    const durationRatio = Math.min(duration, expectedDuration) / Math.max(duration, expectedDuration);
    
    // Timing score based on duration match
    const timingScore = Math.round(durationRatio * 100);
    
    // Clarity score based on waveform characteristics
    const avgAmplitude = waveform.reduce((a, b) => a + b, 0) / waveform.length;
    const variance = calculateVariance(waveform);
    const silenceRatio = waveform.filter(v => v < 0.1).length / waveform.length;
    
    // Good pronunciation has clear peaks, moderate variance, low silence
    let clarityScore = 50;
    if (avgAmplitude > 0.3 && avgAmplitude < 0.7) clarityScore += 20;
    if (variance > 0.05 && variance < 0.15) clarityScore += 15;
    if (silenceRatio < 0.3) clarityScore += 15;
    clarityScore = Math.min(100, Math.max(0, clarityScore));
    
    // Pitch score based on waveform pattern consistency
    const pitchConsistency = calculatePitchConsistency(waveform);
    const pitchScore = Math.round(pitchConsistency * 100);
    
    // Accent score - harder to measure without reference, use combination
    const accentScore = Math.round((timingScore + clarityScore + pitchScore) / 3);
    
    // Overall score with weights
    const overallScore = Math.round(
      timingScore * 0.25 +
      clarityScore * 0.30 +
      pitchScore * 0.25 +
      accentScore * 0.20
    );
    
    // Generate feedback based on scores
    const feedback = generateFeedback(overallScore);
    const tips = generateTips({ timingScore, clarityScore, pitchScore, accentScore });
    
    return {
      overallScore,
      pitchScore,
      clarityScore,
      timingScore,
      accentScore,
      feedback,
      tips,
    };
  };

  const playUserRecording = () => {
    if (!userRecording) return;
    
    if (userAudioRef.current) {
      userAudioRef.current.pause();
      userAudioRef.current = null;
    }
    
    const audio = new Audio(userRecording.url);
    userAudioRef.current = audio;
    
    setIsPlayingUser(true);
    audio.play();
    
    audio.onended = () => {
      setIsPlayingUser(false);
    };
  };

  const playNativePronunciation = async () => {
    if (isPlayingNative) return;
    
    setIsPlayingNative(true);
    
    // Try server-side TTS first (high quality)
    try {
      const result = await generateAudio.mutateAsync({
        word,
        languageCode,
        speed: ttsSpeed,
      });

      if (result.success && result.audio) {
        const audioData = `data:${result.contentType};base64,${result.audio}`;
        
        if (nativeAudioRef.current) {
          nativeAudioRef.current.pause();
        }
        
        const audio = new Audio(audioData);
        nativeAudioRef.current = audio;
        
        audio.onended = () => setIsPlayingNative(false);
        audio.onerror = () => {
          setIsPlayingNative(false);
          fallbackToBrowserTTS();
        };
        
        await audio.play();
        return;
      }
    } catch (error) {
      console.log('[TTS] Server TTS failed, falling back to browser:', error);
    }

    // Fallback to browser TTS
    fallbackToBrowserTTS();
  };

  const fallbackToBrowserTTS = () => {
    if (!isSpeechSynthesisSupported()) {
      setIsPlayingNative(false);
      toast.error('Text-to-speech is not available');
      return;
    }
    
    speakInLanguage(word, languageCode, {
      rate: ttsSpeed,
      onEnd: () => setIsPlayingNative(false),
      onError: (error) => {
        setIsPlayingNative(false);
        toast.error('Failed to play pronunciation');
        console.error(error);
      },
    });
  };

  const reset = () => {
    setUserRecording(null);
    setNativeWaveform([]);
    setAnalysisResult(null);
    setRecordingTime(0);
    if (userAudioRef.current) {
      userAudioRef.current.pause();
      userAudioRef.current = null;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Practice Pronunciation</h3>
          <p className="text-4xl font-bold text-primary">{word}</p>
          <p className="text-sm text-muted-foreground">
            Record yourself saying this word and get AI-powered feedback
          </p>
          
          {/* Speed Control */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <Label htmlFor="pronunciation-speed" className="text-sm">
              Speed: {ttsSpeed.toFixed(2)}x
            </Label>
            <input
              id="pronunciation-speed"
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={ttsSpeed}
              onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
              className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              title="Adjust pronunciation speed"
            />
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex justify-center gap-3">
          {!isRecording && !userRecording && (
            <Button
              size="lg"
              onClick={startRecording}
              className="gap-2"
            >
              <Mic className="h-5 w-5" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium">
                    {recordingTime.toFixed(1)}s
                  </span>
                </div>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopRecording}
                  className="gap-2"
                >
                  <Square className="h-5 w-5" />
                  Stop Recording
                </Button>
              </div>
            </>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing your pronunciation...</span>
            </div>
          )}

          {userRecording && !isProcessing && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={playUserRecording}
                disabled={isPlayingUser}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Play My Recording
              </Button>
              <Button
                variant="outline"
                onClick={playNativePronunciation}
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" />
                Play Native
              </Button>
              <Button
                variant="outline"
                onClick={reset}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Waveform Comparison */}
        {userRecording && nativeWaveform.length > 0 && !isProcessing && (
          <div className="space-y-4">
            <WaveformDisplay
              waveform={nativeWaveform}
              color="#10b981"
              label="Reference Pattern"
            />
            <WaveformDisplay
              waveform={userRecording.waveform}
              color="#8b5cf6"
              label="Your Pronunciation"
            />
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="text-center space-y-2">
              <div className={`text-6xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                {analysisResult.overallScore}%
              </div>
              <p className="text-lg font-medium">{analysisResult.feedback}</p>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pitch</span>
                  <Badge variant={getScoreBadgeVariant(analysisResult.pitchScore)}>
                    {analysisResult.pitchScore}%
                  </Badge>
                </div>
                <Progress value={analysisResult.pitchScore} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Clarity</span>
                  <Badge variant={getScoreBadgeVariant(analysisResult.clarityScore)}>
                    {analysisResult.clarityScore}%
                  </Badge>
                </div>
                <Progress value={analysisResult.clarityScore} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Timing</span>
                  <Badge variant={getScoreBadgeVariant(analysisResult.timingScore)}>
                    {analysisResult.timingScore}%
                  </Badge>
                </div>
                <Progress value={analysisResult.timingScore} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Accent</span>
                  <Badge variant={getScoreBadgeVariant(analysisResult.accentScore)}>
                    {analysisResult.accentScore}%
                  </Badge>
                </div>
                <Progress value={analysisResult.accentScore} />
              </div>
            </div>

            {/* Improvement Tips */}
            {analysisResult.tips.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">💡 Tips for Improvement:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {analysisResult.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        {onClose && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={onClose}>
              Close Practice
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Generate a reference waveform pattern based on word characteristics
 * This creates a visually distinct "ideal" pattern for comparison
 */
function generateReferenceWaveform(word: string, languageCode: string): number[] {
  const syllables = countSyllables(word);
  const samples = 100;
  const waveform: number[] = [];
  
  // Create a smooth, idealized waveform with peaks for each syllable
  const peaksPerSyllable = Math.floor(samples / syllables);
  
  for (let i = 0; i < samples; i++) {
    const syllableIndex = Math.floor(i / peaksPerSyllable);
    const positionInSyllable = (i % peaksPerSyllable) / peaksPerSyllable;
    
    // Create a smooth envelope for each syllable
    // Peak in the middle, fade at edges
    const envelope = Math.sin(positionInSyllable * Math.PI);
    
    // Add some variation based on position
    const variation = 0.1 * Math.sin(i * 0.5);
    
    // Base amplitude varies by syllable (stressed vs unstressed)
    const stressPattern = getStressPattern(word, syllableIndex);
    const baseAmplitude = 0.5 + (stressPattern * 0.3);
    
    const value = Math.max(0.05, Math.min(1, baseAmplitude * envelope + variation));
    waveform.push(value);
  }
  
  return waveform;
}

/**
 * Count syllables in a word (approximate)
 */
function countSyllables(word: string): number {
  const vowels = word.toLowerCase().match(/[aeiouyáéíóúàèìòùäëïöüâêîôû]/gi);
  if (!vowels) return 1;
  
  // Count vowel groups (consecutive vowels count as one)
  let count = 0;
  let lastWasVowel = false;
  
  for (const char of word.toLowerCase()) {
    const isVowel = /[aeiouyáéíóúàèìòùäëïöüâêîôû]/.test(char);
    if (isVowel && !lastWasVowel) {
      count++;
    }
    lastWasVowel = isVowel;
  }
  
  return Math.max(1, count);
}

/**
 * Get stress pattern for a syllable (simplified)
 */
function getStressPattern(word: string, syllableIndex: number): number {
  const syllables = countSyllables(word);
  
  // Simple stress pattern: first syllable stressed for short words,
  // second-to-last for longer words
  if (syllables <= 2) {
    return syllableIndex === 0 ? 1 : 0.7;
  } else {
    const stressedSyllable = syllables - 2;
    return syllableIndex === stressedSyllable ? 1 : 0.6;
  }
}

/**
 * Calculate variance of waveform values
 */
function calculateVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate pitch consistency from waveform
 */
function calculatePitchConsistency(waveform: number[]): number {
  if (waveform.length < 2) return 0.5;
  
  // Calculate how smooth the transitions are
  let totalChange = 0;
  for (let i = 1; i < waveform.length; i++) {
    totalChange += Math.abs(waveform[i] - waveform[i - 1]);
  }
  
  const avgChange = totalChange / (waveform.length - 1);
  
  // Lower change = more consistent = higher score
  // Normalize to 0-1 range
  return Math.max(0, Math.min(1, 1 - (avgChange * 2)));
}

/**
 * Generate feedback based on overall score
 */
function generateFeedback(score: number): string {
  if (score >= 90) return "Excellent! Your pronunciation is nearly perfect! 🎉";
  if (score >= 80) return "Great job! Your pronunciation is very good!";
  if (score >= 70) return "Good effort! You're making progress.";
  if (score >= 60) return "Not bad! Keep practicing to improve.";
  if (score >= 50) return "Getting there! Focus on the tips below.";
  return "Keep trying! Listen carefully and practice more.";
}

/**
 * Generate improvement tips based on individual scores
 */
function generateTips(scores: { timingScore: number; clarityScore: number; pitchScore: number; accentScore: number }): string[] {
  const tips: string[] = [];
  
  if (scores.pitchScore < 70) {
    tips.push("🎵 Work on your intonation. Try to match the rise and fall of the native pronunciation.");
  }
  
  if (scores.clarityScore < 70) {
    tips.push("🗣️ Speak more clearly. Make sure each sound is distinct and audible.");
  }
  
  if (scores.timingScore < 70) {
    tips.push("⏱️ Adjust your speed. Try to match the duration of the native pronunciation.");
  }
  
  if (scores.accentScore < 70) {
    tips.push("👂 Listen carefully to the native accent and try to mimic the sound patterns.");
  }
  
  if (tips.length === 0) {
    tips.push("✨ Great work! Keep practicing to maintain your skills.");
  }
  
  return tips;
}
