async function run() {
    const params = new URLSearchParams(new URL(document.URL).search);
    const status = params.get("status");
    const loadMoreBtn = document.getElementById("load_more");
    const ongoingBtn = document.getElementById("ongoing");
    const pastBtn = document.getElementById("past");

    loadMoreBtn.addEventListener("click", async (e) => {
        let target = e.currentTarget;
        let next_page = target.getAttribute("data");
        target.setAttribute("data", parseInt(next_page) + 1);
        let res = await fetch(`/quests/past?page=${next_page}&status=${status || ""}`);
        if (res.headers.get("hasMore") === "false") target.style.display = "none";
        let content = await res.json();
        content.forEach(e => document.querySelector("#content-past > ul").innerHTML += e.content);
    });

    ongoingBtn.addEventListener("click", (e) => {
        e.target.setAttribute("checked", "checked");
        pastBtn.removeAttribute("checked");
    });

    pastBtn.addEventListener("click", (e) => {
        e.target.setAttribute("checked", "checked");
        ongoingBtn.removeAttribute("checked");
    });

    show_data(status);
}

async function show_data(status) {
    const loadMoreBtn = document.getElementById("load_more");
    const pastBtn = document.getElementById("past");
    const ongoingBtn = document.getElementById("ongoing");

    if (status) {
        pastBtn.setAttribute("checked", "checked");
        ongoingBtn.removeAttribute("checked");
    } //show past content if url params contains status to filter

    let [ongoing_res, past_res] = await Promise.all([
        fetch("/quests/ongoing"),
        fetch(`/quests/past?status=${status || ""}`)
    ]); //fetching ongoing and past content from server

    let ongoing_content = await ongoing_res.json();
    document.getElementById("content-ongoing").innerHTML = ongoing_content.join(""); //inserting the ongoing list into document

    if (past_res.headers.get("hasMore") === "false") loadMoreBtn.style.display = "none"; //hiding load more button if there is no more content

    let past_content = await past_res.json();
    document.querySelector("#content-past > ul").innerHTML = ""; //clearing div
    past_content.forEach(e => document.querySelector("#content-past > ul").innerHTML += e.content); //insereting past list
}
run()