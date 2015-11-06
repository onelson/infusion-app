#!/bin/sh

# performs a clean build of the html/js/styles (usually triggered from sbt).
rm -rf app/assets/dist  # clean previous builds out
cd client-src
npm install && node_modules/.bin/webpack
