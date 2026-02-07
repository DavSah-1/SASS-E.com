#!/usr/bin/env python3
"""
Piper TTS Module for Language Learning
Provides high-quality text-to-speech synthesis with caching
"""

import os
import sys
import json
import hashlib
import subprocess
from pathlib import Path
from typing import Optional, Dict

# Configuration
VOICES_DIR = Path("/home/ubuntu/piper-voices")
CACHE_DIR = Path("/home/ubuntu/sarcastic-ai-assistant/server/tts-cache")
CACHE_DIR.mkdir(exist_ok=True)

# Language to voice model mapping
VOICE_MODELS: Dict[str, str] = {
    "es": "es_ES-davefx-medium",
    "es-ES": "es_ES-davefx-medium",
    "fr": "fr_FR-siwis-medium",
    "fr-FR": "fr_FR-siwis-medium",
    "de": "de_DE-thorsten-medium",
    "de-DE": "de_DE-thorsten-medium",
    "it": "it_IT-riccardo-x_low",
    "it-IT": "it_IT-riccardo-x_low",
}


def get_cache_key(text: str, language: str, speed: float) -> str:
    """Generate cache key for audio file"""
    content = f"{text}|{language}|{speed}"
    return hashlib.md5(content.encode()).hexdigest()


def get_cached_audio(cache_key: str) -> Optional[bytes]:
    """Retrieve cached audio if available"""
    cache_file = CACHE_DIR / f"{cache_key}.wav"
    if cache_file.exists():
        return cache_file.read_bytes()
    return None


def save_to_cache(cache_key: str, audio_data: bytes) -> None:
    """Save audio to cache"""
    cache_file = CACHE_DIR / f"{cache_key}.wav"
    cache_file.write_bytes(audio_data)


def generate_speech(text: str, language: str, speed: float = 1.0) -> Optional[bytes]:
    """
    Generate speech using Piper TTS
    
    Args:
        text: Text to synthesize
        language: Language code (e.g., 'es', 'fr', 'de', 'it')
        speed: Speech speed multiplier (0.5-2.0)
    
    Returns:
        WAV audio data as bytes, or None if generation fails
    """
    # Check cache first
    cache_key = get_cache_key(text, language, speed)
    cached = get_cached_audio(cache_key)
    if cached:
        return cached
    
    # Get voice model for language
    voice_model = VOICE_MODELS.get(language)
    if not voice_model:
        print(f"[Piper TTS] Unsupported language: {language}", file=sys.stderr)
        return None
    
    model_file = VOICES_DIR / f"{voice_model}.onnx"
    if not model_file.exists():
        print(f"[Piper TTS] Model not found: {model_file}", file=sys.stderr)
        return None
    
    try:
        # Generate audio using piper
        # Piper outputs to stdout, we capture it
        cmd = [
            "piper",
            "--model", str(model_file),
            "--output_raw",
        ]
        
        # Add length scale for speed control (inverse of speed)
        # Lower length_scale = faster speech
        if speed != 1.0:
            length_scale = 1.0 / speed
            cmd.extend(["--length_scale", str(length_scale)])
        
        result = subprocess.run(
            cmd,
            input=text.encode('utf-8'),
            capture_output=True,
            check=True,
            timeout=10
        )
        
        # Piper outputs raw PCM, we need to add WAV header
        pcm_data = result.stdout
        wav_data = create_wav_header(pcm_data) + pcm_data
        
        # Cache the result
        save_to_cache(cache_key, wav_data)
        
        return wav_data
        
    except subprocess.TimeoutExpired:
        print(f"[Piper TTS] Timeout generating speech for: {text[:50]}", file=sys.stderr)
        return None
    except subprocess.CalledProcessError as e:
        print(f"[Piper TTS] Error: {e.stderr.decode()}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"[Piper TTS] Unexpected error: {e}", file=sys.stderr)
        return None


def create_wav_header(pcm_data: bytes, sample_rate: int = 22050, channels: int = 1, bits_per_sample: int = 16) -> bytes:
    """Create WAV file header for PCM data"""
    import struct
    
    # Calculate sizes
    byte_rate = sample_rate * channels * bits_per_sample // 8
    block_align = channels * bits_per_sample // 8
    data_size = len(pcm_data)
    file_size = data_size + 36
    
    # Build WAV header
    header = b''
    header += b'RIFF'
    header += struct.pack('<I', file_size)
    header += b'WAVE'
    header += b'fmt '
    header += struct.pack('<I', 16)  # fmt chunk size
    header += struct.pack('<H', 1)   # PCM format
    header += struct.pack('<H', channels)
    header += struct.pack('<I', sample_rate)
    header += struct.pack('<I', byte_rate)
    header += struct.pack('<H', block_align)
    header += struct.pack('<H', bits_per_sample)
    header += b'data'
    header += struct.pack('<I', data_size)
    
    return header


def clear_cache() -> int:
    """Clear all cached audio files. Returns number of files deleted."""
    count = 0
    for cache_file in CACHE_DIR.glob("*.wav"):
        cache_file.unlink()
        count += 1
    return count


def get_cache_stats() -> Dict[str, any]:
    """Get cache statistics"""
    files = list(CACHE_DIR.glob("*.wav"))
    total_size = sum(f.stat().st_size for f in files)
    return {
        "file_count": len(files),
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "cache_dir": str(CACHE_DIR),
    }


if __name__ == "__main__":
    # Check if being called from Node.js wrapper or command line
    if len(sys.argv) < 3:
        print("Usage: python piperTTS.py <language> <text> [speed]")
        print("Example: python piperTTS.py es 'Hola mundo' 1.0")
        sys.exit(1)
    
    lang = sys.argv[1]
    text = sys.argv[2]
    speed = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
    
    # Generate audio
    audio = generate_speech(text, lang, speed)
    
    if audio:
        # Output to stdout for Node.js wrapper
        sys.stdout.buffer.write(audio)
        sys.stdout.buffer.flush()
    else:
        print("Failed to generate audio", file=sys.stderr)
        sys.exit(1)
