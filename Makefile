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

pack: build
	rm -rf pack; \
	npm run pack; \
	mkdir pack/node_modules; \
	cp node_modules/html-pdf pack/node_modules/html-pdf -r; \
	cp node_modules/es6-promise pack/node_modules/es6-promise -r;

pilotpack:
	node pack/handler.js

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

deploy: pack
	npm run deploy

deployblob: pack
	rm -rf blob/pack;  \
	cp pack blob/pack -r; \
	cp node_modules/html-pdf pack/node_modules/html-pdf -r; \
	cd blob; \
	sls deploy --stage dev

deployall: deploy
	rm -rf blob/pack;  \
	cp pack blob/pack -r; \
	cd blob; \
	sls deploy --stage dev

domain:
	npm run domain

blobdomain:
	cd blob; \
	sls create_domain --stage dev
