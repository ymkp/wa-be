# WhatsApp Admin Backend

### _This Whatsapp Worker is based on Whatsapp Web's API. This method of Whatsapp is not actually supported by Whatsapp. Please use it at your own risks!_

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
See deployment section for notes on how to deploy the project on a live system.

### Prerequisites

Prequisites packages to be installed globally:
- Node (Node js environment)
- NPM (Node Package Manager)
- pm2 (process manager)
- Go (Go Programming Language)
- Swag (Go Annotations Converter to Swagger Documentation)
- Make (Automated Execution using Makefile *optional)

### Installation

Below is the instructions to make this source code running:

1. Run the following command to pull packages for wa-be directory

```sh
npm run install
```
2. Copy .env.example as .env, and insert necessary info based on your environment
3. Run the following command to pull vendor packages on wa-worker directory

```sh
make vendor
# - OR -
go mod download
go mod vendor
```
4. Back to wa-be directory, and run the following command to start wa-be server
``` sh
npm run start
```


## API Access

You can access any endpoint under **HTTP_BASE_URL** environment variable which by default located at `.env` file.

Integrated API Documentation can be accessed in `<HTTP_BASE_URL>/<API_PREFIX>docs/` or by default it's in `localhost:PORT/api/v1/docs/`
