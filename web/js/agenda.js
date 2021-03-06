// SHA1加密模块
var hexcase = 0;
var chrsz = 8;
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

function comptime(beginTime, endTime) {
  var beginTimes = beginTime.substring(0, 10).split('-');
  var endTimes = endTime.substring(0, 10).split('-');
  beginTime = beginTimes[1] + '-' + beginTimes[2] + '-' + beginTimes[0] + ' ' +
    beginTime.substring(10, 19);
  endTime = endTimes[1] + '-' + endTimes[2] + '-' + endTimes[0] + ' ' +
    endTime.substring(10, 19);
  var a = (Date.parse(endTime) - Date.parse(beginTime)) / 3600 / 1000;
  return a;
}; //进行时间比较
function hex_sha1(s) {
  return binb2hex(core_sha1(str2binb(s), s.length * chrsz));
}

function core_sha1(x, len) {
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;
  var w = Array(80);
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;
  var e = -1009589776;
  for (var i = 0; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;
    for (var j = 0; j < 80; j++) {
      if (j < 16)
        w[j] = x[i + j];
      else
        w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
      var t = safe_add(
        safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
        safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }
    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);
}

function sha1_ft(t, b, c, d) {
  if (t < 20) return (b & c) | ((~b) & d);
  if (t < 40) return b ^ c ^ d;
  if (t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

function sha1_kt(t) {
  return (t < 20) ? 1518500249 :
    (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
}

function safe_add(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

function rol(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

function str2binb(str) {
  var bin = new Array();
  var mask = (1 << chrsz) - 1;
  for (var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
  return bin;
}

function binb2hex(binarray) {
  var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
  var str = '';
  for (var i = 0; i < binarray.length * 4; i++) {
    str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
      hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
  }
  return str;
}

//---------------------------------------------------------------------
function getCookie(name) {
  var arr, reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
  return (arr = document.cookie.match(reg)) ? unescape(arr[2]) : null;
} //获取cookie

function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  return r != null ? unescape(r[2]) : null;
} //获取get参数

function sendNotice(str) {
  $('#Alert_').alert('close');
  $('#notice').load('notice.html', function() {
    document.getElementById('sendtoAlert').innerHTML = str;
  });
} //页面内通知

function sendNotice2(str) {
  $('#Alert_').alert('close');
  $('#notice2').load('notice.html', function() {
    document.getElementById('sendtoAlert').innerHTML = str;
  });
} //模态框通知

function regularTest(pattern, id, send) {
  if (!pattern.test(document.getElementById(id).value)) {
    sendNotice(send);
    $('#' + id).focus();
    $('#' + id).val('');
    return 0;
  } else {
    return 1;
  }
} //正则匹配

function isNullTest(id, send) {
  if (document.getElementById(id).value == '') {
    sendNotice(send);
    $('#' + id).focus();
    return 1;
  } else {
    return 0;
  }
} //非空检测

function lengthTest(id, min, max, send, qwq) {
  if (document.getElementById(id).value.length < min ||
    document.getElementById(id).value.length > max) {
    1 === qwq ? sendNotice2(send) : sendNotice(send); // qwq=1是模态框类通知
    $('#' + id).focus();
    return 0;
  } else {
    return 1;
  }
} //检测长度

function isEqualTest(id1, id2, send, qwq) {
  if (document.getElementById(id1).value !=
    document.getElementById(id2).value) {
    qwq === 1 ? sendNotice2(send) : sendNotice(send); // qwq=1是模态框类通知
    $('#' + id2).focus();
    return 0;
  } else {
    return 1;
  }
} //检测相等

function login() {
  if (isNullTest('userEmail', '<strong>邮箱地址为空</strong>  请输入邮箱地址'))
    return;
  if (isNullTest('userPassword', '<strong>密码为空</strong>  请输入密码'))
    return;
  sendNotice('登陆中，请稍后');
  $.post(
    'api/login', {
      userEmail: document.getElementById('userEmail').value,
      userPassword: hex_sha1(document.getElementById('userPassword').value)
    },
    function(data) {
      illegalTest(data);
      if (data.state == 'success') {
        document.cookie = 'name=' + data.name;
        document.cookie = 'detail=' + data.detail;
        document.cookie = 'web=' + data.web;
        document.cookie = 'tureEmail=' + data.tureEmail;
        document.cookie = 'verify=' + data.verify;
        document.cookie = 'phone=' + data.phone;
        document.cookie = 'userEmail=' + data.email;
        if (data.tureEmail == 0) {
          window.location.href = 'mail.html';
        } else {
          window.location.href = 'list.html';
        }
      } else { //失败
        switch (data.why) {
          case 'ERROR_USER':
            $('#userEmail').val('');
            $('#userEmail').focus();
            sendNotice('<strong>邮箱/用户名</strong>不存在，请重新输入或进行注册');
            break;
          case 'ERROR_PASSWORD':
            $('#userPassword').val('');
            $('#userPassword').focus();
            sendNotice('<strong>密码</strong>错误，请重新输入');
            break;
        }
      }
    });
} //登陆操作

function register() {
  if (isNullTest('userEmail', '请输入邮箱地址')) return;
  if (isNullTest('userName', '请输入用户名')) return;
  if (isNullTest('userPassword', '请输入密码')) return;
  if (isNullTest('userPassword2', '请再次输入密码')) return;
  var pattern =
    /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  if (!regularTest(pattern, 'userEmail', '请输入有效的Email！')) return;
  pattern = /^[a-zA-Z0-9\_\.]{3,20}$/;
  if (!regularTest(
      pattern, 'userName',
      '请输入有效的用户名(由字母，数字，下划线组成，3-20位)'))
    return;
  if (!lengthTest('userPassword', 6, 20, '密码长度不合法，有效长度：6 - 20'))
    return;
  if (!isEqualTest('userPassword', 'userPassword2', '两次输入的密码不一致'))
    return;
  $.post(
    'api/register', {
      userEmail: document.getElementById('userEmail').value,
      userName: document.getElementById('userName').value,
      userPassword: hex_sha1(document.getElementById('userPassword').value)
    },
    function(data) {
      illegalTest(data);
      if (data.state == 'success') {
        window.location.href = 'index.html?op=5';
      } else if (data.why == 'EMAIL_HAD') {
        sendNotice('邮箱已经被注册，请登陆。');
      } else if (data.why == 'NAME_HAD') {
        sendNotice('用户名已经被注册，请修改。');
        $('#userName').focus();
      } else {
        sendNotice('非法请求');
      }
    });
} //注册模块

function forgetPwd() {
  if (isNullTest('userEmail', '请输入邮箱地址')) return;
  if (isNullTest('vCode', '请输入验证码')) return;
  if (isNullTest('userPassword', '请输入密码')) return;
  if (isNullTest('userPassword2', '请再次输入密码')) return;
  var pattern =
    /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  if (!regularTest(pattern, 'userEmail', '请输入有效的Email！')) return;
  pattern = /^[0-9\_\.]{6,6}$/;
  if (!regularTest(pattern, 'vCode', '请输入有效的验证码')) return;
  if (!lengthTest('userPassword', 6, 20, '密码长度不合法，有效长度：6 - 20'))
    return;
  if (!isEqualTest('userPassword', 'userPassword2', '两次输入的密码不一致'))
    return;
  $.post(
    'api/forget', {
      userEmail: document.getElementById('userEmail').value,
      vCode: document.getElementById('vCode').value,
      userPassword: hex_sha1(document.getElementById('userPassword').value)
    },
    function(data) {
      illegalTest(data);
      if (data.state == 'success') {
        window.location.href = 'index.html?op=6';
      } else if (data.why == 'EMAIL_NOT') {
        sendNotice('邮箱已经不存在，请进行注册');
      } else if (data.why == 'ERR_VCODE') {
        sendNotice('验证码错误！');
      }
    });
} //忘记密码模块

function toCinfo() {
  pattern = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|170|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
  if (!regularTest(pattern, 'user_phone', '请输入有效的手机号码！')) return;
  $.post(
    'api/user/info', {
      userDetail: document.getElementById('user_detail').value,
      userWeb: document.getElementById('user_web').value,
      verify: document.getElementById('verify').checked,
      phone: document.getElementById('user_phone').value
    },
    function(data) {
      illegalTest(data);
      if (data.state == 'success') {
        document.cookie = 'detail=' + document.getElementById('user_detail').value;
        document.cookie = 'web=' + document.getElementById('user_web').value;
        if (document.getElementById('verify').checked == true) {
          document.cookie = 'verify=0';
        } else {
          document.cookie = 'verify=1';
        }
        document.cookie = 'phone=' + document.getElementById('user_phone').value;
        sendNotice('成功修改信息。');
      } else {
        window.location.href = 'index.html?op=4';
      }
    });
} //修改个人信息

function toCpwd() {
  if (!lengthTest('old_password', 6, 20, '密码长度不合法，有效长度：6 - 20', 1))
    return;
  if (!lengthTest('new_password', 6, 20, '密码长度不合法，有效长度：6 - 20', 1))
    return;
  if (!isEqualTest('new_password', 'new_password2', '两次输入的密码不一致', 1))
    return;

  $.post(
    'api/user/pwd', {
      oldPassword: hex_sha1(document.getElementById('old_password').value),
      newPassword: hex_sha1(document.getElementById('new_password').value),
    },
    function(data) {
      illegalTest(data);
      if (data.state == 'success') {
        $('#cPwd').modal('hide');
        sendNotice('成功修改密码。');
      } else if (data.why == 'ERR_PWD') {
        sendNotice2('原密码错误。');
        $('#old_password').val('');
        $('#old_password').focus();
      } else {
        window.location.href = 'index.html?op=4';
      }
    });
} //修改密码

function toMail() {
  $.post('api/mail', { state: 'EMAIL' }, function(data) {
    if (data.state == 'success') {
      window.location.href = 'index.html?op=2';
      return;
    } else {
      illegalTest(data);
      switch (data.why) {
        case 'HAD_SEND':
          alert('一个小时内只能发送一次');
          break;
        case 'ILLEGAL_SIGN':
        case 'ILLEGAL_TOKEN':
          window.location.href = 'index.html?op=4';
          break;
        case 'TIME_OUT':
          window.location.href = 'index.html?op=3';
          break;
      }
    }
  });
} //发送邮件


function isLogin(callback) {
  var qwq = getCookie('isLogin');
  var wdf = getCookie('tureEmail');
  if (qwq == '' || qwq == 0 || qwq == undefined) {
    window.location.href = 'index.html?op=1';
  } else if (wdf == '0' || wdf == undefined || wdf == '') {
    window.location.href = 'mail.html';
  } else {
    if (callback != undefined) callback();
  }
} //检测是否登陆和验证邮箱

function loadBar(id) {
  $('#nav-bar').load('nav-bar.html', function() {
    $(id).addClass('active');
    var username = getCookie('name');
    if (username !== null && username !== '') {
      document.getElementById('userBar').innerHTML =
        username + ' <span class="caret"></span>';
    } else {
      document.getElementById('userBar').innerHTML =
        '未登陆 <span class="caret"></span>';
    }
  }); //加载标题栏
}

function settime() { //设置按钮倒计时
  if (countdown < 0) {
    document.getElementById('gCode').removeAttribute('disabled');
    document.getElementById('gCode').innerHTML = '获取验证码';
    countdown = 120;
  } else {
    document.getElementById('gCode').setAttribute('disabled', true);
    document.getElementById('gCode').innerHTML = '重新发送(' + countdown + ')';
    countdown--;
    setTimeout(settime, 1000);
  }
}

function getCode() { //获取验证码
  $.post(
    'api/getVCode', { userEmail: document.getElementById('userEmail').value },
    function(data) {
      illegalTest(data);
      if (data.state == 'success') {
        settime();
      } else if (data.why == 'EMAIL_NOT') {
        sendNotice('邮箱已经不存在，请进行注册');
      } else if (data.why == 'TIME_LIMIT') {
        sendNotice('请两分钟后再尝试');
      }
    });
}

function getList() {
  $.post('api/getList', {}, (data) => {
    illegalTest(data);
    list.meetings = data.listOfSponsor;
    list2.meetings = data.listOfParticipate;
    userList.users = data.users;
    myNotice.notices = data.notice;
    setTimeout(() => {
      $("[data-toggle='tooltip']").tooltip();
    }, 1000);
    if (list.meetings.length != 0) {
      $('#mylistTable').show();
      $('#nothingS').hide();
    } else {
      $('#mylistTable').hide();
      $('#nothingS').show();
      $('#nothingS')
        .html(
          '<div class="alert alert-warning alert-dismissible" role="alert">你还没有发起任何会议</div>');
    }

    if (list2.meetings.length != 0) {
      $('#takelistTable').show();
      $('#nothingP').hide();
    } else {
      $('#takelistTable').hide();
      $('#nothingP').show();
      $('#nothingP')
        .html(
          '<div class="alert alert-warning alert-dismissible" role="alert">当前没有参与的会议</div>');
    }
    var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
    for (i in list.meetings) {
      list.meetings[i].class = 'default';
      list.meetings[i].state = '未开始';
      if (comptime(nowTime, list.meetings[i].endDate) <= 0) {
        list.meetings[i].class = 'success';
        list.meetings[i].state = '已完成';
      }
      if (comptime(nowTime, list.meetings[i].startDate) <= 0 &&
        comptime(nowTime, list.meetings[i].endDate) >= 0) {
        list.meetings[i].class = 'warning';
        list.meetings[i].state = '进行中';
      }
    }
    for (i in list2.meetings) {
      list2.meetings[i].class = 'default';
      list2.meetings[i].state = '未开始';
      if (comptime(nowTime, list2.meetings[i].endDate) <= 0) {
        list2.meetings[i].class = 'success';
        list2.meetings[i].state = '已完成';
      }
      if (comptime(nowTime, list2.meetings[i].startDate) <= 0 &&
        comptime(nowTime, list2.meetings[i].endDate) >= 0) {
        list2.meetings[i].class = 'warning';
        list2.meetings[i].state = '进行中';
      }
    }
  });
}

function dealMeeting(e) {
  if (document.getElementById('meetName').value == '') {
    sendNotice2('请输入会议名称');
    $('#meetName').focus();
    return;
  }
  if (document.getElementById('input_startDate').value == '') {
    sendNotice2('请选择开始时间');
    $('#input_startDate').focus();
    return;
  }
  if (document.getElementById('input_endDate').value == '') {
    sendNotice2('请选择结束时间');
    $('#input_endDate').focus();
    return;
  }
  var str = '';
  $('input[name=\'input_user\']').each(function() {
    if ($(this).is(':checked')) {
      if (str != '') str += ',';
      str += $(this).val();
    }
  });
  if (str == '') {
    sendNotice2('参与者不能为空');
    return;
  }
  $.post(
    'api/' + e.getAttribute('value'), {
      name: document.getElementById('meetName').value,
      startDate: document.getElementById('input_startDate').value,
      endDate: document.getElementById('input_endDate').value,
      actors: str,
      mid: e.getAttribute('data-mid'),
      detail: document.getElementById('input_detail').value,
    },
    (data) => {
      illegalTest(data);
      if (data.state == 'success') {
        getList();
        $('#addMeet').modal('hide');
        document.getElementById('meetName').value = '';
        document.getElementById('input_startDate').value = '';
        document.getElementById('input_endDate').value = '';
        var checkbox = document.getElementsByName('input_user');
        for (i in checkbox) {
          checkbox[i].checked = false;
        }
      } else {
        if (data.why == 'HAD_MEETING') {
          sendNotice2('该会议已存在');
        } else if (data.why == 'DATE_SP') {
          sendNotice2('你的时间有冲突');
        } else if (data.why == 'DATE_AC') {
          sendNotice2(data.name + '的时间有冲突');
        } else if (data.why == 'DATE_NO') {
          sendNotice2('会议时间不合法');
        }
      }
    });
}

function delMeeting(e) {
  $.post('api/delMeeting', { mid: e.getAttribute('value') }, (data) => {
    illegalTest(data);
    $('#sureDel').modal('hide');
    getList();
  });
}

function outMeeting(e) {
  $.post('api/quitMeeting', { mid: e.getAttribute('value') }, (data) => {
    illegalTest(data);
    $('#sureQuit').modal('hide');
    getList();
  });
}

function addMeeting() {
  $('#Alert_').alert('close');
  document.getElementById('gridSystemModalLabel').innerHTML = '发起会议';
  document.getElementById('sendMeeting').value = 'editMeeting';
  document.getElementById('input_detail').value = '';
  document.getElementById('sendMeeting').setAttribute('data-mid', 0);
  document.getElementById('meetName').value = '';
  document.getElementById('input_startDate').value = '';
  document.getElementById('input_endDate').value = '';
  var checkbox = document.getElementsByName('input_user');
  for (i in checkbox) {
    checkbox[i].checked = false;
  }
}

function editMeeting(e) {
  $('#Alert_').alert('close');
  document.getElementById('gridSystemModalLabel').innerHTML = '编辑会议';
  document.getElementById('sendMeeting').value = 'editMeeting';
  document.getElementById('sendMeeting')
    .setAttribute('data-mid', e.getAttribute('value'));
  var mid = e.getAttribute('value');
  var meetingList = list.meetings;
  for (i in meetingList) {
    if (mid == meetingList[i].mid) {
      document.getElementById('meetName').value = meetingList[i].name;
      document.getElementById('input_detail').value = meetingList[i].detail;
      document.getElementById('input_startDate').value =
        meetingList[i].startDate;
      document.getElementById('input_endDate').value = meetingList[i].endDate;
      var checkbox = document.getElementsByName('input_user');
      var actorList = meetingList[i].actors.split(',');
      for (j in checkbox) {
        checkbox[j].checked = false;
        for (k in actorList) {
          if (checkbox[j].value == actorList[k]) {
            checkbox[j].checked = true;
          }
        }
      }
    }
  }
}

function dealModel(e) {
  document.getElementById('deleteIt').value = e.getAttribute('value');
  var mid = e.getAttribute('value');
  var meetingList = list.meetings;
  for (i in meetingList) {
    if (mid == meetingList[i].mid) {
      document.getElementById('dmName').innerHTML = meetingList[i].name;
    }
  }
}

function quitModel(e) {
  document.getElementById('quitIt').value = e.getAttribute('value');
  var mid = e.getAttribute('value');
  var meetingList = list2.meetings;
  for (i in meetingList) {
    if (mid == meetingList[i].mid) {
      document.getElementById('qmName').innerHTML = meetingList[i].name;
    }
  }
}

function addNotice() {
  if (document.getElementById('noticeData').value == '') {
    $('#noticeData').focus();
    return;
  }
  $.post('api/addNotice', {
    data: document.getElementById('noticeData').value
  }, (data) => {
    illegalTest(data);
    document.getElementById('noticeData').value = '';
    if (data.state == 'success') {
      getList();
    } else if (data.why == 'TIME_LIMIT') {
      alert('一个小时只能发一次公告');
    }
  });
}

function illegalTest(data) {
  if (data.why == 'ILLEGAL_SIGN' || data.why == 'ILLEGAL_TOKEN') {
    window.location.href = 'index.html?op=4';
  }
}