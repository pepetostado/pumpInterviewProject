# Makefile (aided by gemini)
.PHONY: help dev-up dev-down prod-up prod-down logs

COMPOSE := docker compose
COMPOSE_PROD := $(COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml

.DEFAULT_GOAL := help

help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "  dev-up     Start dev stack (hot reload) -> http://localhost:82"
	@echo "  dev-down   Stop dev stack"
	@echo "  prod-up    Start prod stack (no bind mounts) -> http://localhost:82"
	@echo "  prod-down  Stop prod stack"
	@echo "  logs       Follow dev stack logs"

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
