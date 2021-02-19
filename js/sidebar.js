const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main");
const btn = document.getElementById("sidebar-btn");

let isVisible = true;

function hideOrShowSideBar() { 
    isVisible = !isVisible;

    if (isVisible){
        sidebar.classList.remove("hidden");
        main.classList.remove("hidden");
        btn.classList.remove("hidden");
    } else {
        sidebar.classList.add("hidden");
        main.classList.add("hidden");
        btn.classList.add("hidden");
    }
}