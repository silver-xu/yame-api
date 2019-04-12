STAGE ?= local
FB_APP_ID ?= 330164834292470
FB_APP_SECRET ?= 42949536913299795249c3404d0e1c5a
BUCKET ?= yame-dev

export FB_APP_ID
export FB_APP_SECRET
export STAGE
export BUCKET

start: node_modules
	export STAGE=local && npm start

watch: node_modules
	export STAGE=local && npm run start:watch

node_modules:
	npm install

build: node_modules
	npm run build

dockerbuild:
	docker build -t yame-api .

dockerwatch:
	docker run -it -p 3001:3001 -v ${PWD}/:/app --env AWS_ACCESS_KEY_ID=${AWS_KEY} --env AWS_SECRET_ACCESS_KEY=${AWS_ACCESS_KEY} yame-api

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

