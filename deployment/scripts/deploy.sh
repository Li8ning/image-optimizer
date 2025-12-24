#!/bin/bash

# Deployment Script for Image Optimizer Application
# This script handles deployment to different environments

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
ENVIRONMENT="development"
SKIP_TESTS=false
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --env|-e)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --skip-tests|-s)
            SKIP_TESTS=true
            shift
            ;;
        --force|-f)
            FORCE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --env, -e <environment>  Deployment environment (development, staging, production)"
            echo "  --skip-tests, -s         Skip running tests"
            echo "  --force, -f              Force deployment without confirmation"
            echo "  --help, -h               Show this help message"
            exit 0
            ;;
        *)
            error_exit "Unknown option: $1"
            ;;
    esac
done

# Validate environment
case $ENVIRONMENT in
    development|dev)
        ENVIRONMENT="development"
        ;;
    staging|stage)
        ENVIRONMENT="staging"
        ;;
    production|prod)
        ENVIRONMENT="production"
        ;;
    *)
        error_exit "Invalid environment: $ENVIRONMENT. Must be one of: development, staging, production"
        ;;
esac

info "Starting deployment to $ENVIRONMENT environment..."

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    info "Loading environment variables from .env.$ENVIRONMENT"
    export $(grep -v '^#' ".env.$ENVIRONMENT" | xargs)
else
    error_exit "Environment file .env.$ENVIRONMENT not found"
fi

# Confirm deployment if not forced
if [ "$FORCE" = false ]; then
    read -p "Are you sure you want to deploy to $ENVIRONMENT? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Deployment cancelled by user"
        exit 0
    fi
fi

# Install dependencies
info "Installing dependencies..."
npm ci --production

# Run tests if not skipped
if [ "$SKIP_TESTS" = false ]; then
    info "Running tests..."
    npm test || error_exit "Tests failed"
    success "All tests passed"
else
    info "Skipping tests as requested"
fi

# Build application
info "Building application..."
npm run build || error_exit "Build failed"
success "Build completed successfully"

# Environment-specific deployment
case $ENVIRONMENT in
    development)
        info "Starting development server..."
        npm start
        ;;
    staging)
        info "Deploying to staging environment..."
        # Add your staging deployment commands here
        # Example: rsync, scp, or deployment service commands
        echo "Staging deployment would go here"
        success "Staging deployment completed"
        ;;
    production)
        info "Deploying to production environment..."
        # Add your production deployment commands here
        # Example: rsync, scp, or deployment service commands
        echo "Production deployment would go here"
        success "Production deployment completed"
        ;;
esac

success "Deployment to $ENVIRONMENT completed successfully!"