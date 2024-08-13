document.write('<script src="./JS_File/setting.js"></script>');
const boardList = document.querySelector('.board-list');

// 창 띄울시 무조건 발동
window.onload = async function () {
    // 'autoLogin' 키에 값이 존재하면 체크박스를 체크
    if (localStorage.getItem('auto_token')) {
        document.getElementById('autoLogin').checked = true;
    }

    // 사용자 이름을 로컬 스토리지 또는 서버에서 가져와 표시
    const username = localStorage.getItem('user_nick') || '사용자';
    document.getElementById('username').textContent = `${username}님`;

    try {
        const res = await fetch(API_URL + '/loadboard', {
            method: "GET",
            headers: HEADERS,
            credentials: "include",
        });
        const result = await res.json();
        if (result["status"] == 201) {
            loadboard(1,result);
        }
    } catch (error) {
        console.log(error);
    }


};

async function loadboard(page,result) {

    const itemsPerPage = 10; // 한 페이지에 표시할 항목 수
    const boardList = document.getElementById('board-list');
    const paginationDiv = document.getElementById('pagination');

    // 현재 페이지
    let PAGE = page - 1;
    //최대 페이지
    let MAXPAGE = 10;

    const boarddata = result["data"][PAGE];
    const totalItems = result["count"];

    boardList.innerHTML = '';
    paginationDiv.innerHTML = '';

    boarddata.forEach(element => {
        const boardItem = document.createElement('div');
        boardItem.className = 'board-item';
        boardItem.onclick = () => {
            window.location.href = `/origin.html?num=${element.num}`;
        };

        const titleDiv = document.createElement('div');
        titleDiv.className = 'title';
        titleDiv.textContent = element.title;

        const metaDiv = document.createElement('div');
        metaDiv.className = 'meta';
        metaDiv.textContent = `작성자: ${element.writer} | 작성일: ${element.write_date} | 조회수: ${element.hitcount}`;

        boardItem.appendChild(titleDiv);
        boardItem.appendChild(metaDiv);
        boardList.appendChild(boardItem);
    });


    //총 나올 페이지
    let totalPages = Math.ceil(totalItems / itemsPerPage);

    // '이전' 버튼 생성
    if (page > MAXPAGE) {
        const nextButton = document.createElement('button');
        nextButton.className = 'page-button';
        nextButton.textContent = '◀이전';
        nextButton.onclick = () => {
            page -= 10;
            loadboard(page - 10);
        }
        paginationDiv.appendChild(nextButton);
    }

    let markpage;
    if (totalPages - (Math.ceil(page / 10) * 10) > 10) {
        markpage = 10;
    } else {
        markpage = totalPages - (Math.ceil(page / 10) - 1) * 10;
    }
    // 페이지네이션 생성    
    for (let i = (Math.ceil(page / 10) - 1) * 10 + 1; i <= markpage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'page-button';
        pageButton.textContent = i;

        // 현재 페이지를 강조
        if (i === page) {
            pageButton.classList.add('active');
        }

        pageButton.onclick = () => loadboard(i,result);
        paginationDiv.appendChild(pageButton);
    }

    // '다음' 버튼 생성
    if (totalPages - (Math.ceil(page / 10) - 1) * 10 > MAXPAGE) {
        const nextButton = document.createElement('button');
        nextButton.className = 'page-button';
        nextButton.textContent = '다음▶';
        nextButton.onclick = () => {
            page += 10;
            loadboard(page + 10);
        }
        paginationDiv.appendChild(nextButton);
    }
}