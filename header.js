// header.js

export function initializeHeader() {
    // Seleccionamos los elementos de la cabecera
    const mobileMenu = document.getElementById('mobile-menu');
    const searchInput = document.getElementById('search-input');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    const navNoticias = document.getElementById('nav-noticias');
    const navReportajes = document.getElementById('nav-reportajes');
    const mobileNavNoticias = document.getElementById('mobile-nav-noticias');
    const mobileNavReportajes = document.getElementById('mobile-nav-reportajes');

    // Función para navegar a la página principal con un parámetro
    function navigateTo(path) {
        window.location.href = `index.html?${path}`;
    }

    // --- LISTENERS DE NAVEGACIÓN Y BÚSQUEDA ---

    // Búsqueda en Escritorio
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                e.preventDefault();
                navigateTo(`busqueda=${encodeURIComponent(e.target.value.trim())}`);
            }
        });
    }

    // Búsqueda en Móvil
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                e.preventDefault();
                navigateTo(`busqueda=${encodeURIComponent(e.target.value.trim())}`);
            }
        });
    }

    // Links principales (Desktop)
    if (navNoticias) {
         navNoticias.addEventListener('click', (e) => { e.preventDefault(); navigateTo('categoria=noticias'); });
    }
    if (navReportajes) {
        navReportajes.addEventListener('click', (e) => { e.preventDefault(); navigateTo('categoria=reportajes'); });
    }

    // Links principales (Móvil)
    if (mobileNavNoticias) {
        mobileNavNoticias.addEventListener('click', (e) => { e.preventDefault(); navigateTo('categoria=noticias'); });
    }
    if (mobileNavReportajes) {
        mobileNavReportajes.addEventListener('click', (e) => { e.preventDefault(); navigateTo('categoria=reportajes'); });
    }

    // Listener para todas las categorías del desplegable (Desktop)
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const categoria = e.target.getAttribute('data-category');
            navigateTo(`categoria=${encodeURIComponent(categoria)}`);
        });
    });

    // Listener para todas las categorías (Móvil)
    document.querySelectorAll('.mobile-category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const categoria = e.target.getAttribute('data-category');
            navigateTo(`categoria=${encodeURIComponent(categoria)}`);
        });
    });
}