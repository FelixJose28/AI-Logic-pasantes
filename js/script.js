const toggle = document.querySelector('.toggle_btn');
const sidebar = document.querySelector('#sidebar');
const main = document.querySelector('#main');
toggle.addEventListener("click",function(){
    toggleMove();
});

function toggleMove() {
    sidebar.classList.toggle('active');
    // main.classList.toggle('resaze')
}