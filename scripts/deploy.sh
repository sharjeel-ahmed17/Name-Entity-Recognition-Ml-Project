#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== NER Application Deployment ===${NC}\n"

# Load environment
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}Please update .env with your credentials${NC}"
    exit 1
fi

source .env

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker found${NC}\n"

# Pull latest images
echo -e "${YELLOW}Pulling latest images...${NC}"
docker compose -f docker-compose.prod.yml pull

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker compose -f docker-compose.prod.yml down || true

# Start services
echo -e "${YELLOW}Starting services...${NC}"
docker compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to become healthy...${NC}"
for i in {1..30}; do
    if docker compose -f docker-compose.prod.yml ps | grep -q "healthy"; then
        echo -e "${GREEN}✓ Services are healthy${NC}\n"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Services failed to become healthy${NC}"
        docker compose -f docker-compose.prod.yml logs
        exit 1
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

# Test endpoints
echo -e "${YELLOW}Testing endpoints...${NC}\n"

echo "Backend health check:"
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi

echo -e "\nFrontend health check:"
if curl -s http://localhost:8501/_stcore/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
fi

# Show status
echo -e "\n${GREEN}=== Deployment Complete ===${NC}\n"
docker compose -f docker-compose.prod.yml ps

echo -e "\n${GREEN}Access the application:${NC}"
echo "  Frontend: http://localhost:8501"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
