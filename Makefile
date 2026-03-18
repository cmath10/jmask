COMPOSE ?= docker compose
TARGET_HEADER = @echo -e '===== \e[34m' $@ '\e[0m'
UID ?= $(shell id -u)
GID ?= $(shell id -g)
YARN_NODE = UID=$(UID) GID=$(GID) $(COMPOSE) run --rm --no-deps node yarn
YARN_PLAYWRIGHT = UID=$(UID) GID=$(GID) $(COMPOSE) run --rm --no-deps playwright yarn

.PHONY: help
help: ## Show available recipes
	@cat $(MAKEFILE_LIST) | grep -e "^[a-zA-Z0-9_\-]*: *.*## *" | awk '\
	    BEGIN {FS = ":.*?## "}; {printf "\033[36m%-24s\033[0m %s\n", $$1, $$2}'

.PHONY: node_modules
node_modules: package.json yarn.lock ## Install dependencies in the node container
	$(TARGET_HEADER)
	@$(YARN_NODE) install --silent
	@touch node_modules || true

.PHONY: lint
lint: ## Run ESLint in the node container
	$(TARGET_HEADER)
	$(YARN_NODE) lint

.PHONY: build
build: ## Build the package in the node container
	$(TARGET_HEADER)
	$(YARN_NODE) build

.PHONY: typecheck
typecheck: ## Run TypeScript typecheck in the node container
	$(TARGET_HEADER)
	$(YARN_NODE) typecheck

.PHONY: test
test: ## Run unit and E2E tests in containers
	$(TARGET_HEADER)
	$(YARN_NODE) test:unit
	$(YARN_PLAYWRIGHT) test:e2e

.PHONY: test-unit
test-unit: ## Run unit tests in the node container
	$(TARGET_HEADER)
	$(YARN_NODE) test:unit

.PHONY: test-e2e
test-e2e: ## Run Playwright-backed E2E tests in the browser container
	$(TARGET_HEADER)
	$(YARN_PLAYWRIGHT) test:e2e

.PHONY: coverage
coverage: ## Run full merged coverage in the browser container
	$(TARGET_HEADER)
	$(YARN_PLAYWRIGHT) coverage

.PHONY: coverage-unit
coverage-unit: ## Run unit coverage in the node container
	$(TARGET_HEADER)
	$(YARN_NODE) coverage:unit

.PHONY: coverage-e2e
coverage-e2e: ## Run E2E coverage in the browser container
	$(TARGET_HEADER)
	$(YARN_PLAYWRIGHT) coverage:e2e

.PHONY: coverage-merge
coverage-merge: ## Merge raw coverage with nyc in the node container
	$(TARGET_HEADER)
	$(YARN_NODE) coverage:merge
