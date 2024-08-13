
document.write('<script src="./JS_File/cookie.js"></script>');
document.write('<script src="./JS_File/setting.js"></script>');
const commentBtn = document.getElementById("submit-comment");


// 제출 클릭시
commentBtn.addEventListener("click",function(){

    check_token();

    let ACCESS_TOKEN = localStorage.getItem('access_token');
    let VALUE = document.getElementById("comment-text").value;
    
    fetch(API_URL + "/commitupload",{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            text: VALUE,
            access_token: ACCESS_TOKEN,
        })
    })
    .then()
})


//수정수정수정
//수정수정수정