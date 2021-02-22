
// Load the side bar into `sidebar-container`
loadSidebar();

const OPEN_SIDEBAR_ICON = "fa-bars";
const CLOSE_SIDEBAR_ICON = "fa-times"; 
const SIDEBAR_VISIBLE = "sidebar-visible";

const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main");
const btn = document.getElementById("sidebar-btn");

// Initial state of the sidebar
let isVisible = true;

// Set the initial state
showSidebar(isVisible);

// Hide the sidebar if visible otherwise close it
function hideOrShowSideBar() { 
    showSidebar(!isVisible);
}  

// Change the visibility state of the sidebar
function showSidebar(visible){
    isVisible = visible;

    if (visible) {
        sidebar.setAttribute(SIDEBAR_VISIBLE, true);
        main.setAttribute(SIDEBAR_VISIBLE, true);
        btn.setAttribute(SIDEBAR_VISIBLE, true);

        if (!btn.classList.replace(OPEN_SIDEBAR_ICON, CLOSE_SIDEBAR_ICON)) {
            btn.classList.add(CLOSE_SIDEBAR_ICON);
        }
    } else {
        sidebar.setAttribute(SIDEBAR_VISIBLE, false);
        main.setAttribute(SIDEBAR_VISIBLE, false);
        btn.setAttribute(SIDEBAR_VISIBLE, false);

        if (!btn.classList.replace(CLOSE_SIDEBAR_ICON, OPEN_SIDEBAR_ICON)) {
            btn.classList.add(OPEN_SIDEBAR_ICON);
        }
    }
}


function loadSidebar(){
    const sidebarContainer = document.getElementById("sidebar-container");

    sidebarContainer.innerHTML = `
    <div id="sidebar">
    <div class="sidebar-menu">
        <ul class="options_top">
            <li class="  border-rounded-small">
                <a href="../pasantes/perfil_pasante.html" class="text-white">
                    <i class="far fa-user-circle mx-right-mid"></i> Perfil
                </a>
            </li>
            <li class="  border-rounded-small">
                <a class="text-white">
                    <i class="far fa-file-alt mx-right-mid"></i> Tarea
                </a>
                <ul class="submenu">
                    <li><a href="../tarea/tarea.html">Crear tarea</a></li>
                    <li><a href="../tarea/Listado-tarea.html">Sin asignar</a></li>
                    <li><a href="../tarea/tareas-entregadas.html">Ver entregas</a></li>
                </ul>
            </li>

            <li class="  border-rounded-small">
                <a href="../examenes/ver_examenes.html" class="text-white">
                    <i class="fas fa-clipboard-list mx-right-mid"></i>Examenes
                </a>
            </li>
            <li class="  border-rounded-small active">
                <a class="text-white">
                    <i class="fas fa-users mx-right-mid"></i> Pasantes
                </a>
                <ul class="submenu">
                    <li><a href="../pasantes/ver_solicitudes.html">Ver solicitudes</a></li>
                    <li><a href="../pasantes/estado_solicitudes.html">Estado solicitudes</a></li>
                </ul>
            </li>
            <li class="  border-rounded-small">
                <a href="#" class="text-white">
                    <i class="fas fa-book-open mx-right-mid"></i>Convocatorias
                </a>
            </li>
        </ul>
        <ul class="options_bottom">
            <li class="  border-rounded-small">
                <a href="#" class="text-white">
                    <i class="fas fa-cog mx-right-mid"></i>Ajustes
                </a>
            </li>
            <li class="  border-rounded-small">
                <a href="#" class="text-white">
                    <i class="fas fa-sign-out-alt mx-right-mid"></i>Cerrar Session
                </a>
            </li>
        </ul>
    </div>
</div>

<!-- Open/Close Button -->
<div class="btn-bar">
    <i class="fas fa-bars" id="sidebar-btn" onclick="hideOrShowSideBar()"></i>
</div>
    `;
}