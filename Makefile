STAGE           ?= local

start: node_modules
	npm start

node_modules:
	npm install

test: node_modules lint
	npm test

lint: node_modules
	npm run lint

fix: node_modules
	npm run lint:fix

deploy:
	npm run deploy