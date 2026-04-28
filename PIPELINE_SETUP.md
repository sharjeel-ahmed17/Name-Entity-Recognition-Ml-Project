# Deployment Pipeline Documentation

## Overview

This deployment pipeline provides a complete CI/CD workflow for the NER application with:
- **Automated builds** on push to main/develop branches
- **Security scanning** with Trivy
- **Multi-stage testing** (unit tests, linting)
- **Docker image push** to Docker Hub
- **Production deployment** scripts
- **Health monitoring** and rollback capabilities

## Architecture

```
Developer Push
    ↓
GitHub Actions Workflow
    ├─ Build Backend (parallel)
    ├─ Build Frontend (parallel)
    ├─ Test Backend
    ├─ Security Scan
    └─ Deploy (only on main branch)
    ↓
Docker Hub Registry
    ↓
Production Server (via deploy.sh)
```

## Setup Instructions

### 1. Configure GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `DOCKER_HUB_USERNAME`: Your Docker Hub username
- `DOCKER_HUB_PASSWORD`: Your Docker Hub personal access token
- `SLACK_WEBHOOK`: (Optional) Slack webhook URL for notifications

### 2. Environment Setup

Copy the production environment file:
```bash
cp .env.production .env
# Edit .env with your credentials
```

### 3. Make Scripts Executable

```bash
chmod +x scripts/deploy.sh
chmod +x scripts/rollback.sh
chmod +x scripts/dev-setup.sh
chmod +x scripts/build-and-push.sh
chmod +x scripts/health-check.sh
```

## Workflow Files

### `.github/workflows/build-and-deploy.yml`

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- On changes to source files, Dockerfiles, or dependencies

**Jobs:**
1. **build-backend**: Multi-stage build with Docker Buildx, caching
2. **build-frontend**: Frontend build and push
3. **test-backend**: Runs pytest and flake8 linting
4. **security-scan**: Trivy vulnerability scanning
5. **deploy**: Triggers production deployment (main branch only)

**Image Tagging Strategy:**
- `latest` - Latest on default branch (main)
- `develop` - Latest on develop branch
- `main-<short-sha>` - Branch + commit SHA
- Semantic versioning support (when using git tags)

## Deployment

### Development Deployment

Start the development environment with hot reload:

```bash
./scripts/dev-setup.sh
```

This uses `docker-compose.dev.yml` with:
- Volume mounts for live code reload
- `develop: watch` for automatic rebuilds
- Health checks enabled

### Production Deployment

Deploy to production:

```bash
./scripts/deploy.sh
```

This:
1. Loads `.env` configuration
2. Pulls latest images from Docker Hub
3. Stops existing containers gracefully
4. Starts new containers with resource limits
5. Waits for health checks to pass
6. Tests endpoints
7. Shows service status

Resource Limits (in `docker-compose.prod.yml`):
- **Backend**: 1 CPU / 2GB memory (limit), 0.5 CPU / 1GB memory (reserved)
- **Frontend**: 1 CPU / 1GB memory (limit), 0.5 CPU / 512MB memory (reserved)

### Rollback

If deployment fails, rollback to previous version:

```bash
./scripts/rollback.sh
```

Requires a backup of the previous `docker-compose.prod.yml`.

## Deployment Strategies

### 1. Rolling Deployment (Manual)

```bash
# 1. Build and push new images
./scripts/build-and-push.sh v1.2.3

# 2. Update DOCKER_HUB_USERNAME in .env
# 3. Deploy
./scripts/deploy.sh
```

### 2. Automated (GitHub Actions)

Push to `main` branch:
```bash
git push origin main
```

Workflow automatically:
1. Builds and tests images
2. Pushes to Docker Hub
3. Triggers deployment notification

### 3. Blue-Green Deployment

For zero-downtime:
```bash
# Start new services on different ports
API_PORT=8002 STREAMLIT_PORT=8502 docker compose -f docker-compose.prod.yml up -d

# Test new version
./scripts/health-check.sh

# Switch traffic (nginx/load balancer config needed)
# Stop old version
docker compose -f docker-compose.prod.yml down
```

## Monitoring & Health Checks

### Manual Health Check

```bash
./scripts/health-check.sh
```

Checks:
- Backend health endpoint (`/health`)
- Frontend health endpoint (`/_stcore/health`)
- API functionality (`/labels`, `/recognize`)
- Container resource usage

### Continuous Monitoring

Add to crontab for periodic health checks:
```bash
*/5 * * * * /home/user/ner-app/scripts/health-check.sh
```

## Docker Hub Integration

Images are pushed with multiple tags:

**Backend:**
- `username/ner-backend:latest`
- `username/ner-backend:main-abc123f`
- `username/ner-backend:v1.0.0` (from git tags)

**Frontend:**
- `username/ner-frontend:latest`
- `username/ner-frontend:main-abc123f`
- `username/ner-frontend:v1.0.0`

## Build Cache Strategy

GitHub Actions uses two-level caching:

1. **GitHub Actions Cache** (`type=gha`)
   - Stores layer cache between workflows
   - 5GB per repo, 7-day retention
   - Saves significant build time

2. **Docker Registry Cache**
   - `docker pull --all-platforms` pulls cached layers
   - Used for multi-architecture builds

## Security

### Trivy Scanning

Scans for:
- Known vulnerabilities in base images
- Dependency vulnerabilities
- Misconfigurations

Results uploaded to GitHub Security tab (SARIF format).

### Best Practices Implemented

- Non-root users in containers (app/streamlit)
- Health checks for all services
- Resource limits to prevent DoS
- Minimal base images (python:3.12-slim)
- No secrets in images (use environment variables)

## Troubleshooting

### Build Fails

1. Check GitHub Actions logs: **Actions** tab → workflow run
2. Common issues:
   - Docker Hub credentials invalid
   - Insufficient disk space in runner
   - Dependency lock file out of sync

### Deployment Fails

```bash
# Check service logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend

# Check resource availability
docker stats

# Verify images exist locally
docker images | grep ner-
```

### Health Checks Failing

```bash
# Test backend directly
curl http://localhost:8000/health
curl http://localhost:8000/docs

# Test frontend directly
curl http://localhost:8501/_stcore/health

# View container logs
docker logs ner-backend-prod
docker logs ner-frontend-prod
```

## Advanced Configuration

### Environment Variables by Environment

**.env.production** - for production deployments
**.env.development** - for development
**.env.staging** - for staging (optional)

### Custom Deployment Hooks

Extend `scripts/deploy.sh` to:
- Run database migrations
- Clear caches
- Notify monitoring systems
- Run smoke tests
- Update DNS records

### CI/CD Pipeline Extensions

Add to `.github/workflows/build-and-deploy.yml`:
- OWASP dependency scanning
- Code quality analysis (SonarQube)
- Performance benchmarking
- Automated changelog generation
- Auto-scaling triggers

## Cost Optimization

### GitHub Actions

- Free tier: 2000 minutes/month (Ubuntu)
- Parallel jobs reduce total time
- Cache reduces rebuild time (saves credits)

### Docker Hub

- Free tier: 1 private repo
- Registry rates: 100 pulls/6 hours (per IP)
- Consider self-hosted registry for high volume

### Production Server

Resource limits prevent runaway containers:
- CPU limit: 1 per service
- Memory limit: 2GB per service
- Restart policy: `always`

## References

- GitHub Actions: https://docs.github.com/en/actions
- Docker Build Cloud: https://docs.docker.com/build-cloud/
- Docker Compose: https://docs.docker.com/compose/
- Trivy Security Scanner: https://github.com/aquasecurity/trivy
- Docker Hub: https://hub.docker.com
