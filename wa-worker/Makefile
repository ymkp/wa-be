.PHONY:

.SILENT:

env-develop:
	ln -sf .env.development .env

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