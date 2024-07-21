initializePage()
async function initializePage() {
    const params = new URLSearchParams(new URL(document.URL).search);
    const status = params.get("status");
    const nextPageBtn = document.getElementById("next_page");
    const ongoingBtn = document.getElementById("ongoing");
    const pastBtn = document.getElementById("past");

    nextPageBtn.addEventListener("click", async (e) => {
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
    const nextPageBtn = document.getElementById("next_page");
    const pastBtn = document.getElementById("past");
    const ongoingBtn = document.getElementById("ongoing");

    if (status) {
        pastBtn.setAttribute("checked", "checked");
        ongoingBtn.removeAttribute("checked");
    }

    let [ongoing_res, past_res] = await Promise.all([
        fetch("/quests/ongoing"),
        fetch(`/quests/past?status=${status || ""}`)
    ]);

    let ongoing_content = await ongoing_res.json();
    document.getElementById("content-ongoing").innerHTML = ongoing_content.join("");

    if (past_res.headers.get("hasMore") === "false") nextPageBtn.style.display = "none";

    let past_content = await past_res.json();
    document.querySelector("#content-past > ul").innerHTML = "";
    past_content.forEach(e => document.querySelector("#content-past > ul").innerHTML += e.content);
}
