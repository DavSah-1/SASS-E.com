/**
 * Node.js wrapper for Piper TTS Python module
 * Provides TypeScript interface to call Python TTS generation
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PIPER_SCRIPT = path.join(__dirname, 'piperTTS.py');

export interface TTSOptions {
  text: string;
  language: string;
  speed?: number;
}

export interface TTSResult {
  success: boolean;
  audio?: Buffer;
  error?: string;
}

/**
 * Generate speech using Piper TTS
 * @param options TTS generation options
 * @returns Promise with audio buffer or error
 */
export async function generateSpeech(options: TTSOptions): Promise<TTSResult> {
  const { text, language, speed = 1.0 } = options;

  return new Promise((resolve) => {
    const args = [PIPER_SCRIPT, language, text, speed.toString()];
    const python = spawn('python3.11', args, {
      cwd: path.dirname(PIPER_SCRIPT),
    });

    const chunks: Buffer[] = [];
    const errorChunks: Buffer[] = [];

    python.stdout.on('data', (data: Buffer) => {
      chunks.push(data);
    });

    python.stderr.on('data', (data: Buffer) => {
      errorChunks.push(data);
    });

    python.on('close', (code) => {
      if (code === 0 && chunks.length > 0) {
        const audio = Buffer.concat(chunks);
        resolve({ success: true, audio });
      } else {
        const error = Buffer.concat(errorChunks).toString('utf-8');
        console.error('[Piper TTS Wrapper] Error:', error);
        resolve({
          success: false,
          error: error || `Process exited with code ${code}`,
        });
      }
    });

    python.on('error', (err) => {
      console.error('[Piper TTS Wrapper] Spawn error:', err);
      resolve({
        success: false,
        error: err.message,
      });
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      python.kill();
      resolve({
        success: false,
        error: 'TTS generation timeout',
      });
    }, 10000);
  });
}

/**
 * Get cache statistics from Python module
 */
export async function getCacheStats(): Promise<any> {
  return new Promise((resolve) => {
    const python = spawn('python3.11', [
      '-c',
      `
import sys
sys.path.insert(0, '${path.dirname(PIPER_SCRIPT)}')
from piperTTS import get_cache_stats
import json
print(json.dumps(get_cache_stats()))
      `.trim(),
    ]);

    let output = '';
    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.on('close', () => {
      try {
        resolve(JSON.parse(output));
      } catch {
        resolve({ error: 'Failed to get cache stats' });
      }
    });
  });
}

/**
 * Clear TTS cache
 */
export async function clearCache(): Promise<number> {
  return new Promise((resolve) => {
    const python = spawn('python3.11', [
      '-c',
      `
import sys
sys.path.insert(0, '${path.dirname(PIPER_SCRIPT)}')
from piperTTS import clear_cache
print(clear_cache())
      `.trim(),
    ]);

    let output = '';
    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.on('close', () => {
      resolve(parseInt(output.trim()) || 0);
    });
  });
}
