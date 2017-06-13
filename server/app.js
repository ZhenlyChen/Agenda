const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto'); //加密模块
const spawn = require('child_process').spawn; //异步子进程模块
const fs = require('fs'); //文件处理
const cookieParser = require('cookie-parser'); // cookie模块
const urlencodedParser = bodyParser.urlencoded({ extended: false }) // post模块
const sqlModule = require('./mysql.js'); //数据库模块
const userModule = require('./user.js'); //用户认证模块
const meetModule = require('./meeting.js'); //用户认证模块
const sLine = '-----------------------------------------------';
app.use(cookieParser()); // cookie模块
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
//------------------------------------------------------------------------------
//日期格式化
Date.prototype.Format = function(fmt) {
  var o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    'S': this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (RegExp.$1.length == 1) ? (o[k]) :
        (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }
  return fmt;
};
//------------------------------------------------------------------------------
//日志处理
app.use((req, res, next) => {
  console.log(sLine);
  var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
  console.log('Time:' + nowTime + '|| Method: ' + req.method);
  console.log('Form' + req.url + '||' + req.headers.referer);
  next();
});
//------------------------------------------------------------------------------
//用户登录模块
app.post('/login', [userModule.isEmailStr], (req, res, next) => { //用户是否存在
  console.log('User Login:');
  var sqlCmd =
    'SELECT `id`, `name`, `password`, `detail`, `web`, `tureEmail` FROM `user` WHERE `email`=\'' +
    req.body.userEmail + '\'';
  sqlModule.query(sqlCmd, (vals, isNull) => {
    if (isNull) {
      console.log('ERR: user is not exist.');
      res.send({ state: 'failed', why: 'ERROR_USER' });
      next('route');
    } else {
      res.locals.userData = vals[0];
      next();
    }
  });
}, (req, res, next) => { //密码是否正确
  if (res.locals.userData.password ==
    userModule.makeAsha(req.body.userPassword)) {
    var newToken = Math.round(Math.random() * 10000000);
    userModule.getToken(res,
      res.locals.userData.id, newToken, (oldToken, tureEmail) => {
        var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
        res.locals.data = {
          //构建session原始数据
          userID: res.locals.userData.id,
          token: newToken,
          lastDate: nowTime
        };
        userModule.makeASign(req, res, () => {
          res.send({
            state: 'success',
            name: res.locals.userData.name,
            detail: res.locals.userData.detail,
            web: res.locals.userData.web,
            tureEmail: res.locals.userData.tureEmail
          });
        });
      });
  } else {
    console.log('ERR: password is error');
    res.send({ state: 'failed', why: 'ERROR_PASSWORD' });
    next('route');
  }
});
//------------------------------------------------------------------------------
//邮箱验证系统
app.get('/login', (req, res, next) => { //获取get参数
  console.log('Email activation:');
  if (req.query.userSession != undefined && req.query.sign != undefined) {
    res.locals.userSession = req.query.userSession;
    res.locals.sign = req.query.sign;
    next();
  } else {
    console.log('Unable to read parameters');
    res.send('unknown error');
    next('route');
  }
}, [userModule.appUserVerifNoMail], (req, res, next) => { //查看是否已经激活
  var sqlCmd =
    'SELECT `tureEmail` FROM `user` WHERE id=' + res.locals.data.userID;
  sqlModule.query(sqlCmd, (vals, isNull) => {
    if (vals[0].tureEmail == 0) {
      console.log('Email activation success');
      var sqlCmd =
        'UPDATE `user` SET`tureEmail`=1 WHERE id=' + res.locals.data.userID;
      sqlModule.query(sqlCmd, (vals, isNull) => {
        res.redirect('../index.html?op=0');
      });
    } else {
      console.log('Err: email had activation!');
      res.send('Err: email had activation!');
    }
  });
});
//------------------------------------------------------------------------------
//注册模块
app.post(
  '/register', [userModule.isEmailStr, userModule.isTrueUser],
  (req, res, next) => { // 邮箱是否已经存在
    console.log('User registration:');
    var sqlCmd = 'SELECT `name` FROM `user` WHERE `email` =\'' +
      req.body.userEmail + '\'';
    sqlModule.query(sqlCmd, (vals, isNull) => {
      if (isNull) {
        next();
      } else {
        console.log('Err: email is had!');
        res.send({ state: 'failed', why: 'EMAIL_HAD' });
        next('route');
      }
    });
  },
  (req, res, next) => { // 用户名是否已经存在
    console.log('User registration:');
    var sqlCmd = 'SELECT `email` FROM `user` WHERE `name` =\'' +
      req.body.userName + '\'';
    sqlModule.query(sqlCmd, (vals, isNull) => {
      if (isNull) {
        next();
      } else {
        console.log('Err: name is had!');
        res.send({ state: 'failed', why: 'NAME_HAD' });
        next('route');
      }
    });
  },
  (req, res, next) => { // 建立用户数据
    var sqlCmd =
      'SELECT `intData` FROM `global` WHERE `name` = \'userCount\'';
    sqlModule.query(sqlCmd, (vals, isNull) => {
      console.log('Register success!');
      res.send({ state: 'success' });
      var userMaxId = vals[0].intData;
      var userPass = userModule.makeAsha(req.body.userPassword);
      var sqlCmd =
        'INSERT INTO `user`(`id`, `name`, `password`, `detail`, `email`, `web`, `tureEmail`) VALUES ' +
        '(' + (userMaxId + 10000) + ',\'' + req.body.userName + '\',\'' +
        userPass + '\',\'Nothing\',\'' + req.body.userEmail +
        '\',\'Nothing\',0)';
      sqlModule.query(sqlCmd);
      sqlCmd = 'UPDATE `global` SET`intData`=' + (userMaxId + 1) +
        ' WHERE `name` = \'userCount\'';
      sqlModule.query(sqlCmd);
    });
  });
//------------------------------------------------------------------------------
//发送激活邮件
app.post('/mail', (req, res, next) => { // 获取授权参数
  console.log('send email to user: ');
  res.locals.userSession = req.cookies.userSession;
  res.locals.sign = req.cookies.sign;
  next();
}, [userModule.appUserVerifNoMail], (req, res, next) => { //时间限制
  var nowHour = new Date().Format('yyyy-MM-dd-hh');
  var sqlCmd =
    'SELECT `email`, `tureEmail`, `sendEmailTime` FROM `user` WHERE `id`=' +
    res.locals.data.userID;
  sqlModule.query(sqlCmd, (vals, isNull) => {
    if (vals[0].sendEmailTime != nowHour && vals[0].tureEmail == 0) {
      console.log('ready to Send email!');
      var sqlCmd = 'UPDATE `user` SET `sendEmailTime`=\'' + nowHour +
        '\' WHERE `id`=' + res.locals.data.userID;
      sqlModule.query(sqlCmd);
      res.locals.userEmail = vals[0].email;
      next();
    } else {
      if (vals[0].tureEmail == 1) {
        console.log('Err: This had is a tureEmail.');
        userModule.makeASign(req, res, () => {
          res.send({ state: 'failed', why: 'HAD_TURE' });
        });
        next('route');
      } else {
        console.log('Err: Send two emails in a hour.');
        userModule.makeASign(req, res, () => {
          res.send({ state: 'failed', why: 'HAD_SEND' });
        });
        next('route');
      }
    }
  });
}, (req, res, next) => { //发送邮件
  var session = userModule.encrypt(
    JSON.stringify(res.locals.data), userModule.getKey().mykey);
  var mailSign = userModule.makeAsha(session + userModule.getKey().mysign);
  var mail1 = fs.readFileSync('maildata/mail1.data');
  var mail2 = fs.readFileSync('maildata/mail2.data');
  fs.writeFile(
    'mail.html', mail1 + session + '&sign=' + mailSign + mail2, (err) => {
      if (err) console.error(err);
      const ls = spawn('./sendMail.sh', [res.locals.userEmail]);
    });
  res.send({ state: 'success' });
});
//------------------------------------------------------------------------------
//修改密码
app.post(
  '/user/pwd', [userModule.appUserVerif],
  (req, res, next) => { //比较是否相同
    console.log('Password Change: ');
    var sqlCmd =
      'SELECT `password` FROM `user` WHERE `id`=' + res.locals.data.userID;
    sqlModule.query(sqlCmd, (vals, isNull) => {
      if (vals[0].password == userModule.makeAsha(req.body.oldPassword)) {
        console.log('Password is Right!');
        var newPass = userModule.makeAsha(req.body.newPassword);
        var sqlCmd = 'UPDATE `user` SET `password`=\'' + newPass +
          '\' WHERE `id`=' + res.locals.data.userID;
        sqlModule.query(sqlCmd);
        console.log('Updata password!');
        userModule.makeASign(req, res, () => {
          res.send({ state: 'success' });
        });
      } else {
        console.log('Err: Password is ERR');
        userModule.makeASign(req, res, () => {
          res.send({ state: 'failed', why: 'ERR_PWD' });
        });
      }
    });
  });
//------------------------------------------------------------------------------
//修改个人信息
app.post(
  '/user/info', [userModule.appUserVerif, userModule.isTrueUser],
  (req, res, next) => { //更新数据库个人信息
    console.log('Info Change: ');
    var userDetail = sqlModule.dealEscape(req.body.userDetail);
    var userWeb = sqlModule.dealEscape(req.body.userWeb);
    var sqlCmd = 'UPDATE `user` SET  `detail`=\'' + userDetail +
      '\',`web`=\'' + userWeb + '\' WHERE `id`=' + res.locals.data.userID;
    sqlModule.query(sqlCmd);
    console.log('Update user Info!');
    userModule.makeASign(req, res, () => {
      res.send({ state: 'success' });
    });
  });
//------------------------------------------------------------------------------
//获取邮件验证码
app.post('/getVCode', (req, res, next) => { //检测请求是否合法
  var sqlCmd = 'SELECT `id`, `vCodeSendTime` FROM `user` WHERE `email`=\'' +
    req.body.userEmail + '\'';
  var nowTime = new Date().Format('yyyy-MM-dd hh:mm:00');
  sqlModule.query(sqlCmd, (vals, isNull) => {
    if (isNull) {
      res.send({ state: 'failed', why: 'EMAIL_NOT' });
      next('route');
    } else {
      if (vals[0].vCodeSendTime == nowTime) {
        res.send({ state: 'failed', why: 'TIME_LIMIT' });
        next('route');
      } else {
        res.locals.nowTime = nowTime;
        res.locals.userId = vals[0].id;
        next();
      }
    }
  });
}, (req, res, next) => { //发送邮件
  var vCode = Math.round(100000 + Math.random() * 1000000);
  var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
  var sqlCmd = 'UPDATE `user` SET `vCode`=' + vCode + ',`vCodeSendTime`=\'' +
    res.locals.nowTime + '\',`vCodeLimitTime`=\'' + nowTime +
    '\' WHERE `id`=' + res.locals.userId;
  sqlModule.query(sqlCmd, (vals, isNull) => {
    var mail1 = fs.readFileSync('maildata/mail3.data');
    var mail2 = fs.readFileSync('maildata/mail4.data');
    fs.writeFile('mail.html', mail1 + vCode + mail2, (err) => {
      if (err) console.error(err);
      const ls = spawn('./sendMail2.sh', [req.body.userEmail]);
    });
    res.send({ state: 'success' });
  });
});
//------------------------------------------------------------------------------
//重置密码
app.post('/forget', (req, res, next) => { //核对验证码
  var sqlCmd =
    'SELECT `id`, `vCode`,`vCodeLimitTime` FROM `user` WHERE `email`=\'' +
    req.body.userEmail + '\'';
  var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
  sqlModule.query(sqlCmd, (vals, isNull) => {
    if (isNull) {
      res.send({ state: 'failed', why: 'EMAIL_NOT' });
      next('route');
    } else {
      if (vals[0].vCode == req.body.vCode && vals[0].vCode != 007 &&
        userModule.comptime(vals[0].vCodeLimitTime, nowTime) < 1) {
        res.locals.userId = vals[0].id;
        next();
      } else {
        res.send({ state: 'failed', why: 'ERR_VCODE' });
        next('route');
      }
    }
  });
}, (req, res, next) => { //重置密码
  userPassword = userModule.makeAsha(req.body.userPassword);
  var sqlCmd = 'UPDATE `user` SET `password`=\'' + userPassword +
    '\', `vCode`=007 WHERE `id`=' + res.locals.userId;
  sqlModule.query(sqlCmd, (vals, isNull) => {
    res.send({ state: 'success' });
  });
});
//------------------------------------------------------------------------------
//退出登陆
app.get('/layout', (req, res, next) => { //清空cookies
  res.cookie('userSession', '');
  res.cookie('sign', '');
  res.cookie('isLogin', '0');
  res.redirect('../index.html?op=0');
});
//------------------------------------------------------------------------------
//获取会议,用户列表
// todo
app.post('/getList', [userModule.appUserVerif], (req, res, next) => {
  console.log('Get Meeting List Success!');
  var sqlCmd = 'SELECT `name` FROM `user` WHERE 1';
  sqlModule.query(sqlCmd, (vals, isNull) => {
    var userList = new Array;
    for (i in vals) {
      if (vals[i].name != res.locals.userName) userList.push(vals[i]);
    }
    meetModule.refreshList(res, (listOfS, listOfP) => {
      userModule.makeASign(req, res, () => {
        res.send({
          listOfSponsor: listOfS,
          listOfParticipate: listOfP,
          users: userList
        });
      });
    });
  });
});
//------------------------------------------------------------------------------
// 增加，修改会议内容
app.post('/editMeeting', [userModule.appUserVerif], (req, res, next) => {
  console.log('Edit Meeting');
  var sqlCmd = 'SELECT * FROM `meeting` WHERE 1';
  sqlModule.query(sqlCmd, (vals, isNull) => {
    for (i in vals) {
      // 重名会议检测
      if (req.body.name == vals[i].name && req.body.mid != vals[i].mid) {
        res.locals.send = { state: 'failed', why: 'HAD_MEETING' };
        console.log('ERR: HAD_MEETING');
        next();
      }
      // 发起者和参与者重名检测 TODO NOT MUST
      // 参与者重名检测 TODO NOT MUST
      // 参与者是否存在 TODO NOT MUST
      // 发起者日期检测重叠 TODO
      if (res.locals.data.userID == vals[i].uid && req.body.mid != vals[i].mid) {
        if (!(userModule.comptime(req.body.startDate, vals[i].endDate) <= 0 ||
            userModule.comptime(req.body.endDate, vals[i].startDate) >= 0)) {
          res.locals.send = { state: 'failed', why: 'DATE_SP' };
          console.log('ERR: DATE_SP');
          next();
        }
      }
      if (userModule.comptime(req.body.startDate, req.body.endDate) <= 0) {
        res.locals.send = { state: 'failed', why: 'DATE_NO' };
        console.log('ERR: DATE_NO');
        next();
      }
      // 参与者日期检测重叠 TODO
      var actorsList = vals[i].actors.split(',');
      var actorsIn = req.body.actors.split(',');
      for (ai in actorsIn) {
        for (al in actorsList) {
          if (actorsList[al] == actorsIn[ai] && req.body.mid != vals[i].mid) { // 这个参与者在这个会议里面
            if (!(userModule.comptime(req.body.startDate, vals[i].endDate) <= 0 ||
                userModule.comptime(req.body.endDate, vals[i].startDate) >= 0)) {
              res.locals.send = { state: 'failed', why: 'DATE_AC' };
              console.log('ERR: DATE_AC');
              next();
            }
          }
        }
      }
    }
    res.locals.send = { state: 'success' };
    console.log('success');
    next();
  });
}, (req, res, next) => {
  if (res.locals.send.state == 'success') {
    if (req.body.mid != 0) {
      sqlCmd = 'UPDATE `meeting` SET `name`=\'' + req.body.name + '\',`startDate`=\'' + req.body.startDate +
        '\',`endDate`=\'' + req.body.endDate + '\',`actors`=\'' + req.body.actors + '\' WHERE `mid`=' + req.body.mid;
    } else {
      sqlCmd = 'INSERT INTO `meeting`(`uid`, `name`, `sponsor`, `startDate`, `endDate`, `actors`)' +
        ' VALUES (' + res.locals.data.userID + ',\'' + req.body.name + '\',\'' + res.locals.userName +
        '\',\'' + req.body.startDate + '\',\'' + req.body.endDate + '\',\'' + req.body.actors + '\')';
    }
    sqlModule.query(sqlCmd);
  }
  userModule.makeASign(req, res, () => {
    res.send(res.locals.send);
  });
});
//------------------------------------------------------------------------------
//删除会议
// todo
app.post('/delMeeting', [userModule.appUserVerif], (req, res, next) => {
  // 会议归属者检测 TODO NOT MUST
  console.log('Delete meeting success!');
  var sqlCmd = 'DELETE FROM `meeting` WHERE `mid`=' + req.body.mid;
  sqlModule.query(sqlCmd, (vals, isNull) => {
    userModule.makeASign(req, res, () => {
      res.send({ state: 'success' });
      next('route');
    });
  });
});
//------------------------------------------------------------------------------
//退出会议
// todo
app.post('/quitMeeting', [userModule.appUserVerif], (req, res, next) => {
  // 参与者是否存在检测 TODO NOT MUST
  console.log('Quit meeting success!');
  var sqlCmd = 'SELECT `actors` FROM `meeting` WHERE `mid`=' + req.body.mid;
  sqlModule.query(sqlCmd, (vals, isNull) => {
    var actors = vals[0].actors.split(',');
    var newActors = '';
    for (i in actors) {
      if (actors[i] != res.locals.userName) {
        if (newActors != '') newActors += ',';
        newActors += actors[i]
      }
    }
    res.locals.actors = newActors;
    next();
  });
}, (req, res, next) => {
  if (res.locals.actors == '') {
    sqlCmd = 'DELETE FROM `meeting` WHERE `mid`=' + req.body.mid;
  } else {
    sqlCmd = 'UPDATE `meeting` SET `actors`=\'' + res.locals.actors + '\' WHERE `mid`=' + req.body.mid;
  }
  sqlModule.query(sqlCmd, (vals, isNull) => {
    userModule.makeASign(req, res, () => {
      res.send({ state: 'success' });
      next('route');
    });
  });
});
//------------------------------------------------------------------------------
// 注销账号
// todo
//------------------------------------------------------------------------------
//监听30010端口
var server = app.listen(30010, '127.0.0.1', () => { //监听localhost
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
//------------------------------------------------------------------------------