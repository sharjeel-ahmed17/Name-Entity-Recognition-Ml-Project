#!/bin/bash

# NER App Deployment Script
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
REGISTRY=${REGISTRY:-ghcr.io}
REPO=${REPO:-your-org/ner-app}
IMAGE_TAG=${IMAGE_TAG:-latest}

if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo "Usage: $0 [staging|production]"
    exit 1
fi

NAMESPACE="ner-app-${ENVIRONMENT}"

echo "🚀 Deploying to $ENVIRONMENT environment..."
echo "Registry: $REGISTRY"
echo "Repo: $REPO"
echo "Namespace: $NAMESPACE"

# Create namespace
echo "📦 Creating namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply configuration
echo "⚙️ Applying configuration..."
kubectl apply -f k8s-namespace-config-hpa.yaml -n $NAMESPACE

# Update and apply backend deployment
echo "🔧 Deploying backend..."
sed -e "s|image: .*ner-backend:.*|image: ${REGISTRY}/${REPO}:${IMAGE_TAG}|g" \
    k8s-backend-deployment.yaml | kubectl apply -f - -n $NAMESPACE

# Update and apply frontend deployment
echo "🎨 Deploying frontend..."
sed -e "s|image: .*ner-frontend:.*|image: ${REGISTRY}/${REPO}-frontend:${IMAGE_TAG}|g" \
    k8s-frontend-deployment.yaml | kubectl apply -f - -n $NAMESPACE

# Wait for rollout
echo "⏳ Waiting for deployments to be ready..."
kubectl rollout status deployment/ner-backend -n $NAMESPACE --timeout=5m
kubectl rollout status deployment/ner-frontend -n $NAMESPACE --timeout=5m

# Get deployment info
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Deployment Status:"
kubectl get deployments -n $NAMESPACE
echo ""
echo "🔗 Services:"
kubectl get services -n $NAMESPACE
echo ""
echo "🐳 Pods:"
kubectl get pods -n $NAMESPACE
