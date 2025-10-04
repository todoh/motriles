 

export function initializeHeader() {
    // --- FUNCIÓN DE NAVEGACIÓN MEJORADA ---
    function navigateTo(path) {
        // 1. Cambia la URL en la barra de direcciones SIN recargar la página.
        history.pushState({}, '', `index.html?${path}`);
        
        // 2. Crea y dispara un evento personalizado para "avisar" a main.js de que la URL ha cambiado.
        window.dispatchEvent(new CustomEvent('locationchange'));
    }

    // --- SELECCIÓN DE ELEMENTOS (sin cambios) ---
    const searchInput = document.getElementById('search-input');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    // ... (el resto de selectores no necesitan cambiar)
     const navNoticias = document.getElementById('nav-noticias');
    const navReportajes = document.getElementById('nav-reportajes');
    const mobileNavNoticias = document.getElementById('mobile-nav-noticias');
    const mobileNavReportajes = document.getElementById('mobile-nav-reportajes');
    // --- LISTENERS DE NAVEGACIÓN Y BÚSQUEDA (sin cambios en su lógica interna) ---

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

    // Listener para todos los links que deben usar nuestra navegación personalizada
    document.querySelectorAll('#nav-noticias, #nav-reportajes, .category-link, #mobile-nav-noticias, #mobile-nav-reportajes, .mobile-category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const categoria = e.target.dataset.category || e.target.id.split('-').pop();
            navigateTo(`categoria=${encodeURIComponent(categoria)}`);
        });
    });
}