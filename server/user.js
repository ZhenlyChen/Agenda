//user.js
/*
用户认证模块

API:

getKey: 获取加密密钥，和签名密钥， 返回json对象

makeAsha(str)： 对字符串进行SHA1加密， 返回字符串

getToken(userID, newToken, callback)：对指定ID用户更新Token,回调旧的Token和邮箱激活状态

中间件：

appUserVerif： 对用户进行认证

appUserVerifNoMail：忽略邮箱激活状态对用户进行认证（需要提前设置res.locals.userSession 和 res.locals.sign）

makeASign：生成新的userSession 和 sign，并设置到cookies里面，回调下一步的操作

isEmailStr： 检测邮箱格式是否合法

isTrueUser：检查用户名格式是否合法

*/

const crypto = require('crypto');
const fs = require('fs');
const sqlModule = require('./mysql.js'); //数据库模块
const keyConfig = JSON.parse(fs.readFileSync('config/key.json'));
const cookieParser = require('cookie-parser'); // cookie模块

exports.getKey = function() {
  return {
    mykey: keyConfig.mykey,
    mysign: keyConfig.mysign
  }
};

exports.makeAsha = function(str) {
  var hashSHA1 = crypto.createHash('sha1');
  hashSHA1.update(str);
  return hashSHA1.digest('hex');
};

exports.getToken = function(res, userID, newToken, callback) {
  var sqlCmd = 'SELECT `token`, `tureEmail`, `name` FROM `user` WHERE `id`=' + userID;
  sqlModule.query(sqlCmd, (vals, isNull) => {
    if (isNull) {
      callback(-1, 0);
    } else {
      var oldToken = vals[0].token;
      var tureEmail = vals[0].tureEmail;
      res.locals.userName = vals[0].name;
      var sqlCmd = 'UPDATE `user` SET `token`=\'' + newToken + '\' WHERE `id`=' + userID;
      sqlModule.query(sqlCmd, (vals, isNull) => {
        callback(oldToken, tureEmail);
      });
    }
  });
};

exports.appUserVerif = function(req, res, next) {
  res.locals.userSession = req.cookies.userSession;
  res.locals.sign = req.cookies.sign;
  res.locals.needMail = 1;
  userVerif(res, function(mydata) {
    if (mydata.userID == undefined) {
      console.log('Illegal access');
      res.send({ state: 'failed', why: mydata });
      next('route');
    } else {
      res.locals.data = mydata;
      exports.makeASign(req, res, () => {
        next();
      });
    }
  });
};

exports.appUserVerifNoMail = function(req, res, next) {
  res.locals.needMail = 0;
  userVerif(res, function(mydata) {
    if (mydata.userID == undefined) {
      console.log('Illegal access');
      res.send({ state: 'failed', why: mydata });
      next('route');
    } else {
      res.locals.data = mydata;
      next();
    }
  })
};

exports.makeASign = function(req, res, callback) {
  var sessionXXX = exports.encrypt(JSON.stringify(res.locals.data), keyConfig.mykey);
  res.cookie(
    'userSession', sessionXXX, { expires: new Date(Date.now() + 10000000), httpOnly: true });
  res.cookie(
    'sign', exports.makeAsha(sessionXXX + keyConfig.mysign), { expires: new Date(Date.now() + 10000000), httpOnly: true });
  res.cookie('isLogin', 1);
  callback();
};

exports.isEmailStr = function(req, res, next) {
  var pattern =
    /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  var strEmail = pattern.test(req.body.userEmail);
  if (strEmail) {
    next();
  } else {
    console.log('Illegal Email');
    res.send({ state: 'failed', why: 'NOT_EMAIL' });
    next('route');
  }
};

exports.isTrueUser = function(req, res, next) {
  var pattern2 = /^[a-zA-z0-9\_\.]{3,20}$/;
  var strname = pattern2.test(req.body.user_name);
  if (strname) {
    next();
  } else {
    console.log('Illegal Name');
    res.send({ state: 'failed', why: 'NOT_USER' });
    next('route');
  }
};

exports.comptime = function(beginTime, endTime) {
  var beginTimes = beginTime.substring(0, 10).split('-');
  var endTimes = endTime.substring(0, 10).split('-');
  beginTime = beginTimes[1] + '-' + beginTimes[2] + '-' + beginTimes[0] +
    ' ' + beginTime.substring(10, 19);
  endTime = endTimes[1] + '-' + endTimes[2] + '-' + endTimes[0] + ' ' +
    endTime.substring(10, 19);
  var a = (Date.parse(endTime) - Date.parse(beginTime)) / 3600 / 1000;
  return a;
}; //进行时间比较

exports.encrypt = function(str, secret) {
  var cipher = crypto.createCipher('aes192', secret);
  var enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
}; // 加密数据

function decrypt(str, secret) {
  var decipher = crypto.createDecipher('aes192', secret);
  var dec = decipher.update(str, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
} //解密数据

function userVerif(res, callback) {
  userSession = res.locals.userSession;
  sign = res.locals.sign;
  needMail = res.locals.needMail
  if (userSession == undefined || sign == undefined) {
    console.log('Err: NO Sign');
    callback('ILLEGAL_SIGN');
    return;
  }
  if (!needMail) console.log('Ignore Email');
  if (exports.makeAsha(userSession + keyConfig.mysign) != sign) {
    console.log('Err: ILLEGAL_SIGN');
    callback('ILLEGAL_SIGN');
    return;
  } //验证签名
  var allData = JSON.parse(decrypt(userSession, keyConfig.mykey));
  console.log('UserID：' + allData.userID);
  var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
  if (exports.comptime(allData.lastDate, nowTime) > 3) {
    console.log('Err: user Time out');
    callback('TIME_OUT');
    return;
  }
  allData.lastDate = nowTime;
  var newToken = Math.round(Math.random() * 10000000);
  exports.getToken(res, allData.userID, newToken, (oldToken, tureEmail) => {
    if (oldToken != allData.token) {
      console.log('Err: Illegal Token');
      callback('ILLEGAL_TOKEN');
    } else {
      if (tureEmail == 0 && needMail == 1) {
        console.log('Email is no active');
        callback('NO_MAIL');
      } else {
        allData.token = newToken;
        callback(allData);
      }
    }
  });
} //进行用户认证