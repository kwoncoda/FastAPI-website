let pw1 = document.getElementById("user_pw1");
let message_p = document.getElementById("pw1ErrorMessage");
let pw1_change = p => {

    message_p.innerHTML = " ";

    if (p.value.length < 6) {

        message_p.innerHTML = "Error, length validation : " + p.value.length;

    }



    var myRe = /^[a-z0-9]+$/i;

    var myArray = myRe.exec(p.value);

    if (myArray == null) {

        message_p.innerHTML = "Error, number and character";

    }



    var checkNumber = p.value.search(/[0-9]/g);

    var checkEnglish = p.value.search(/[a-z]/ig);

    if (checkNumber < 0 || checkEnglish < 0) {

        message_p.innerHTML = "숫자 영문 조합으로 입력해주세요.";

    }

}



//비밀번호 재확인

let pw2 = document.getElementById("user_pw2");

let message_p2 = document.getElementById("pw2ErrorMessage");

let pw2_change = p2 => {

    message_p2.innerHTML = " ";

    if (pw1.value != pw2.value) {

        message_p2.innerHTML = "Error, 비밀번호를 재확인해주세요.";

    }

}