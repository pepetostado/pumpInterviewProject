# Makefile (aided by gemini)
.PHONY: help dev dev-down prod prod-down logs test-api smoke-auth

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
	@echo "  smoke-auth   Auth smoke via nginx :82 (requires make dev)"

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

smoke-auth:
	bash scripts/smoke-auth.sh

# will add client tests later (when client is ready)
