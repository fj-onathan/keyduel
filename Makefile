SHELL := /bin/bash

COMPOSE_FILE     := infra/docker/docker-compose.yml
DEV_COMPOSE_FILE := docker-compose.dev.yml
MIGRATE_IMAGE := migrate/migrate:v4.18.3
MIGRATIONS_DIR := $(CURDIR)/server/migrations

ifneq (,$(wildcard .env))
include .env
export
endif

DATABASE_URL ?= postgres://typing_game:typing_game@localhost:5432/typing_game?sslmode=disable

.PHONY: help dev-up dev-down dev-logs dev-ps dev-rebuild infra-up infra-down infra-logs infra-ps server-api server-race server-bot client-dev client-build client-lint server-test server-lint migrate-up migrate-down seed-leaderboard-movement seed-snippets seed-bots test lint build check

help:
	@printf "Available targets:\n"
	@printf "\n  Full-stack dev (single command):\n"
	@printf "  dev-up        Start entire stack with hot-reload\n"
	@printf "  dev-down      Stop entire dev stack\n"
	@printf "  dev-logs      Tail all dev service logs\n"
	@printf "  dev-ps        Show dev container status\n"
	@printf "  dev-rebuild   Rebuild and restart dev containers\n"
	@printf "\n  Infrastructure only:\n"
	@printf "  infra-up      Start Postgres and Redis\n"
	@printf "  infra-down    Stop Postgres and Redis\n"
	@printf "  infra-logs    Tail infra logs\n"
	@printf "  infra-ps      Show infra container status\n"
	@printf "\n  Server (run individually):\n"
	@printf "  server-api    Run Go API service\n"
	@printf "  server-race   Run Go race-engine service\n"
	@printf "  server-bot    Run Go bot-runner service\n"
	@printf "\n  Client:\n"
	@printf "  client-dev    Run React development server\n"
	@printf "  client-build  Build frontend\n"
	@printf "  client-lint   Lint frontend\n"
	@printf "\n  Testing & CI:\n"
	@printf "  server-test   Run Go tests\n"
	@printf "  server-lint   Run Go vet checks\n"
	@printf "  test          Run backend tests (+frontend test if present)\n"
	@printf "  lint          Run backend and frontend lint checks\n"
	@printf "  build         Build frontend and verify Go compile\n"
	@printf "  check         Run lint + test + build\n"
	@printf "\n  Database:\n"
	@printf "  migrate-up    Apply database migrations\n"
	@printf "  migrate-down  Roll back one migration\n"
	@printf "  seed-leaderboard-movement  Seed weekly movement demo data\n"
	@printf "  seed-snippets              Seed typing race snippets for all languages\n"
	@printf "  seed-bots                  Seed bot users and historical race data\n"

## ─── Full-stack dev ────────────────────────────────────────────────

dev-up:
	docker compose -f $(DEV_COMPOSE_FILE) up --build

dev-down:
	docker compose -f $(DEV_COMPOSE_FILE) down

dev-logs:
	docker compose -f $(DEV_COMPOSE_FILE) logs -f

dev-ps:
	docker compose -f $(DEV_COMPOSE_FILE) ps

dev-rebuild:
	docker compose -f $(DEV_COMPOSE_FILE) up --build -d

## ─── Infrastructure only ──────────────────────────────────────────

infra-up:
	docker compose -f $(COMPOSE_FILE) up -d

infra-down:
	docker compose -f $(COMPOSE_FILE) down

infra-logs:
	docker compose -f $(COMPOSE_FILE) logs -f

infra-ps:
	docker compose -f $(COMPOSE_FILE) ps

server-api:
	go -C ./server run ./cmd/api

server-race:
	go -C ./server run ./cmd/race-engine

server-bot:
	go -C ./server run ./cmd/bot-runner

client-dev:
	npm --prefix ./client run dev

client-build:
	npm --prefix ./client run build

client-lint:
	npm --prefix ./client run lint

server-test:
	go -C ./server test ./...

server-lint:
	go -C ./server vet ./...

migrate-up:
	docker run --rm --network host -v "$(MIGRATIONS_DIR):/migrations" $(MIGRATE_IMAGE) -path=/migrations -database "$(DATABASE_URL)" up

migrate-down:
	docker run --rm --network host -v "$(MIGRATIONS_DIR):/migrations" $(MIGRATE_IMAGE) -path=/migrations -database "$(DATABASE_URL)" down 1

seed-leaderboard-movement:
	psql "$(DATABASE_URL)" -f ./server/scripts/seed_leaderboard_movement.sql

seed-snippets:
	psql "$(DATABASE_URL)" -f ./server/scripts/seed_snippets.sql

seed-bots:
	psql "$(DATABASE_URL)" -f ./server/scripts/seed_bots.sql

test:
	$(MAKE) server-test
	npm --prefix ./client run test --if-present

lint:
	$(MAKE) server-lint
	$(MAKE) client-lint

build:
	go -C ./server build ./cmd/api ./cmd/race-engine ./cmd/bot-runner
	$(MAKE) client-build

check:
	$(MAKE) lint
	$(MAKE) test
	$(MAKE) build
