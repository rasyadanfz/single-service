start:
	@make network -i
	@make build
	@make up

network:
	docker network create app_network

stop:
	docker compose stop

build:
	docker compose build --no-cache

up:
	docker compose up -d