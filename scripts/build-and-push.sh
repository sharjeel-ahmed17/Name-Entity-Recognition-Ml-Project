#!/bin/bash
set -e

# Build and push Docker images

DOCKER_HUB_USERNAME=${DOCKER_HUB_USERNAME:-your_username}
BACKEND_IMAGE="${DOCKER_HUB_USERNAME}/ner-backend"
FRONTEND_IMAGE="${DOCKER_HUB_USERNAME}/ner-frontend"
TAG=${1:-latest}

echo "Building and pushing Docker images..."
echo "Backend: $BACKEND_IMAGE:$TAG"
echo "Frontend: $FRONTEND_IMAGE:$TAG"
echo ""

# Login to Docker Hub
echo "Logging in to Docker Hub..."
docker login

# Build backend
echo "Building backend image..."
docker build -t "$BACKEND_IMAGE:$TAG" -f Dockerfile .
docker tag "$BACKEND_IMAGE:$TAG" "$BACKEND_IMAGE:latest"

# Build frontend
echo "Building frontend image..."
docker build -t "$FRONTEND_IMAGE:$TAG" -f ui/Dockerfile ./ui
docker tag "$FRONTEND_IMAGE:$TAG" "$FRONTEND_IMAGE:latest"

# Push images
echo "Pushing backend image..."
docker push "$BACKEND_IMAGE:$TAG"
docker push "$BACKEND_IMAGE:latest"

echo "Pushing frontend image..."
docker push "$FRONTEND_IMAGE:$TAG"
docker push "$FRONTEND_IMAGE:latest"

echo "Done!"
