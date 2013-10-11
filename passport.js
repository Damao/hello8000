if (localStorage.txtLoginName) {
	document.getElementById("txtLoginName").value = localStorage.txtLoginName;
}
if (localStorage.rbtnToken == 1) {
	document.getElementById("rbtnToken").click();
} else {
	document.getElementById("rbtnEx").click();
}
document.getElementById("txtLoginName").onblur = function () {
	localStorage.txtLoginName = this.value;
};
document.getElementById("txtPassword").focus();

window.onbeforeunload = function () {
	if (document.getElementById("rbtnEx").checked) {
		localStorage.rbtnToken = 0;
	} else {
		localStorage.rbtnToken = 1;
	}
};