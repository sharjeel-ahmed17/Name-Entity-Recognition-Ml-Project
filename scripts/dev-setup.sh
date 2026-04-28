#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   NER Application - Development Setup  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

# Check Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose found\n${NC}"

# Start development environment
echo -e "${YELLOW}Starting development environment...${NC}\n"
docker compose -f docker-compose.dev.yml up -d --pull always

# Wait for services
echo -e "${YELLOW}Waiting for services to be healthy...${NC}\n"
for i in {1..60}; do
    backend_healthy=$(docker compose -f docker-compose.dev.yml ps | grep -c "healthy" || true)
    if [ "$backend_healthy" -ge 2 ]; then
        echo -e "${GREEN}✓ All services are healthy\n${NC}"
        break
    fi
    if [ $i -eq 60 ]; then
        echo -e "${RED}✗ Services failed to become healthy${NC}\n"
        docker compose -f docker-compose.dev.yml logs
        exit 1
    fi
    printf "."
    sleep 1
done

# Show logs
echo -e "${YELLOW}Service logs:${NC}\n"
docker compose -f docker-compose.dev.yml ps

# Test backend
echo -e "\n${YELLOW}Testing backend...${NC}"
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ Backend running at http://localhost:8000${NC}"
    echo -e "${GREEN}  API docs: http://localhost:8000/docs\n${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}\n"
fi

# Test frontend
echo -e "${YELLOW}Testing frontend...${NC}"
if curl -s http://localhost:8501/_stcore/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend running at http://localhost:8501\n${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}\n"
fi

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}Development environment ready!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Available commands:${NC}"
echo "  View logs:     docker compose -f docker-compose.dev.yml logs -f [service]"
echo "  Stop:          docker compose -f docker-compose.dev.yml down"
echo "  Rebuild:       docker compose -f docker-compose.dev.yml build --no-cache"
echo "  Shell access:  docker compose -f docker-compose.dev.yml exec backend bash\n"

echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Open http://localhost:8501 in your browser"
echo "  2. Backend API docs: http://localhost:8000/docs"
echo "  3. Edit files locally - changes auto-sync to containers"
