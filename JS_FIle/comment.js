
document.write('<script src="./JS_File/cookie.js"></script>');
document.write('<script src="./JS_File/setting.js"></script>');
const commentBtn = document.getElementById("submit-comment");


// 제출 클릭시
commentBtn.addEventListener("click",function(){
    check_token();

    let ACCESS_TOKEN = localStorage.getItem('access_token');
    let VALUE = document.getElementById("comment-text").value;

    console.log(VALUE);

    if(VALUE == ""){
        alert("댓글을 입력하세요.");
    }else{
        fetch(API_URL + "/commentupload",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                num: NUM,
                text: VALUE,
                access_token: ACCESS_TOKEN,
            })
        })
        .then(res => res.json())
        .then(result => {
            if (result["status"] == 201) {
                console.log("업로드 완료");
                location.reload(true);
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
})