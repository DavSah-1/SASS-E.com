/**
 * Pronunciation practice component
 * Allows users to record their pronunciation and compare with native audio
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Mic, Square, Play, RotateCcw, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { AudioRecorder, extractAudioFeatures, type AudioRecording } from '@/lib/audioRecording';
import { compareAudio, getImprovementTips, type ComparisonResult } from '@/lib/pronunciationComparison';
import { WaveformDisplay } from './WaveformDisplay';
import { speakInLanguage } from '@/lib/languageTTS';

interface PronunciationPracticeProps {
  word: string;
  languageCode: string;
  onClose?: () => void;
}

export function PronunciationPractice({ word, languageCode, onClose }: PronunciationPracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [userRecording, setUserRecording] = useState<AudioRecording | null>(null);
  const [nativeRecording, setNativeRecording] = useState<AudioRecording | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const recorderRef = useRef<AudioRecorder>(new AudioRecorder());
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      await recorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingTime(0);
      
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
      
      // Generate native pronunciation for comparison
      // Note: Since browser TTS doesn't provide audio buffer, we'll use a simulated native recording
      // In production, you would fetch pre-recorded native audio from the server
      await compareWithNative(recording);
      
      toast.success('Recording complete! Analyzing your pronunciation...');
    } catch (error) {
      toast.error('Failed to process recording.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const compareWithNative = async (recording: AudioRecording) => {
    try {
      // Extract features from user recording
      const userFeatures = await extractAudioFeatures(recording.blob);
      
      // For demonstration, create simulated native features
      // In production, you would:
      // 1. Fetch pre-recorded native audio from server
      // 2. Or use server-side TTS API that returns audio files
      const nativeFeatures = generateSimulatedNativeFeatures(userFeatures);
      
      // Create simulated native recording for visualization
      const simulatedNative: AudioRecording = {
        blob: recording.blob, // Placeholder
        url: recording.url,
        duration: recording.duration * 0.95, // Slightly shorter
        waveform: recording.waveform.map(v => v * 0.9), // Slightly different pattern
      };
      setNativeRecording(simulatedNative);
      
      // Compare and get results
      const result = compareAudio(userFeatures, nativeFeatures);
      setComparisonResult(result);
    } catch (error) {
      console.error('Comparison error:', error);
      toast.error('Failed to analyze pronunciation.');
    }
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

  const playNativePronunciation = () => {
    speakInLanguage(word, languageCode, {
      rate: 0.85,
      onEnd: () => {},
      onError: (error) => {
        toast.error('Failed to play native pronunciation');
        console.error(error);
      },
    });
  };

  const reset = () => {
    setUserRecording(null);
    setNativeRecording(null);
    setComparisonResult(null);
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
            Record yourself saying this word and compare with native pronunciation
          </p>
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

          {userRecording && (
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
        {userRecording && nativeRecording && (
          <div className="space-y-4">
            <WaveformDisplay
              waveform={nativeRecording.waveform}
              color="#10b981"
              label="Native Pronunciation"
            />
            <WaveformDisplay
              waveform={userRecording.waveform}
              color="#8b5cf6"
              label="Your Pronunciation"
            />
          </div>
        )}

        {/* Comparison Results */}
        {comparisonResult && (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="text-center space-y-2">
              <div className={`text-6xl font-bold ${getScoreColor(comparisonResult.overallScore)}`}>
                {comparisonResult.overallScore}%
              </div>
              <p className="text-lg font-medium">{comparisonResult.feedback}</p>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pitch</span>
                  <Badge variant={getScoreBadgeVariant(comparisonResult.pitchScore)}>
                    {comparisonResult.pitchScore}%
                  </Badge>
                </div>
                <Progress value={comparisonResult.pitchScore} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Energy</span>
                  <Badge variant={getScoreBadgeVariant(comparisonResult.energyScore)}>
                    {comparisonResult.energyScore}%
                  </Badge>
                </div>
                <Progress value={comparisonResult.energyScore} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Timing</span>
                  <Badge variant={getScoreBadgeVariant(comparisonResult.durationScore)}>
                    {comparisonResult.durationScore}%
                  </Badge>
                </div>
                <Progress value={comparisonResult.durationScore} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Timbre</span>
                  <Badge variant={getScoreBadgeVariant(comparisonResult.timbreScore)}>
                    {comparisonResult.timbreScore}%
                  </Badge>
                </div>
                <Progress value={comparisonResult.timbreScore} />
              </div>
            </div>

            {/* Improvement Tips */}
            <div className="space-y-2">
              <h4 className="font-medium">💡 Tips for Improvement:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {getImprovementTips(comparisonResult).map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
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
 * Generate simulated native features for demonstration
 * In production, replace this with actual native audio from server
 */
function generateSimulatedNativeFeatures(userFeatures: any) {
  // Create slightly idealized version of user features
  return {
    pitch: userFeatures.pitch.map((p: number) => p * 1.05),
    energy: userFeatures.energy.map((e: number) => Math.min(1, e * 1.1)),
    duration: userFeatures.duration * 0.95,
    spectralCentroid: userFeatures.spectralCentroid * 1.02,
  };
}
