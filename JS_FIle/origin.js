document.write('<script src="./JS_File/setting.js"></script>');
document.write('<script src="./JS_File/cookie.js"></script>');

const backBn = document.getElementById("back-button");
const editBtn = document.getElementById("edit-button");
const deleteBtn = document.getElementById("delete-button");


// URLSearchParams 객체를 생성하여 쿼리 스트링을 파싱
let params = new URLSearchParams(window.location.search);

// 'num'이라는 파라미터의 값을 추출
let NUM = params.get('num');


window.onload = async function(){

    await check_token()

    readload()

}


function readload(){

    let ACCESS_TOKEN = localStorage.getItem('access_token');


    fetch(API_URL + "/readload", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            num: NUM,
            access_token: ACCESS_TOKEN,
            count: true,
        })
    })
    .then(res => res.json())
    .then(result => {

        TITLE = result["data"]["title"];
        DATA = result["data"]["data"];
        WRITER = result["writer"];
        DATE = result["data"]["write_date"];
        HITCOUNT = result["data"]["hitcount"];

        document.getElementById("chrome").textContent = `${TITLE}`;
        document.getElementById('post-title').textContent = TITLE;


        const valueDiv = document.createElement('div');
        valueDiv.className = 'value';
        valueDiv.innerHTML = DATA;

        document.getElementById('board-content').appendChild(valueDiv);
        document.getElementById('meta').textContent = `작성자: ${WRITER} | 작성일: ${DATE} | 조회수: ${HITCOUNT}`;


        if(result["status"] == 201){
            //console.log("본인글");
        }else{
            editBtn.style.display = 'none';
            deleteBtn.style.display = 'none';
        }
    })
    .catch(error =>{
        console.log(error);
    });


    
}

//뒤로가기
backBn.addEventListener("click",function (e) {
    
    check_token();

    window.location.href = "mainpage.html";
})


//수정클릭
editBtn.addEventListener("click",function (e){

    check_token();

    window.location.href = `/writepage.html?num=${NUM}`;
})


//삭제 클릭
deleteBtn.addEventListener("click",function (e){

    check_token();

    let ACCESS_TOKEN = localStorage.getItem('access_token');

    if(confirm("정말 삭제하시겠습니까?") == true){
        fetch(API_URL + "/deletepost", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                num: NUM,
                access_token: ACCESS_TOKEN
            })
        })
        .then(res => res.json())
        .then(result => {
            alert("확인");
            //console.log(result);
    
        })
        .catch(error =>{
            console.log(error);
        });
        alert("삭제 되었습니다.");
        window.location.href = "mainpage.html";
    }
})