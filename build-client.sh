#!/bin/sh

# performs a clean build of the html/js/styles (usually triggered from sbt).
cd client-src
npm install && gulp clean && gulp build
exit 0
