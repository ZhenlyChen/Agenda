const sqlModule = require('./mysql.js'); //数据库模块
const cookieParser = require('cookie-parser'); // cookie模块

exports.refreshList = (res, callback) => {
  var sqlCmd = 'SELECT * FROM `meeting` WHERE 1';
  sqlModule.query(sqlCmd, (vals, isNull) => {
    var meetingOfSp = new Array;
    var meetingOfPart = new Array;
    for (i in vals) {
      if (vals[i].uid == res.locals.data.userID) {
        meetingOfSp.push(vals[i]);
      } // 自己发起的会议列表
      var partList = vals[i].actors.split(",");
      for (index in partList) {
        if (res.locals.userName == partList[index]) {
          meetingOfPart.push(vals[i]);
        }
      }
    }
    callback(meetingOfSp, meetingOfPart);
  });
}

exports.CheckDateTime = (str) => {
  var reg = /^(\d+)-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
  var r = str.match(reg);
  if (r == null) return false;
  r[2] = r[2] - 1;
  var d = new Date(r[1], r[2], r[3], r[4], r[5], r[6]);
  if (d.getFullYear() != r[1]) return false;
  if (d.getMonth() != r[2]) return false;
  if (d.getDate() != r[3]) return false;
  if (d.getHours() != r[4]) return false;
  if (d.getMinutes() != r[5]) return false;
  if (d.getSeconds() != r[6]) return false;
  return true;
}