let name = document.getElementById("user_name");
let message_name = document.getElementById("nameErrorMessage");
let name_change = name => {

    message_name.innerHTML = " ";

    var myRe = /^[가-힣|a-z|A-Z|\*]+$/;

    var myArray = myRe.exec(name.value);

    if (myArray == null) {

        message_name.innerHTML = " 정확히 입력해주세요. ";

    }

}