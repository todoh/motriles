export function loadHeader() {
    console.log("1. La función loadHeader() ha comenzado.");

    return fetch('header.html', { cache: 'no-store' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP al cargar header.html: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            console.log("2. El archivo header.html se ha cargado en la memoria.");
            document.getElementById('header-container').innerHTML = data;
            console.log("3. El HTML del header se ha insertado en la página. La lógica del menú ahora es manejada por CSS.");
            // Ya no es necesario buscar los botones ni añadir eventos de click.
        })
        .catch(error => {
            console.error("!! ERROR GRAVE en fetch:", error);
            document.getElementById('header-container').innerHTML = '<p class="text-center text-red-500">No se pudo cargar la barra de navegación.</p>';
        });
}