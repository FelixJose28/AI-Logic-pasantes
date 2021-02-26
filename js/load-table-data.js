function cargarDatosEnTable(opciones, titulos, config) {
    let thead = document.getElementById(config.thead);
    let tbody = document.getElementById(config.tbody);

    // load titulos 
    insertEncabezado(titulos, thead);

    // load body contenido 
    insertContenido(config.data, tbody, opciones, config.length);

}


function insertEncabezado(titulos, thead) {
    let row = thead.insertRow();

    titulos.forEach(value => {
        let th = document.createElement("TH");

        th.innerHTML = value;
        row.appendChild(th);
    });

}


function insertContenido(datos, tbody, opcion, length) {

    let index = 0;
    for (let item of datos) {
        if (index == length) { break; }

        let row = tbody.insertRow();

        for (let key of Object.keys(item)) {
            let cell = row.insertCell();
            cell.appendChild(document.createTextNode(item[key]));
        }

        let div = document.createElement("div");
        div.innerHTML = opcion;
        let cell = row.insertCell();

        cell.appendChild(div);

        index++;
    }
}