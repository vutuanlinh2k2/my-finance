#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Checking Supabase...${NC}"

# 1. Check Docker
if ! docker ps > /dev/null 2>&1; then
  echo -e "${RED}ERROR: Docker is not running${NC}"
  echo "Please start Docker Desktop and try again."
  exit 1
fi

# 2. Check if Supabase is already running for this project
if npx supabase status > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Supabase is already running${NC}"
  exit 0
fi

# 3. Clean up any orphaned containers
echo -e "${YELLOW}Starting Supabase...${NC}"
npx supabase stop 2>/dev/null || true

# 4. Start Supabase
npx supabase start

echo -e "${GREEN}✓ Supabase started successfully${NC}"
