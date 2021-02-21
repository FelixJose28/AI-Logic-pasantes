// cargar los componenetes desde el DOM 
const closeBtn = document.querySelector('#btn-menu-close');
const openBtn = document.querySelector('#btn-menu-open');
const bigMenuBtn = document.querySelector('#big-menu-btn');
const smallMenuBtn = document.querySelector('#small-menu-btn');
const sidebar = document.querySelector('#sidebar-container');
const a = document.getElementById("menu-container-optiones").querySelectorAll(".menu-link");
const main = document.querySelector('#main');



//evento para cerrar el menu
// closeBtn.addEventListener("click", function() {
//     sidebar.hidden = !sidebar.hidden;
//     openBtn.hidden = !openBtn.hidden;
// });


// agregar evento a openBtn para abrir el menu 
openBtn.addEventListener("click", function() {
    sidebar.hidden = !sidebar.hidden;
    openBtn.hidden = !openBtn.hidden;
});


//listado de iconos 
let icons = ["fas fa-user-circle", "fas fa-file-alt", "fas fa-clipboard-list", "fas fa-users", "fas fa-book-open",
    "fas fa-cog", "fas fa-sign-out-alt"
];


//listado de menu options o textos  
let optiones = ["Pefil", "Tareas", "Evaluaciones", "Pasantes", "Convocatorias",
    "Ajustes", "Cerrar Seccion"
];


// el smallMenuBtn perminete ver el menu mas pequeño 
smallMenuBtn.addEventListener("click", () => {
    let index = 0;
    a.forEach(element => {
        element.innerHTML = `<i class="${icons[index]} h5"></i>`;
        index++;
    })

    smallMenuBtn.hidden = !smallMenuBtn.hidden;
    bigMenuBtn.hidden = !bigMenuBtn.hidden;

})


// el bigMenuBtn perminete ver el menu mas grande  
bigMenuBtn.addEventListener("click", () => {
    let index = 0;
    a.forEach(element => {
        element.innerHTML = `<i class="${icons[index]} mx-right-mid h5"></i>${optiones[index]}`;
        index++;
    })

    smallMenuBtn.hidden = !smallMenuBtn.hidden;
    bigMenuBtn.hidden = !bigMenuBtn.hidden;

})