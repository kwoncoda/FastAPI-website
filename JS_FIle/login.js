//document.write('<script src="./JS_File/cookie.js"></script>');
document.write('<script src="./JS_File/setting.js"></script>');


const loginBtn = document.getElementById("login-btn");


loginBtn.addEventListener("click", async function (e){
    let id = document.getElementById("login-id").value;
    let pw = document.getElementById("login-pw").value;
    

    if(id == ""){
        alert("id를 입력해주세요.");
    } else if(pw == ""){
        alert("pw를 입력해주세요.");
    } else {
        try{
            const res = await fetch(API_URL + "/login",{
                //mode: 'no-cors',
                method: "POST",
                headers: HEADERS,
                body: JSON.stringify({
                    user_id: id,
                    password: pw,
                }),
                // 인증서 보내기 위한 옵션(쿠키)
                credentials: "include",
            });
            const result = await res.json();
            //console.log(result);
            if(result["status"] == 201){
                //console.log(result["data"]);
                window.localStorage.setItem("access_token",result["data"]["access_token"]);
                window.localStorage.setItem("refresh_token",result["data"]["refresh_token"]);
                window.localStorage.setItem("user_nick",result["data"]["nick"]);

                //document.cookie = `access_token=${result["data"]["access_token"]}; path=/; expires=Tue,${result["access_expire"]}`;
                //document.cookie = `access_token_test2=${result["data"]["access_token"]}; path=/; expires=Tue, ${result["access_expire"].toUTCString()}`;
                //document.cookie = `refresh_token=${result["data"]["refresh_token"]}; path=/; expires=Tue, 01 Jan 2030 12:00:00 UTC`;


                alert("로그인 되었습니다.");

                //로그인 성공 후 이동창
                window.location.href = "mainpage.html";
            } else if(result["status"] == 401){
                alert("아이디와 비밀번호가 일치하지 않습니다.");
                document.getElementById("login-id").value = null;
                document.getElementById("login-pw").value = null;
            }
        }catch(error){
            console.log(error);
        }
    } 
});