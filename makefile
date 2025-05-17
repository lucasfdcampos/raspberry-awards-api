# Env
ENV_FILE = .env
ENV_EXAMPLE = .env.example

.PHONY: install start test test-e2e test-cov check-env

# Install dependencies
install:
	yarn install

# Check that .env exists
check-env:
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "Creating .env from .env.example"; \
		cp $(ENV_EXAMPLE) $(ENV_FILE); \
	else \
		echo ".env already exists"; \
	fi

# Start the project
start: check-env
	yarn run start

# Execute Unit tests
test: check-env
	yarn run test

# Execute e2e tests
test-e2e: check-env
	yarn run test:e2e

# Execute coverage
test-cov: check-env
	yarn run test:cov