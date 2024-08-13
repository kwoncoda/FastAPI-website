const autologinBtn = document.getElementById("autoLogin");
document.write('<script src="./JS_File/cookie.js"></script>');
document.write('<script src="./JS_File/setting.js"></script>');


autologinBtn.addEventListener("change",async function (e) {

    if(check_token()){
        if(this.checked){
            let REFRESH_TOKEN = localStorage.getItem('refresh_token');
            let AUTO_TOKEN;
            try{
                const res = await fetch(API_URL + "/autotoken",{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({refresh_token: REFRESH_TOKEN}),
                });
                const result = await res.json();
                if(result["status"] == 201){
                    AUTO_TOKEN = result["data"]["auto_token"];
                }

            }catch(error){
                console.log(error);
            }

            window.localStorage.setItem("auto_token",AUTO_TOKEN);
            alert("자동로그인을 설정하였습니다.");
        } else {
            localStorage.removeItem('auto_token');
            alert("자동로그인이 해제되었습니다.");
        }
    }
});