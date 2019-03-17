STAGE ?= local
FB_APP_ID ?= 330164834292470
FB_APP_SECRET ?= 42949536913299795249c3404d0e1c5a

export FB_APP_ID
export FB_APP_SECRET
export STAGE


start: node_modules
	export STAGE=local && npm start

watch: node_modules
	export STAGE=local && npm run start:watch

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
	export STAGE=local && npm run offline

deploy: build
	export STAGE=dev && npm run deploy