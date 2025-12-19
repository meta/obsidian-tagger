#!/bin/bash

# Obsidian Tagger CLI Runner
# This script runs the Obsidian Tagger CLI tool

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if OBSIDIAN_VAULT_PATH is set
if [ -z "$OBSIDIAN_VAULT_PATH" ]; then
  echo -e "${RED}Error: OBSIDIAN_VAULT_PATH environment variable is not set${NC}"
  echo -e "${YELLOW}Please set it in your shell profile (~/.zshrc or ~/.bashrc):${NC}"
  echo -e "  export OBSIDIAN_VAULT_PATH=\"/path/to/your/obsidian/vault\""
  echo ""
  echo -e "${YELLOW}Or set it temporarily for this session:${NC}"
  echo -e "  export OBSIDIAN_VAULT_PATH=\"/path/to/your/obsidian/vault\""
  exit 1
fi

# Check if vault path exists
if [ ! -d "$OBSIDIAN_VAULT_PATH" ]; then
  echo -e "${RED}Error: Vault path does not exist: $OBSIDIAN_VAULT_PATH${NC}"
  exit 1
fi

# Display vault path
echo -e "${GREEN}Using Obsidian vault: $OBSIDIAN_VAULT_PATH${NC}"
echo ""

# Run the CLI tool
npm run dev
