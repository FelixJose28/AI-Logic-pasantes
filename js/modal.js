const btn_close_m = document.querySelector("#btnx_close_m");
const btn_show_m = document.querySelector('#btn_show_m');

const myModal = document.querySelector("#myModal");


function callModal() {
    myModal.style.display = "block"
}
function closeModal() {
    myModal.style.display = "none"
}
btn_close_m.addEventListener('click',closeModal);

window.onclick = function(event) {
    if (event.target == myModal) {
        myModal.style.display = "none";
    }
}

