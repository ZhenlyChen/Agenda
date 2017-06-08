//mysql.js

/*
数据库模块

API:

query(sqlCmd,callback)：运行sql语句，回调(vals,isNull)

dealEscape(str)： 处理转义字符，返回处理后的字符串

*/

const fs = require('fs'); //文件处理
const mysql = require('mysql');
const mysqlConfig = JSON.parse(fs.readFileSync('config/mysql.json'));  //加载配置文件
const pool = mysql.createPool(mysqlConfig);              //创建进程

exports.query =  function(sqlCmd,callback){
  pool.getConnection(function(err,conn){
    if(err){
      callback(err,null,null);
    }else{
      conn.query(sqlCmd,function(error,results,fields){
        if (error) return console.error(error);
        conn.release();
        var resIsNull = 0;
        if(results[0] == undefined) resIsNull = 1;
        if(callback != undefined) callback(results,resIsNull);
      });
    }
  });
}

exports.dealEscape = function (str) {
  return str.toString()
  .replace(/\\/g, '\\\\')
  .replace(/\'/g, '\\\'');
}

