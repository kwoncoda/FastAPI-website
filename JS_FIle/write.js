const uploadBtn = document.getElementById("uploadwrite");
const backBtn = document.getElementById("backBtn");
document.write('<script src="./JS_File/setting.js"></script>');
document.write('<script src="./JS_File/cookie.js"></script>');


// SimpleMDE 초기화
var simplemde = new SimpleMDE({ element: document.getElementById("content") });

// URLSearchParams 객체를 생성하여 쿼리 스트링을 파싱
let params = new URLSearchParams(window.location.search);

// 'num'이라는 파라미터의 값을 추출
let NUM = params.get('num');

let ACCESS_TOKEN = localStorage.getItem('access_token');

//수정인지 새글입력인지 구분(기본값 새글)
let NEWWRITE = true;

window.onload = async function(){

    if(NUM != null){
        //수정이므로 변경
        NEWWRITE = false

        try{
            const res = await fetch(API_URL + "/readload", {
                method: "POST",
                headers: {
                    "COntent-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    num: NUM,
                    access_token: ACCESS_TOKEN,
                    count: NEWWRITE,
                })
            })
            const result = await res.json();

            let TITLE = result["data"]["title"];
            let DATA = result["data"]["data"];

            //console.log(DATA);

            document.getElementById("title").value = TITLE;
            simplemde.value(DATA);


        }catch(error){
            console.log(error);
        }   
    }
}







// 제출 처리
uploadBtn.addEventListener("click",async function (e) {

    await check_token();

    let TITLE = document.getElementById("title").value;
    let VALUE = simplemde.value();

    if(NUM==null){
        NUM="-1";
    }

    try {
        

        const res = await fetch(API_URL + "/uploadwrite", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                title: TITLE,
                data: VALUE,
                access_token: ACCESS_TOKEN,
                newwrite: NEWWRITE,
                num:NUM,
            }),
        });

        const result = await res.json();
        if (result["status"] == 201) {
            alert("작성되었습니다.");
            window.location.replace("mainpage.html");
        }
    } catch (error) {
        console.log(error);
    }
});


//뒤로가기  
backBtn.addEventListener("click",function (e) {
    
    check_token();

    window.location.href = "mainpage.html";
})
