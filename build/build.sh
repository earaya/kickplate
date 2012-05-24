#!/bin/sh
compass compile
rm ../public/css/screen-optimized.css
node r.js -o optimizeCss=standard cssIn=../public/css/screen.css out=../public/css/screen-optimized.css
node r.js -o build.js