#!/bin/bash

# Health Check Script for Image Optimizer Application
# This script checks the health of the running application

# Exit immediately if any command fails
set -e

# Function to display error messages
function error_exit {
    echo "[ERROR] $1" 1>&2
    exit 1
}

# Function to display info messages
function info {
    echo "[INFO] $1"
}

# Function to display success messages
function success {
    echo "[SUCCESS] $1"
}

# Parse command line arguments
HEALTH_CHECK_URL="http://localhost:3001/health"
TIMEOUT=10
INTERVAL=5
MAX_RETRIES=3

while [[ $# -gt 0 ]]; do
    case $1 in
        --url|-u)
            HEALTH_CHECK_URL="$2"
            shift 2
            ;;
        --timeout|-t)
            TIMEOUT="$2"
            shift 2
            ;;
        --interval|-i)
            INTERVAL="$2"
            shift 2
            ;;
        --retries|-r)
            MAX_RETRIES="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --url, -u <url>          Health check endpoint URL"
            echo "  --timeout, -t <seconds>  Timeout for each health check in seconds"
            echo "  --interval, -i <seconds> Interval between retries in seconds"
            echo "  --retries, -r <count>    Maximum number of retries"
            echo "  --help, -h               Show this help message"
            exit 0
            ;;
        *)
            error_exit "Unknown option: $1"
            ;;
    esac
done

info "Starting health check for $HEALTH_CHECK_URL"
info "Timeout: $TIMEOUT seconds, Interval: $INTERVAL seconds, Max Retries: $MAX_RETRIES"

# Health check function
function check_health {
    local retry_count=0
    local success=false
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        info "Attempt $((retry_count + 1)) of $MAX_RETRIES"
        
        # Use curl to check health endpoint
        if curl --silent --fail --max-time $TIMEOUT "$HEALTH_CHECK_URL" > /dev/null; then
            success=true
            break
        fi
        
        retry_count=$((retry_count + 1))
        
        if [ $retry_count -lt $MAX_RETRIES ]; then
            info "Health check failed, retrying in $INTERVAL seconds..."
            sleep $INTERVAL
        fi
    done
    
    if [ "$success" = true ]; then
        success "Health check passed - application is running correctly"
        return 0
    else
        error_exit "Health check failed after $MAX_RETRIES attempts"
        return 1
    fi
}

# Run health check
check_health