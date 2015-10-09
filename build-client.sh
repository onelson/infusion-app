#!/bin/sh

# performs a clean build of the html/js/styles (usually triggered from sbt).
cd client-src
npm install && node_modules/.bin/gulp clean && node_modules/.bin/gulp build
