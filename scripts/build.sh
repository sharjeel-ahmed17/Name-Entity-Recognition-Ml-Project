#!/bin/bash

# NER App Build Script
# Usage: ./scripts/build.sh [--push] [--tag TAG]

set -e

PUSH=false
TAG="latest"
REGISTRY="ghcr.io"
REPO="${REPO:-your-org/ner-app}"

while [[ $# -gt 0 ]]; do
    case $1 in
        --push)
            PUSH=true
            shift
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "🔨 Building NER App..."
echo "Registry: $REGISTRY"
echo "Repository: $REPO"
echo "Tag: $TAG"
echo "Push: $PUSH"
echo ""

# Build backend
echo "🔧 Building backend image..."
docker build \
    --file Dockerfile \
    --tag ${REGISTRY}/${REPO}:${TAG} \
    --tag ${REGISTRY}/${REPO}:latest \
    .

# Build frontend
echo "🎨 Building frontend image..."
docker build \
    --file ui/Dockerfile \
    --tag ${REGISTRY}/${REPO}-frontend:${TAG} \
    --tag ${REGISTRY}/${REPO}-frontend:latest \
    ./ui

# Push if requested
if [ "$PUSH" = true ]; then
    echo "📤 Pushing images..."
    docker push ${REGISTRY}/${REPO}:${TAG}
    docker push ${REGISTRY}/${REPO}:latest
    docker push ${REGISTRY}/${REPO}-frontend:${TAG}
    docker push ${REGISTRY}/${REPO}-frontend:latest
    echo "✅ Images pushed successfully!"
else
    echo "✅ Build complete!"
    echo ""
    echo "To push images, run: docker push ${REGISTRY}/${REPO}:${TAG}"
fi
