#!/bin/bash

# Quick start script for transcript service

echo "🚀 Starting YouTube Transcript Service..."
echo ""

# Check if we're in the right directory
if [ ! -f "transcript-service/app.py" ]; then
    echo "❌ Error: Must run from project root directory"
    echo "   (where transcript-service folder is located)"
    exit 1
fi

# Navigate to service directory
cd transcript-service

# Check Python version
python_version=$(python3 --version 2>&1 | grep -oE '[0-9]+\.[0-9]+')
required_version="3.9"

if ! python3 -c "import sys; sys.exit(0 if sys.version_info >= (3,9) else 1)"; then
    echo "❌ Error: Python 3.9+ required (found: $python_version)"
    exit 1
fi

echo "✅ Python version: $(python3 --version)"

# Check if dependencies are installed
if ! python3 -c "import flask, flask_cors, youtube_transcript_api" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip3 install -r requirements.txt

    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ Dependencies installed"
echo ""
echo "🎬 Starting service on http://localhost:3006"
echo "   Press Ctrl+C to stop"
echo ""

# Start the service
python3 app.py
