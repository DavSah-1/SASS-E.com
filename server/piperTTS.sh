#!/bin/bash
# Unset Python environment variables to prevent interference
unset PYTHONPATH
unset PYTHONHOME
unset PYTHON HOME
# Execute with venv Python
exec /home/ubuntu/piper-venv/bin/python /home/ubuntu/sarcastic-ai-assistant/server/piperTTS.py "$@"
