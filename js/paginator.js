function crearPaginator(config) {
    let contianer = document.getElementById("paginator");
    let tableBody = document.getElementById("tbody");

    tableBody.innerHTML = '';

    cargarDatosEnTable(config.opciones, config.tableConfig[0], config.tableConfig[1]);

    if (config.data.length > config.length) {

        let seccioneLength = Math.ceil(config.data.length / config.length);

        for (let i = 0; i <= seccioneLength; i++) {
            let button = document.createElement("button");
            button.classList.add("paginator-button");

            if (i == 0) {
                // boton de preview 
                let preview = document.createTextNode("Preview");
                button.appendChild(preview);
                button.id = "preview-btn";


                button.addEventListener("click", () => {

                    localStorage.setItem("pagina", Number(localStorage.getItem("pagina")) - 1)
                    tableBody.innerHTML = "";

                    canShowPreview(seccioneLength)
                    canShowNext(seccioneLength)

                    config.tableConfig[1].data = config.data.slice((localStorage.getItem("pagina") - 1) * config.length);

                    // volver a cargar los datos en la tabla
                    cargarDatosEnTable(config.opciones,
                        config.tableConfig[0],
                        config.tableConfig[1]);

                })

                contianer.appendChild(button);
            } else {
                let seccionButton = document.createTextNode(i);
                button.appendChild(seccionButton);

                button.addEventListener("click", () => {
                    localStorage.setItem("pagina", i);
                    tableBody.innerHTML = "";

                    canShowPreview(seccioneLength)
                    canShowNext(seccioneLength)

                    config.tableConfig[1].data = config.data.slice((localStorage.getItem("pagina") - 1) * config.length);

                    // volver a cargar los datos en la tabla
                    cargarDatosEnTable(config.opciones,
                        config.tableConfig[0],
                        config.tableConfig[1]);
                })

                contianer.appendChild(button);
            }

        }

        // agregar el boton de next 
        let button = document.createElement("button");
        button.appendChild(document.createTextNode("Next"))
        button.classList.add("paginator-button");
        button.id = "next-btn";



        button.addEventListener("click", () => {
            localStorage.setItem("pagina", Number(localStorage.getItem("pagina")) + 1)
            tableBody.innerHTML = "";

            canShowPreview(seccioneLength)
            canShowNext(seccioneLength)

            config.tableConfig[1].data = config.data.slice((localStorage.getItem("pagina") - 1) * config.length);

            cargarDatosEnTable(config.opciones,
                config.tableConfig[0],
                config.tableConfig[1]);

        })

        contianer.appendChild(button);
    }
}


// determinar si puede mostar el next boton 
function canShowNext(seccioneLength) {
    if (Number(localStorage.getItem("pagina")) == seccioneLength) {
        document.getElementById("next-btn").hidden = true;
    } else {
        document.getElementById("next-btn").hidden = false;
    }
}


// determinar si puede mostar el next boton 
function canShowPreview(seccioneLength) {
    if (Number(localStorage.getItem("pagina")) == 1) {
        document.getElementById("preview-btn").hidden = true;
    } else {
        document.getElementById("preview-btn").hidden = false;
    }
}