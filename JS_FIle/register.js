const registerBtn = document.getElementById("register-btn");

const API_URL = "http://localhost:8050";
const HEADERS = {
    "Content-Type": "application/json",
    Accept: "applcation/json",
};

registerBtn.addEventListener("click", async function(){
    let id = document.getElementById("register-id").value;
    let name = document.getElementById("register-name").value;
    let pw = document.getElementById("register-pw").value;
    let checkPW = document.getElementById("register-check-pw").value;
    let nick = document.getElementById("register-nickname").value;

    if(id==""){
        alert("아이디를 입력해주세요.");
    } else if(name == ""){
        alert("이름을 입력해주세요.");
    } else if(nick == ""){
        alert("닉네임을 입력해주세요.");
    } else if(pw=="" || checkPW==""){
        alert("비밀번호를 입력해주세요.");
    } else if(pw != checkPW){
        alert("비밀번호가 다릅니다.");
    } else{
        try{
            const res = await fetch(API_URL + "/register", {
                method: "POST",
                headers: HEADERS,
                body: JSON.stringify({
                    name: name,
                    user_id: id,
                    password: pw,
                    nickname: nick
                }),
            });
            const result = await res.json();
            //console.log(result);
            alert("회원가입 되었습니다.");
            
            // 회원가입 성공후 로그인창
            window.location.href = "login.html";
        } catch(error){
            console.log(error);
        }
    }
});