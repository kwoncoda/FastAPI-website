document.write('<script src="./JS_File/setting.js"></script>');

// // 쿠키 설정
// function setCookie(name, value, expire){
//     // var date = new Date();
//     // date.setMilliseconds(expire*60*1000);
//     // value.expire = date.toUTCString;
//     //console.log(value);
//     //쿠키로 안하기로 함
//     //document.cookie = name + '=' + value + '; path=/; expires=Tue, '+date.toUTCString();
// }

// 쿠키 가져오기
// function getCookie(name) {
//     let matches = document.cookie.match(
//         new RegExp(
//             "(?:^|; )" +
//             name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
//             "=([^;]*)"
//         )
//     );
//     return matches ? decodeURIComponent(matches[1]) : undefined;
// }

//쿠키 삭제
// function removeCookie(name){
//     document.cookie = name + '=; path=/; expires=Tue, 01 Jan 1970 00:00:00 UTC;';
// }

// 토큰 체크
async function check_token(){
    // let REFRESH_TOKEN = getCookie("refresh_token");
    // let ACCESS_TOKEN = getCookie("access_token");

    let ACCESS_TOKEN = localStorage.getItem('access_token');
    let REFRESH_TOKEN = localStorage.getItem('refresh_token');

    try{
        const res = await fetch(API_URL + "/expirecheck",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({access_token: ACCESS_TOKEN, refresh_token: REFRESH_TOKEN}),
        });
        //console.log(res);
        const result = await res.json();
        if(result["status"] == 100){
            //console.log("access_token만료");
            localStorage.removeItem('access_token');
            //alert("엑세스토큰만료");
            ACCESS_TOKEN = undefined;
        } else if(result["status"] == 200){
            //console.log("모든 토큰 만료");
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_nick");
        }

    }catch(error){
        console.log(error);
    } 

    if (ACCESS_TOKEN == undefined) {
        if (REFRESH_TOKEN == undefined) {
            localStorage.removeItem("auto_token");
            alert("재인증이 필요합니다.");
            window.location.replace("login");
        } else {
            try {
                //console.log("리프레쉬 시작");   
                const res = await fetch(API_URL + "/refresh", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ refresh_token: REFRESH_TOKEN }),
                });
                //console.log(res);
                const result = await res.json();
                if (result["status"] == 201) {
                    window.localStorage.setItem("access_token",result["data"]["access_token"]);
                    //return true;
                }
            } catch (error) {
                console.log(error);
                //return false;
            }
        }
    } else {
        //console.log("토큰 살아있음");
    }

}


// 토큰 체크
// function check_token() {
//     // let REFRESH_TOKEN = getCookie("refresh_token");
//     // let ACCESS_TOKEN = getCookie("access_token");

//     let ACCESS_TOKEN = localStorage.getItem('access_token');
//     let REFRESH_TOKEN = localStorage.getItem('refresh_token');

//     fetch(API_URL + "/expirecheck", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({ access_token: ACCESS_TOKEN, refresh_token: REFRESH_TOKEN }),
//     })
//         .then(res => res.json())
//         .then(result => {
//             if (result["status"] == 100) {
//                 console.log("access_token 만료");
//                 localStorage.removeItem('access_token');
//                 alert("엑세스 토큰 만료");
//                 ACCESS_TOKEN = undefined;
//             } else if (result["status"] == 200) {
//                 console.log("모든 토큰 만료");
//                 localStorage.removeItem("access_token");
//                 localStorage.removeItem("refresh_token");
//                 localStorage.removeItem("user_name");
//             }
//         })
//         .catch(error => {
//             console.log(error);
//         });
//     console.log("다음로직");

//     if (ACCESS_TOKEN == undefined) {
//         if (REFRESH_TOKEN == undefined) {
//             localStorage.removeItem("auto_token");
//             alert("재인증이 필요합니다.");
//             window.location.replace("login.html");
//         } else {
//             console.log("리프레쉬 시작");

//             return fetch(API_URL + "/refresh", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 credentials: "include",
//                 body: JSON.stringify({ refresh_token: REFRESH_TOKEN }),
//             })
//                 .then(res => res.json())
//                 .then(result => {
//                     if (result["status"] == 201) {
//                         window.localStorage.setItem("access_token", result["data"]["access_token"]);
//                         return true;
//                     } else {
//                         return false;
//                     }
//                 })
//                 .catch(error => {
//                     console.log(error);
//                     return false;
//                 });
//         }
//     } else {
//         console.log("토큰 살아있음");
//     }

// }