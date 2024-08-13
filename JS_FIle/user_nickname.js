let nick = document.getElementById("user_nick");
let message_n = document.getElementById("nickErrorMessage");
let nick_change = n => {

    message_n.innerHTML = " ";

    if (n.value.length < 5) {

        message_n.innerHTML = "Error, length validation: " + n.value.length;

    }

    var myRe = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|\*]+$/;

    var myArray = myRe.exec(n.value);

    if (myArray == null) {

        message_n.innerHTML = "Error, number and character: " + n.value;

    }

}