const closeBtn = document.querySelector('#btn-menu-close');
const openBtn = document.querySelector('#btn-menu-open');
const sidebar = document.querySelector('#sidebar-container');
const main = document.querySelector('#main');

closeBtn.addEventListener("click", function() {
    sidebar.hidden = !sidebar.hidden;
    openBtn.hidden = !openBtn.hidden;
});

openBtn.addEventListener("click", function() {
    sidebar.hidden = !sidebar.hidden;
    openBtn.hidden = !openBtn.hidden;
});