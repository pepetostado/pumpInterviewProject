# Makefile (aided by gemini)
.PHONY: help dev dev-down prod prod-down logs test-api test-client test test-e2e test-all smoke-auth

COMPOSE := docker compose
COMPOSE_PROD := $(COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml

.DEFAULT_GOAL := help

help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "  dev          Start dev stack (hot reload) -> http://localhost:82"
	@echo "  dev-down     Stop dev stack"
	@echo "  prod         Start prod stack (no bind mounts) -> http://localhost:82"
	@echo "  prod-down    Stop prod stack"
	@echo "  logs         Follow dev stack logs"
	@echo "  test-api     Run API unit tests (api/)"
	@echo "  test-client  Run client unit tests (client/)"
	@echo "  test         Run API + client unit tests"
	@echo "  test-e2e     Playwright UI tests via nginx :82 (requires make dev)"
	@echo "  smoke-auth   Auth smoke via nginx :82 (requires make dev)"
	@echo "  test-all     Unit + e2e + smoke (requires make dev for last two)"
	@echo "  See pepe/sprint0/TESTS.md for the full map"

dev:
	$(COMPOSE) up --build

dev-down:
	$(COMPOSE) down

prod:
	$(COMPOSE_PROD) up --build

prod-down:
	$(COMPOSE_PROD) down

logs:
	$(COMPOSE) logs -f

test-api:
	cd api && npm test

test-client:
	cd client && npm test

test: test-api test-client

test-all: test-api test-client test-e2e smoke-auth

test-e2e:
	cd client && npm run test:e2e:install && npm run test:e2e

smoke-auth:
	bash scripts/smoke-auth.sh

