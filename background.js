// Copyright (c) 2013 http://bigC.at All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var version = 12;
var changeLog = "更新日志\n" +
	"登陆页面记住用户名记住验证类型,\n默认聚焦密码框";


function notification(msg) {
	// Create a simple text notification:
	var notify = webkitNotifications.createNotification(
		'img/QQ-logo_48.png',  // icon url - can be relative
		'Hello 8000',  // notification title
		msg  // notification body text
	);

	notify.show();

	setTimeout(function () {
		notify.cancel();
	}, 15000);
}
if (localStorage.version == undefined || localStorage.version < version) {
	notification(changeLog);
	localStorage.version = version;
} else {
	localStorage.version = version;
}

//formally fk8000
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete' && tab.active) {
		chrome.tabs.executeScript(tabId, {code: '' +
			'try {' +
			'if (document.URL.indexOf("tencentrawurl") > 0) {' +
			' window.location.href = decodeURIComponent(document.URL.replace(/.*?tencentrawurl=/g, "")); ' +
			'}' +
			'document.getElementById("btnVisit30").click();' +
			'} catch (e) {}',
			runAt: "document_end"
		});
	}
});
