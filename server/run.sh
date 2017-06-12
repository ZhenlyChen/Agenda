#!/bin/sh

forever start -l app.log -a app.js
forever list
