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