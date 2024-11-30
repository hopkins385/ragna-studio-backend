#!/bin/bash

# Exit on any error
set -e

# Configuration
IMAGE_NAME="ghcr.io/hopkins385/ragna-studio-backend"
TAG="latest"
DOCKERFILE="Dockerfile"

# Print status
echo "Building $IMAGE_NAME:$TAG..."

# Build with cache optimizations and platform specification
docker build \
  --tag "$IMAGE_NAME:$TAG" \
  --file "$DOCKERFILE" \
  --platform linux/amd64 \
  .

echo "Build successful! Image: $IMAGE_NAME:$TAG"

# Push to registry
# echo $CR_PAT | docker login ghcr.io -u hopkins385 --password-stdin
# docker push "$IMAGE_NAME:$TAG"