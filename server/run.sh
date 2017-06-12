#!/bin/sh

forever start -l agenda.log -a app.js
forever list
