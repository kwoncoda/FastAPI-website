//document.write('<script src="./JS_File/cookie.js"></script>');
document.write('<script src="./JS_File/setting.js"></script>');

window.onload = async function(){
    //console.log("오토체크중");
    if (localStorage.getItem('auto_token')){
        
        let AUTO_TOKEN = localStorage.getItem('auto_token');

        try{
            const res = await fetch(API_URL + "/autologin",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({auto_token: AUTO_TOKEN}),
            });
            //console.log(res);
            const result = await res.json();
            if(result["status"] == 201){
                window.localStorage.setItem("access_token",result["data"]["access_token"]);
                window.localStorage.setItem("refresh_token",result["data"]["refresh_token"]);

                alert("자동로그인 되었습니다.");

                window.location.href = "mainpage.html";

            }
        } catch (error){
            console.log(error);
        }

    }
}