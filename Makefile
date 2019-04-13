STAGE ?= local
FB_APP_ID ?= 330164834292470
FB_APP_SECRET ?= 42949536913299795249c3404d0e1c5a
BUCKET ?= yame-dev
CUSTOM_CHROME ?= true
CHROME_BUCKET ?= yame-chromium
CHROME_KEY ?= headless_shell

export FB_APP_ID
export FB_APP_SECRET
export STAGE
export BUCKET
export CUSTOM_CHROME
export CHROME_BUCKET
export CHROME_KEY

start: modules
	export STAGE=local && npm start

watch: modules
	export STAGE=local && npm run start:watch

modules:
	npm install

build: modules
	npm run build

dockerbuild:
	docker build -t yame-api .

dockerwatch:
	docker run -it -p 3001:3001 -v ${PWD}/:/app --env AWS_ACCESS_KEY_ID=${AWS_KEY} --env AWS_SECRET_ACCESS_KEY=${AWS_ACCESS_KEY} yame-api

test: modules lint
	npm test

lint: modules
	npm run lint

fix: modules
	npm run lint:fix

offline: build
	export STAGE=local && npm run offline

deploy: build
	export STAGE=dev && npm run deploy

