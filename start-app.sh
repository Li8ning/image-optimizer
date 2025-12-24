#!/bin/bash

# Simple script to start both frontend and backend
# Usage: ./start-app.sh [environment]

echo "Starting Image Optimizer Application..."

# Set default environment
ENV="development"

# Check if environment argument is provided
if [ "$1" ]; then
    ENV="$1"
fi

echo "Using environment: $ENV"

# Load environment variables
if [ -f ".env.$ENV" ]; then
    echo "Loading environment variables from .env.$ENV"
    export $(grep -v '^#' ".env.$ENV" | xargs)
    # Also copy to .env for dotenv to work
    cp ".env.$ENV" ".env"
else
    echo "Environment file .env.$ENV not found, using defaults"
    # Create default .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cp ".env.example" ".env"
    fi
fi

# Start both frontend and backend
echo "Starting frontend and backend..."
npm run start:full