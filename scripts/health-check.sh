#!/bin/bash

# Health check and monitoring script

BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:8501}"
LOG_FILE="./logs/health-check.log"

mkdir -p ./logs

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_backend() {
    if curl -sf "$BACKEND_URL/health" > /dev/null 2>&1; then
        log "✓ Backend healthy"
        return 0
    else
        log "✗ Backend unhealthy"
        return 1
    fi
}

check_frontend() {
    if curl -sf "$FRONTEND_URL/_stcore/health" > /dev/null 2>&1; then
        log "✓ Frontend healthy"
        return 0
    else
        log "✗ Frontend unhealthy"
        return 1
    fi
}

check_api_endpoints() {
    # Test /labels endpoint
    if curl -sf "$BACKEND_URL/labels" > /dev/null 2>&1; then
        log "✓ API /labels endpoint working"
    else
        log "✗ API /labels endpoint failed"
    fi
    
    # Test /recognize endpoint
    if curl -sf -X POST "$BACKEND_URL/recognize" \
         -H "Content-Type: application/json" \
         -d '{"text": "Test"}' > /dev/null 2>&1; then
        log "✓ API /recognize endpoint working"
    else
        log "✗ API /recognize endpoint failed"
    fi
}

get_container_stats() {
    log "Container resource usage:"
    docker stats --no-stream ner-backend-dev ner-frontend-dev 2>/dev/null || \
    docker stats --no-stream ner-backend-prod ner-frontend-prod 2>/dev/null || \
    log "  No containers found"
}

main() {
    log "========== Health Check Started =========="
    
    check_backend
    backend_status=$?
    
    check_frontend
    frontend_status=$?
    
    check_api_endpoints
    
    get_container_stats
    
    log "========== Health Check Completed =========="
    
    if [ $backend_status -eq 0 ] && [ $frontend_status -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

main
