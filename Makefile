ifeq (yarn,$(firstword $(MAKECMDGOALS)))
  # use the rest as arguments for "run"
  RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and turn them into do-nothing targets
  $(eval $(RUN_ARGS):;@:)
endif

.PHONY: tests
env: ## Creates .env
	@cp .env.dist .env
	@echo "Done."

.PHONY: yarn
yarn: ## Executes yarn command. Example: make yarn install
	@docker-compose run --rm node yarn $(RUN_ARGS)

.PHONY: help
help: ## Lists recipes
	@echo "Recipes:"
	@cat $(MAKEFILE_LIST) | grep -e "^[a-zA-Z_\-]*: *.*## *" | awk '\
	    BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
