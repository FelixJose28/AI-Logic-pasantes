// Used for session storage
const SIDEBAR_KEY = "__sidebar";

// Initial state of the sidebar
let isVisible = getSessionSidebarVisibility();

// Load the side bar into `sidebar-container`
loadSidebar();

const OPEN_SIDEBAR_ICON = "fa-bars";
const CLOSE_SIDEBAR_ICON = "fa-times"; 
const SIDEBAR_VISIBLE = "sidebar-visible";

const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main");
const btn = document.getElementById("sidebar-btn");

// Button click event
btn.addEventListener("click", () => {
    setVisible(!isVisible);
});

window.onload = () => {
    // Hide the sidebar when is loaded in a devide with a width of 600 or less.
    // This close the sidebar when a hyperlink is clicked in a movile device.
    if (window.screen.width <= 600) {
        setVisible(false);
    }
}

// Set the initial state
setVisible(isVisible);

// Change the visibility state of the sidebar
function setVisible(visible){ 
    console.assert(typeof visible === "boolean");
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

    // Save the state in the browser current session
    window.sessionStorage.setItem(SIDEBAR_KEY, visible);
}

// Gets the visiblity state of the sidebar from `sessionStorage`
function getSessionSidebarVisibility(){
    const value = window.sessionStorage.getItem(SIDEBAR_KEY);

    if (value == null){
        window.sessionStorage.setItem(SIDEBAR_KEY, true);
        return true;
    }

    return value === "true";
}

function loadSidebar(){
    const sidebarContainer = document.getElementById("sidebar-container");

    sidebarContainer.innerHTML = `
    <div id="sidebar">
    <div class="sidebar-menu">
        <ul class="options_top">
            <li class="border-rounded-small">
                <div>
                    <a href="/views/pasantes/perfil_pasante.html" class="text-white">
                        <i class="far fa-user-circle mx-right-mid"></i> Perfil
                    </a>
                </div>
            </li>
            <li class="border-rounded-small">
                <div>
                    <a class="text-white">
                        <i class="far fa-file-alt mx-right-mid"></i> Tarea
                    </a>
                </div>
                <ul class="submenu">
                    <li><a href="/views/tarea/tarea.html">Crear tarea</a></li>
                    <li><a href="/views/tarea/Listado-tarea.html">Sin asignar</a></li>
                    <li><a href="/views/tarea/tareas-entregadas.html">Ver entregas</a></li>
                </ul>
            </li>

            <li class="border-rounded-small">
                <div>
                    <a href="/views/examenes/ver_examenes.html" class="text-white">
                        <i class="fas fa-clipboard-list mx-right-mid"></i>Evaluaciones
                    </a>
                </div>
            </li>
            <li class="border-rounded-small active">
                <div>
                    <a class="text-white">
                        <i class="fas fa-users mx-right-mid"></i> Pasantes
                    </a>
                </div>
                <ul class="submenu">
                    <li><a href="/views/pasantes/ver_solicitudes.html">Ver solicitudes</a></li>
                    <li><a href="/views/pasantes/estado_solicitudes.html">Estado solicitudes</a></li>
                </ul>
            </li>
            <li class="border-rounded-small">
                <div>
                    <a href="/views/admin/convocatorias/lista_convocatoria_admin.html" class="text-white">
                        <i class="fas fa-book-open mx-right-mid"></i>Convocatorias
                    </a>
                </div>
            </li>
        </ul>
        <ul class="options_bottom">
            <li class="  border-rounded-small">
                <div>
                    <a href="#" class="text-white">
                        <i class="fas fa-cog mx-right-mid"></i>Ajustes
                    </a>
                </div>
            </li>
            <li class="border-rounded-small">
                <div>
                    <a href="#" class="text-white">
                        <i class="fas fa-sign-out-alt mx-right-mid"></i>Cerrar Session
                    </a>
                </div>
            </li>
        </ul>
    </div>
</div>

<!-- Open/Close Button -->
<div class="btn-bar">
    <i class="fas fa-bars" id="sidebar-btn"></i>
</div>
    `;
}