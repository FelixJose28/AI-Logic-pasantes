const toggle = document.querySelector('.toggle_btn');
const sidebar = document.querySelector('#sidebar');
toggle.addEventListener("click",function(){
    toggleMove();
});

function toggleMove() {
    sidebar.classList.toggle('active');
}