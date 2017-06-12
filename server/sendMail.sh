#!/bin/sh
name=$1
cat mail.html |mutt -s "【Agenda】注册邮箱激活" -e 'set content_type="text/html"' ${name}

