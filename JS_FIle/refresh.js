document.write('<script src="./JS_File/cookie.js"></script>');

document.addEventListener("DOMContentLoaded", async function () {
    //console.log("토큰값 확인중");
    await check_token();
})