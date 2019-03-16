STAGE           ?= dev
export STAGE

start: node_modules
	npm start

watch: node_modules
	npm run start:watch

node_modules:
	npm install

build: node_modules
	npm run build

test: node_modules lint
	npm test

lint: node_modules
	npm run lint

fix: node_modules
	npm run lint:fix

offline: build
	npm run offline

deploy:
	npm run deploy