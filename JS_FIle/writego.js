const wirtegoBtn = document.getElementById("writebtn");
document.write('<script src="./JS_File/cookie.js"></script>');


wirtegoBtn.addEventListener("click",async function (e) {
    check_token()
    window.location.href = "writepage.html";
    
})