#!make
#----------------------------------------
# Settings
#----------------------------------------
.DEFAULT_GOAL := help
#--------------------------------------------------
# Variables
#--------------------------------------------------
ifeq ($(shell uname -s),Darwin)
    ENTRY_POINT=/usr/local/bin/cellenics
else
    ENTRY_POINT=/usr/bin/cellenics
endif

#--------------------------------------------------
# Targets
#--------------------------------------------------
install: clean ## Creates venv, and adds cellenics as system command
	@echo "==> Instaling dependencies..."
	@cd e2e && npm install
	@echo "    [✓]"
	@echo

test:
	@echo "==> Running tests on development environment..."
	cd e2e && K8S_ENV=development npm run dev
	@echo "    [✓]"
	@echo

test-staging:
	@echo "==> Running tests on staging environment..."
	cd e2e && K8S_ENV=staging npm run dev
	@echo "    [✓]"
	@echo

test-production:
	@echo "==> Running tests on production environment..."
	cd e2e && K8S_ENV=production npm run dev
	@echo "    [✓]"
	@echo

clean: ## Cleans up temporary files
	@echo "==> Cleaning up node modules ..."
	@rm -rf node_modules
	@echo "    [✓]"
	@echo ""

.PHONY: install test clean help
help: ## Shows available targets
	@fgrep -h "## " $(MAKEFILE_LIST) | fgrep -v fgrep | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-13s\033[0m %s\n", $$1, $$2}'
