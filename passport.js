var strNotification;
if (localStorage.txtLoginName) {
	document.getElementById("txtLoginName").value = localStorage.txtLoginName;
	strNotification = "自动填写用户名: " + localStorage.txtLoginName;
} else {
	strNotification = "用户名下次就会自动填写";
}
if (localStorage.rbtnToken == 1) {
	document.getElementById("rbtnToken").click();
	strNotification = strNotification + "\n验证: Token";
} else {
	document.getElementById("rbtnEx").click();
	strNotification = strNotification + "\n验证: Outlook";
}
document.getElementById("txtLoginName").onblur = function () {
	localStorage.txtLoginName = this.value;
};
document.getElementById("txtPassword").focus();
strNotification = strNotification + "\n聚焦到密码输入";

window.onbeforeunload = function () {
	if (document.getElementById("rbtnEx").checked) {
		localStorage.rbtnToken = 0;
	} else {
		localStorage.rbtnToken = 1;
	}
};

chrome.runtime.sendMessage({msg: strNotification},function(response) {
	console.log(response);
});