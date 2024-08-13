document.write('<script src="./JS_File/setting.js"></script>');
//document.write('<script src="./JS_File/cookie.js"></script>');

const logoutBtn = document.getElementById("logout");


logoutBtn.addEventListener("click",async function (e) {
    try{
        // const res = await fetch(API_URL + "/logout",{
        //     method: "GET",
        //     headers: HEADERS,
        //     credentials: "include",
        // });
        // const result = await res.json();
        // console.log(result);

        // removeCookie("access_token");
        // removeCookie("refresh_token");

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auto_token');
        localStorage.removeItem('user_nick');
        alert("로그아웃되었습니다.");

        window.location.href = "login.html";
    }catch(error){
        console.log(error);
    }
});
