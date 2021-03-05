# Sistema de pasantes AILogic (GRUPO ALPHA)

## Projecto

### Estructura de los folders
En el proyecto tenemos los siguientes folders/archivos:

* ``index.html`` entry point de la app.
* ``css/`` para archivos CSS que serán compartidos.
* ``views/`` donde estarán las vistas de la app.
* ``js/`` donde estarán los archivos JavaScript compartidos.
* ``img/`` donde se guardarán las imagenes usadas.
* ``lib/`` librerias reutilizables no relacionadas directamente con la app.
* ``data/`` para archivos por ejemplo `.json` para ser leido o escritos dinámicamente.

Las vistas se organizarán de la siguiente manera:
```
views/
    shared/
    admin/
    user/
```

* En `admin/` se guardan las vistas del administrador.
* En `user/` se guardan las vistas del usuario corriente.
* En `shared/` se guaradan vistas que se comparten entre ambos, por ejemplo la pantalla de login.

A la hora de crear un nuevo componente se guardará de la siguiente manera:

```
views/
    admin/
        convocatorias/
            crear_convocatoria_admin.html
            crear_convocatoria_admin.css
            ver_convocatorias_admin.html
            ver_convocatorias_admin.css
            ver_convocatoria_admin.js
```

Todos los archivos relacionados con el componente (CSS, HTML, JS) se guardarán en la misma carpeta.

Si el archivo va en la carpeta admin deberá llevar el sufijo `_admin`:

```
ver_convocatorias.html
ver_convocatorias_admin.html
```