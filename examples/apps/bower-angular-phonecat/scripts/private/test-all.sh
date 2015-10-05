#!/bin/sh

set -ex

cleanUp () {
  kill $WEBSERVER_PID
  git checkout -f $BRANCH
}

trap cleanUp EXIT

ROOT_DIR=`dirname $0`/../..

cd $ROOT_DIR
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Ensure that all the dependencies are there
npm install

# Ensure that the chromeDriver is installed
npm run update-webdriver

# Start up the web server
node_modules/.bin/http-server -p 8000 &
WEBSERVER_PID=$!

# Run the unit and e2e tests
for i in {0..12}
do
  git checkout -f step-$i

  node_modules/karma/bin/karma start test/karma.conf.js --single-run
  node_modules/.bin/protractor test/protractor-conf.js

done