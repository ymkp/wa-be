BUILD_CGO_ENABLED  := 0
SERVICE_NAME       := go-whatsapp-multidevice-rest
SERVICE_PORT       := 3000
IMAGE_NAME         := go-whatsapp-multidevice-rest
IMAGE_TAG          := latest

.PHONY:

.SILENT:

env-develop:
	ln -sf .env.development cmd/main/.env

clean-dbs:
	rm -f dbs/WhatsApp.db

clean-dist:
	rm -rf dist

clean-build:
	rm -f $(SERVICE_NAME)

clean:
	make clean-dbs
	make clean-dist
	make clean-build
	rm -rf vendor

vendor:
	make clean
	GO111MODULE=on go mod vendor

run:
	make vendor
	go run cmd/main/*.go

gen-docs:
	rm -rf docs/*
	swag init -g cmd/main/main.go --output docs

c-build:
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) --build-arg SERVICE_NAME=$(SERVICE_NAME) .

c-run:
	docker run -d -p $(SERVICE_PORT):$(SERVICE_PORT) --name $(SERVICE_NAME) --rm $(IMAGE_NAME):$(IMAGE_TAG)
	make c-logs

c-shell:
	docker exec -it $(SERVICE_NAME) bash

c-stop:
	docker stop $(SERVICE_NAME)

c-logs:
	docker logs $(SERVICE_NAME)

c-push:
	docker push $(IMAGE_NAME):$(IMAGE_TAG)

c-clean:
	docker rmi -f $(IMAGE_NAME):$(IMAGE_TAG)
