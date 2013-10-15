// Copyright (c) 2013 http://bigC.at All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var version = 21;
var changeLog = "更新日志\n" +
    "解决某些网站能打开,但是JS/CSS被8000拦截的问题\n" +
    "修复后台打开的tab没生效的bug";
var arrayFuckedURL = [];
var strFuckBackURL = "http://jiarihuwai.com/hello8000.html";
var oldChromeVersion = !chrome.runtime;

Array.prototype.delRepeat = function () {
    return this.filter(function (elem, pos, self) {
        return self.indexOf(elem) == pos;
    })
};


function urlDomain(data) {
    var a = document.createElement('a');
    a.href = data;
    return a.hostname;
}

function getFuckedURL() {
    if (localStorage.fuckedURL) {
        return localStorage.fuckedURL.split(",");
    } else {
        return [];
    }
}

function setFuckedURL(arrayFuckedURL) {
    localStorage.fuckedURL = arrayFuckedURL.toString();
}

function isFuckedURL(url) {
    return localStorage.fuckedURL.indexOf(url) > 0;
}

var onHeadersReceivedListener = function (details) {
    for (i = 0; i < details.responseHeaders.length; i++) {
        if (details.responseHeaders[i].name.toLocaleLowerCase() == 'content-type'
            && details.responseHeaders[i].value.indexOf("html") > 0
            && details.statusLine.indexOf("200") > 0) {
            arrayFuckedURL.push(urlDomain(details.url));
            arrayFuckedURL = arrayFuckedURL.delRepeat();
            setFuckedURL(arrayFuckedURL);

            if (isFuckedURL(urlDomain(details.url))) {
                console.log("found fuckedURL starting fuckback", details.url);
                doFuckBack();
                return;
            }
        }
    }
};
function stopMonitFucked() {
    if (chrome.webRequest.onHeadersReceived.hasListener(onHeadersReceivedListener)) {
        chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceivedListener);
    }
    startRequest({scheduleRequest: true});
}
function monitFucked() {
    stopMonitFucked();
    chrome.webRequest.onHeadersReceived.addListener(onHeadersReceivedListener, {urls: ["<all_urls>"], types: ["stylesheet", "script"]}, ["responseHeaders"]);
    console.log("start monitFucked()");
}

function doFuckBack() {
    if (localStorage.fuckedURL != "") {
        chrome.tabs.create({url: strFuckBackURL, selected: false}, function () {
            notification("某人在背后捅你刀子\n调用捅回去函数\n当前页如不能用请刷新\n"+localStorage.fuckedURL+'\n被8K拦截');
            localStorage.fuckedURL = "";
            stopMonitFucked();
            console.log("stopMonitFucked()");
        });
    }
}


function notification(msg, time, url) {
    // Create a simple text notification:
    var notify = webkitNotifications.createNotification(
        'img/QQ-logo_48.png',  // icon url - can be relative
        'Hello 8000',  // notification title
        msg  // notification body text
    );
    if (url) {
        notify.onclick = function () {
            chrome.tabs.create({url: url});
            console.log("creating " + url);
            if (notify) {
                notify.cancel();
            }
        };
    }

    notify.show();

    if (!time) {
        console.log("notification default time 10s");
        time = 10;
    }
    setTimeout(function () {
        notify.cancel();
    }, time * 1000);
}
if (localStorage.version == undefined || localStorage.version < version) {
    notification(changeLog, 15);
    localStorage.version = version;
} else {
    localStorage.version = version;
}


//formally fk8000
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {

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

chrome.runtime.onMessage.addListener(
    function (request) {
        notification(request.msg, 5);
    });


//alarm stuff
function scheduleRequest() {
    console.log('scheduleRequest');
    delay = 30;
    console.log('Scheduling for: ' + delay);
    console.log('Creating alarm');
    // Use a repeating alarm so that it fires again if there was a problem
    // setting the next alarm.
    chrome.alarms.create('monit', {delayInMinutes: delay});
}

function startRequest(params) {
    // Schedule request immediately. We want to be sure to reschedule, even in the
    // case where the extension process shuts down while this request is
    // outstanding.
    if (params && params.scheduleRequest) scheduleRequest();
}

function onInit() {
    console.log('onInit');
    monitFucked();
    if (!oldChromeVersion) {
        // (mpcomplete): We should be able to remove this now, but leaving it
        // for a little while just to be sure the monit alarm is working nicely.
        chrome.alarms.create('watchdog', {periodInMinutes: 10});
    }
}

function onAlarm(alarm) {
    console.log('Got alarm', alarm);
    // |alarm| can be undefined because onAlarm also gets called from
    // window.setTimeout on old chrome versions.
    if (alarm && alarm.name == 'watchdog') {
        onWatchdog();
    } else {
        monitFucked();
    }
}

function onWatchdog() {
    chrome.alarms.get('monit', function (alarm) {
        if (alarm || chrome.webRequest.onHeadersReceived.hasListener(onHeadersReceivedListener)) {
            console.log('monit exists. Yay.');
        } else {
            console.log('monit doesn\'t exist!? ' +
                'moniting now and rescheduling.');
            monitFucked();
        }
    });
}

if (oldChromeVersion) {
    onInit();
} else {
    chrome.runtime.onInstalled.addListener(onInit);
    chrome.alarms.onAlarm.addListener(onAlarm);
}