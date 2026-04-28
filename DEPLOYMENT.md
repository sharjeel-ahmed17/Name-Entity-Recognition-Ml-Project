# NER App Deployment Pipeline

Complete CI/CD pipeline for the Named Entity Recognition FastAPI + Streamlit application.

## Overview

This deployment pipeline includes:
- GitHub Actions workflows for build, test, and deploy
- Docker Compose for local development
- Kubernetes manifests for production deployment
- Automated image building and pushing
- Auto-scaling configuration

## Local Development

### Using Docker Compose

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

Services:
- Backend API: http://localhost:8000
- Frontend UI: http://localhost:8501
- API Docs: http://localhost:8000/docs

### Manual Setup

```bash
# Install dependencies
uv sync

# Run backend
uv run python main.py

# Run frontend (in another terminal)
uv run streamlit run app.py
```

## Building Images

### Using the build script

```bash
# Build locally
./scripts/build.sh

# Build and push to registry
./scripts/build.sh --push --tag v1.0.0 --registry ghcr.io
```

### Manual build

```bash
# Backend
docker build -f Dockerfile -t ner-backend:latest .

# Frontend
docker build -f ui/Dockerfile -t ner-frontend:latest ./ui
```

## GitHub Actions Workflows

### 1. Build and Test (`build-and-test.yml`)
Triggered on: push to `main`/`develop`, PRs

- Installs dependencies
- Runs tests
- Builds Docker images
- Validates Dockerfile

### 2. Build and Push (`build-and-push.yml`)
Triggered on: push to `main`, version tags

- Builds backend and frontend images
- Pushes to container registry (GHCR)
- Generates semantic version tags
- Uses layer caching for efficiency

### 3. Deploy to Kubernetes (`deploy-k8s.yml`)
Triggered on: push to `main`, version tags, manual workflow dispatch

- Configures kubeconfig from secrets
- Updates image tags in manifests
- Creates namespaces
- Applies deployments and services
- Waits for rollout completion
- Reports deployment status

## Kubernetes Deployment

### Prerequisites

1. Kubernetes cluster configured
2. kubeconfig saved as GitHub secret `KUBECONFIG` (base64 encoded)
3. Container registry configured

### Deploying manually

```bash
# Using the deployment script
./scripts/deploy.sh staging
./scripts/deploy.sh production

# Or using kubectl directly
kubectl apply -f k8s-production-config.yaml
kubectl apply -f k8s-backend-deployment.yaml
kubectl apply -f k8s-frontend-deployment.yaml
```

### Deployment files

- `k8s-backend-deployment.yaml`: Backend API deployment + service
- `k8s-frontend-deployment.yaml`: Streamlit frontend deployment + service
- `k8s-namespace-config-hpa.yaml`: Namespaces, ConfigMaps, HPA rules
- `k8s-network-policy.yaml`: Network policies for security
- `k8s-production-config.yaml`: Production ConfigMaps and HPA config

### Scaling

Auto-scaling is configured:
- **Backend**: 2-8 replicas, scales on CPU (70%) / Memory (80%)
- **Frontend**: 2-6 replicas, scales on CPU (75%) / Memory (80%)

View HPA status:
```bash
kubectl get hpa -n ner-app-production
```

## Environment Variables

### Backend (.env or secrets)
- `PORT`: Service port (default: 8000)
- `WORKERS`: uvicorn worker count

### Frontend (.env or secrets)
- `API_URL`: Backend API URL (e.g., http://ner-backend:8000)
- `STREAMLIT_SERVER_PORT`: Port (default: 8501)

## Secrets Setup

### GitHub Secrets required:
- `KUBECONFIG`: Base64-encoded kubeconfig file
- `REGISTRY_USERNAME`: Container registry username (optional)
- `REGISTRY_PASSWORD`: Container registry password (optional)

Encode kubeconfig:
```bash
base64 -i ~/.kube/config | tr -d '\n' | xclip -selection clipboard
```

## Monitoring and Debugging

### Check deployment status
```bash
kubectl get deployments -n ner-app-production
kubectl describe deployment ner-backend -n ner-app-production
```

### View logs
```bash
# Backend logs
kubectl logs -f deployment/ner-backend -n ner-app-production

# Frontend logs
kubectl logs -f deployment/ner-frontend -n ner-app-production
```

### Port forwarding
```bash
# Backend
kubectl port-forward svc/ner-backend 8000:8000 -n ner-app-production

# Frontend
kubectl port-forward svc/ner-frontend 8501:8501 -n ner-app-production
```

## Pipeline Workflow

1. **Push to repository**
   - Triggers build-and-test workflow
   - Tests pass, image builds successfully

2. **Tag release (v1.0.0)**
   - Triggers build-and-push workflow
   - Images built with version tag
   - Pushed to container registry

3. **Manual deployment or auto-deploy**
   - deploy-k8s workflow runs
   - Creates/updates Kubernetes resources
   - Monitors rollout

## Configuration

### Update image registry
Edit workflow files and Kubernetes manifests to change:
```yaml
image: ghcr.io/your-org/ner-app:latest
```

### Add environment variables
Update `k8s-production-config.yaml` ConfigMaps or deployment manifests.

### Adjust resources
Edit `k8s-backend-deployment.yaml` and `k8s-frontend-deployment.yaml` resource limits.

## Troubleshooting

### Build fails
- Check Python version (requires 3.12+)
- Verify uv.lock is up-to-date: `uv sync --frozen`
- Check Dockerfile paths and dependencies

### Kubernetes deployment fails
- Verify kubeconfig secret is correct
- Check namespace exists: `kubectl get ns | grep ner-app`
- View pod events: `kubectl describe pod <pod-name> -n ner-app-production`
- Check image pull: `kubectl get events -n ner-app-production`

### Container won't start
- Check image tag matches deployment manifest
- Verify port not in use
- Check resource limits not exceeded
- View logs: `kubectl logs <pod-name> -n ner-app-production`

## Next Steps

1. Configure GitHub secrets with kubeconfig
2. Update registry URL in workflows and manifests (search `your-registry`)
3. Create test suite in `tests/` directory
4. Set up ingress for frontend (optional)
5. Configure persistent storage for model caching (optional)
6. Add monitoring/logging (Prometheus, ELK, etc.)
