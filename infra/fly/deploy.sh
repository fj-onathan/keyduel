#!/usr/bin/env bash
set -euo pipefail

# Deploy all KeyDuel services to Fly.io
# Usage: ./infra/fly/deploy.sh [service]
# Examples:
#   ./infra/fly/deploy.sh          # deploy all services
#   ./infra/fly/deploy.sh api      # deploy only the API
#   ./infra/fly/deploy.sh race     # deploy only the race engine
#   ./infra/fly/deploy.sh client   # deploy only the client
#   ./infra/fly/deploy.sh bot      # deploy only the bot runner

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

deploy_api() {
  echo "==> Deploying keyduel-api..."
  fly deploy \
    --config infra/fly/api/fly.toml \
    --dockerfile infra/fly/api/Dockerfile \
    --wait-timeout 120
  echo "    keyduel-api deployed."
}

deploy_race() {
  echo "==> Deploying keyduel-race..."
  fly deploy \
    --config infra/fly/race-engine/fly.toml \
    --dockerfile infra/fly/race-engine/Dockerfile \
    --wait-timeout 120
  echo "    keyduel-race deployed."
}

deploy_client() {
  echo "==> Deploying keyduel-client..."
  fly deploy \
    --config infra/fly/client/fly.toml \
    --dockerfile infra/fly/client/Dockerfile \
    --wait-timeout 120
  echo "    keyduel-client deployed."
}

deploy_bot() {
  echo "==> Deploying keyduel-bot..."
  fly deploy \
    --config infra/fly/bot-runner/fly.toml \
    --dockerfile infra/fly/bot-runner/Dockerfile \
    --wait-timeout 120
  echo "    keyduel-bot deployed."
}

case "${1:-all}" in
  api)
    deploy_api
    ;;
  race)
    deploy_race
    ;;
  client)
    deploy_client
    ;;
  bot)
    deploy_bot
    ;;
  all)
    deploy_api
    deploy_race
    deploy_client
    deploy_bot
    echo "==> All services deployed successfully."
    ;;
  *)
    echo "Usage: $0 [api|race|client|bot|all]"
    exit 1
    ;;
esac
