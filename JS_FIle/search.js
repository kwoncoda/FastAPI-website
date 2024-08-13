const searchBtn = document.getElementById("search");
document.write('<script src="./JS_File/setting.js"></script>');
document.write('<script src="./JS_File/mainpage.js"></script>');


searchBtn.addEventListener("click", async function (e) {

    let OPTION = document.getElementById("search-option").value;
    let TEXT = document.getElementById("search-text").value;

    try{
        const res = await fetch(API_URL + "/search",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                option: OPTION,
                text: TEXT,
            })
        });
        const result = await res.json();

        loadboard(1,result);

    }catch(error){
        console.log(error);
    }

})