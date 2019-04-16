STAGE ?= local
FB_APP_ID ?= 330164834292470
FB_APP_SECRET ?= 42949536913299795249c3404d0e1c5a
BUCKET ?= yame-${STAGE}
DOC_PERMALINKS_TABLE ?= DocPermalinks-${STAGE}
USER_PROFILE_TABLE ?= UserProfile-${STAGE}

export FB_APP_ID
export FB_APP_SECRET
export STAGE
export BUCKET
export DOC_PERMALINKS_TABLE
export USER_PROFILE_TABLE

start: modules
	npm start

watch: modules
	npm run start:watch

modules:
	npm install

build: modules
	npm run build

dockerbuild:
	docker build -t yame-api .

dockerwatch:
	 STAGE=dev && docker run -it -p 3001:3001 -v ${PWD}/:/app --env AWS_ACCESS_KEY_ID=${AWS_KEY} --env AWS_SECRET_ACCESS_KEY=${AWS_ACCESS_KEY} --env STAGE=${STAGE} yame-api

test: modules lint
	npm test

lint: modules
	npm run lint

fix: modules
	npm run lint:fix

offline: build
	npm run offline

deploy: build
	npm run deploy

domain:
  npm run domain

