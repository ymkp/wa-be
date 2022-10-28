# WhatsApp Admin Backend

## _This Whatsapp Worker is based on Whatsapp Web's API. This method of Whatsapp is not actually supported by Whatsapp. Please use it at your own risks_

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
See deployment section for notes on how to deploy the project on a live system.

### Prerequisites

Prequisites packages:

- Go (Go Programming Language)
- Swag (Go Annotations Converter to Swagger Documentation)
- Make (Automated Execution using Makefile)

### Deployment

Below is the instructions to make this source code running:

1. Run following command to pull vendor packages

```sh
make vendor
```

2. Link or copy environment variables file

```sh
ln -sf .env.development .env
# - OR -
cp .env.development .env
# - OR -
make env-develop
```

6. Until this step you already can run this code by using this command

```sh
make run
```

7. _(Optional)_ Use following command to build this code into binary spesific platform

```sh
make build
```

8. _(Optional)_ To make mass binaries distribution you can use following command

```sh
make release
```

9. Now it should be accessible in your machine by accessing `localhost:3000/api/v1/whatsapp` or `127.0.0.1:3000/api/v1/whatsapp`

10. Try to use integrated API docs that accesible in `localhost:3000/api/v1/whatsapp/docs/` or `127.0.0.1:3000/api/v1/whatsapp/docs/`

## API Access

You can access any endpoint under **HTTP_BASE_URL** environment variable which by default located at `.env` file.

Integrated API Documentation can be accessed in `<HTTP_BASE_URL>/docs/` or by default it's in `localhost:3000/api/v1/whatsapp/docs/` or `127.0.0.1:3000/api/v1/whatsapp/docs/`
