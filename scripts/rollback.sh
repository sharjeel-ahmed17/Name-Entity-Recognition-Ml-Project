#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== NER Application Rollback ===${NC}\n"

if [ ! -f .env ]; then
    echo -e "${RED}.env file not found${NC}"
    exit 1
fi

source .env

# Check if backup exists
if [ ! -f docker-compose.prod.yml.bak ]; then
    echo -e "${RED}No backup found. Cannot rollback.${NC}"
    exit 1
fi

echo -e "${YELLOW}Rolling back to previous version...${NC}"

# Restore backup
cp docker-compose.prod.yml.bak docker-compose.prod.yml

# Stop current containers
echo -e "${YELLOW}Stopping current containers...${NC}"
docker compose -f docker-compose.prod.yml down

# Start with previous version
echo -e "${YELLOW}Starting previous version...${NC}"
docker compose -f docker-compose.prod.yml up -d

# Wait for services
echo -e "${YELLOW}Waiting for services...${NC}"
sleep 10

# Test
echo -e "${YELLOW}Testing endpoints...${NC}"
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ Rollback successful${NC}"
else
    echo -e "${RED}✗ Rollback verification failed${NC}"
    exit 1
fi
