let id = document.getElementById("user_Id");
let message = document.getElementById("idErrorMessage");
let id_change = t => {
    message.innerHTML = " ";
    if (t.value.length < 5) {
        message.innerHTML = "Error, length validation: " + t.value.length;
    }
    var myRe = /^[a-z0-9]+$/i;
    var myArray = myRe.exec(t.value);
    if (myArray == null) {
        message.innerHTML = "Error, number and character: " + t.value;
    }

    var checkNumber = t.value.search(/[0-9]/g);
    var checkEnglish = t.value.search(/[a-z]/ig);
    if (checkNumber < 0 || checkEnglish < 0) {
        message.innerHTML = "숫자 영문 조합으로 입력해주세요.";
    }
}