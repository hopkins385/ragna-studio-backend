#!/bin/bash

# Exit on any error
set -e

# Parse command line arguments
AUTO_CONFIRM=false
while getopts "y" opt; do
  case $opt in
    y)
      AUTO_CONFIRM=true
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

# Configuration
IMAGE_NAME="ghcr.io/hopkins385/ragna-studio-backend"
TAG="latest"
DOCKERFILE="Dockerfile"

# Print status
echo "Building $IMAGE_NAME:$TAG..."

# Build image
#   --no-cache \
docker build \
  --tag "$IMAGE_NAME:$TAG" \
  --file "$DOCKERFILE" \
  --platform linux/amd64 \
  --secret id=npmrc,src=.npmrc \
  .

echo "Build successful! Image: $IMAGE_NAME:$TAG"

# Handle image push confirmation
if [[ "$AUTO_CONFIRM" == true ]]; then
  PUSH_CONFIRMATION="y"
  echo "Auto-confirming push due to -y flag"
else
  # Ask user for confirmation before pushing
  read -p "Do you want to push the image to the registry? (y/N): " PUSH_CONFIRMATION
fi

if [[ "$PUSH_CONFIRMATION" =~ ^[Yy]$ ]]; then
  # Push to registry
  echo $CR_PAT | docker login ghcr.io -u hopkins385 --password-stdin
  docker push "$IMAGE_NAME:$TAG"
  echo "Image successfully pushed to registry."
else
  echo "Image push canceled."
fi