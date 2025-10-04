// main.js

import { loadHeader } from './app.js';
// ✅ 1. Importa la nueva función de header.js
import { initializeHeader } from './header.js'; 

// Importar funciones de Firebase (sin cambios)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Configuración de Firebase (sin cambios)
const firebaseConfig = {
    // ... tu configuración ...
};

// Inicializar Firebase (sin cambios)
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const newsRef = ref(db, 'noticias');

let todasLasNoticias = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carga el header y espera a que termine
    await loadHeader();

    // ✅ 2. Inicializa la lógica de la cabecera
    initializeHeader();

    // --- CÓDIGO DE NAVEGACIÓN ELIMINADO ---
    // Ya no necesitas todos los addEventListener que estaban aquí,
    // porque ahora los gestiona initializeHeader().

    // --- LISTENER DE FIREBASE (sin cambios) ---
    onValue(newsRef, (snapshot) => {
        document.getElementById('loading-message').classList.add('hidden');
        const data = snapshot.val();
        if (data) {
            todasLasNoticias = Object.values(data)
                .filter(n => n.estado === 'publicado')
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            
            const params = new URLSearchParams(window.location.search);
            const categoriaParam = params.get('categoria');
            const busquedaParam = params.get('busqueda');

            if (categoriaParam) {
                renderizarCategoria(categoriaParam);
            } else if (busquedaParam) {
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.value = busquedaParam;
                renderizarBusqueda(busquedaParam);
            } else {
                renderizarInicio();
            }
        } else {
            document.querySelector('main').innerHTML = `<p class="text-center text-red-500">No se encontraron noticias.</p>`;
        }
    }, (error) => {
         console.error('Error al cargar las noticias:', error);
         document.querySelector('main').innerHTML = `<p class="text-center text-red-500">No se pudieron cargar las noticias.</p>`;
    });
});


// ... (El resto de funciones: renderizarInicio, renderizarCategoria, etc., permanecen igual)
// ...

// ... (El resto de funciones: renderizarInicio, renderizarCategoria, etc., permanecen igual)
function renderizarInicio() {
    document.getElementById('inicio-content').classList.remove('hidden');
    document.getElementById('categoria-content').classList.add('hidden');
    
    const noticiasParaInicio = [...todasLasNoticias];
    
    const noticiaDestacada = noticiasParaInicio.shift(); 
    const reportajes = noticiasParaInicio.filter(n => n.categoria === 'REPORTAJE').slice(0, 2);
    const ultimasNoticias = noticiasParaInicio.filter(n => n.categoria !== 'REPORTAJE').slice(0, 6);

    renderizarDestacada(noticiaDestacada);
    renderizarUltimasNoticias(ultimasNoticias);
    renderizarReportajes(reportajes);
}

function renderizarCategoria(tipo) {
    document.getElementById('inicio-content').classList.add('hidden');
    const container = document.getElementById('categoria-content');
    container.classList.remove('hidden');

    let titulo = '';
    let articulosFiltrados = [];
    const tipoLower = tipo.toLowerCase();

    if (tipoLower === 'noticias') {
        titulo = 'Todas las Noticias';
        articulosFiltrados = todasLasNoticias.filter(n => n.categoria !== 'REPORTAJE' && n.categoria !== 'ENTREVISTA');
    } else if (tipoLower === 'reportajes') {
        titulo = 'Todos los Reportajes';
        articulosFiltrados = todasLasNoticias.filter(n => n.categoria === 'REPORTAJE');
    } else {
        titulo = tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
        articulosFiltrados = todasLasNoticias.filter(n => n.categoria.toUpperCase() === tipo.toUpperCase());
    }
    
    const articulosHtml = articulosFiltrados.length > 0
        ? articulosFiltrados.map(articulo => `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden md:flex">
                <div class="md:w-1/3">
                    <a href="articulo.html?id=${articulo.id}">
                       <img class="h-full w-full object-cover" src="${articulo.imagen}" alt="${articulo.titulo}">
                    </a>
                </div>
                <div class="p-6 md:w-2/3 flex flex-col">
                    <span class="text-xs font-semibold text-gray-500">${articulo.categoria}</span>
                    <h3 class="font-bold text-2xl mt-1 mb-2 flex-grow">
                         <a href="articulo.html?id=${articulo.id}" class="hover:text-blue-600">${articulo.titulo}</a>
                    </h3>
                    <p class="text-gray-600 leading-relaxed mb-4">${articulo.resumen}</p>
                    <a href="articulo.html?id=${articulo.id}" class="text-blue-600 font-semibold hover:underline mt-auto self-start">Leer más &rarr;</a>
                </div>
            </div>
        `).join('')
        : `<p class="text-center text-gray-600 py-10">No hay artículos en la categoría "<strong>${titulo}</strong>".</p>`;


    container.innerHTML = `
        <section>
            <h2 class="text-2xl font-bold mb-6 border-l-4 border-blue-600 pl-4">${titulo}</h2>
            <div class="space-y-6">
                ${articulosHtml}
            </div>
        </section>
    `;
}

function renderizarBusqueda(termino) {
    document.getElementById('inicio-content').classList.add('hidden');
    const container = document.getElementById('categoria-content');
    container.classList.remove('hidden');

    const terminoLower = termino.toLowerCase();
    const articulosFiltrados = todasLasNoticias.filter(n => 
        n.titulo.toLowerCase().includes(terminoLower) || 
        n.resumen.toLowerCase().includes(terminoLower)
    );
    
    let articulosHtml;
    if (articulosFiltrados.length > 0) {
         articulosHtml = articulosFiltrados.map(articulo => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden md:flex">
            <div class="md:w-1/3">
                <a href="articulo.html?id=${articulo.id}">
                   <img class="h-full w-full object-cover" src="${articulo.imagen}" alt="${articulo.titulo}">
                </a>
            </div>
            <div class="p-6 md:w-2/3 flex flex-col">
                <span class="text-xs font-semibold text-gray-500">${articulo.categoria}</span>
                <h3 class="font-bold text-2xl mt-1 mb-2 flex-grow">
                     <a href="articulo.html?id=${articulo.id}" class="hover:text-blue-600">${articulo.titulo}</a>
                </h3>
                <p class="text-gray-600 leading-relaxed mb-4">${articulo.resumen}</p>
                <a href="articulo.html?id=${articulo.id}" class="text-blue-600 font-semibold hover:underline mt-auto self-start">Leer más &rarr;</a>
            </div>
        </div>
        `).join('');
    } else {
        articulosHtml = `<p class="text-center text-gray-600 py-10">No se encontraron resultados para "<strong>${termino}</strong>".</p>`;
    }

    container.innerHTML = `
        <section>
            <h2 class="text-2xl font-bold mb-6 border-l-4 border-blue-600 pl-4">Resultados de búsqueda: "${termino}"</h2>
            <div class="space-y-6">
                ${articulosHtml}
            </div>
        </section>
    `;
}

function renderizarDestacada(noticia) {
    const container = document.getElementById('noticia-destacada');
    if (!noticia) return;
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden md:flex">
            <div class="md:w-1/2">
<img class="h-64 w-full object-cover md:h-96" src="${noticia.imagen}" alt="${noticia.titulo}">            </div>
            <div class="p-6 md:w-1/2 flex flex-col justify-center">
                <span class="text-sm font-semibold text-blue-500 bg-blue-100 py-1 px-3 rounded-full self-start mb-2">${noticia.categoria}</span>
                <h1 class="text-3xl font-bold mb-4">${noticia.titulo}</h1>
                <p class="text-gray-600 leading-relaxed mb-4">${noticia.resumen}</p>
                <a href="articulo.html?id=${noticia.id}" class="text-blue-600 font-semibold hover:underline">Leer más &rarr;</a>
            </div>
        </div>`;
}

function renderizarUltimasNoticias(noticias) {
    const grid = document.getElementById('ultimas-noticias-grid');
    grid.innerHTML = noticias.map(noticia => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <a href="articulo.html?id=${noticia.id}">
                <img class="h-48 w-full object-cover" src="${noticia.imagen}" alt="${noticia.titulo}">
            </a>
            <div class="p-6">
                <span class="text-xs font-semibold text-gray-500">${noticia.categoria}</span>
                <h3 class="font-bold text-xl my-2">
                    <a href="articulo.html?id=${noticia.id}" class="hover:text-blue-600">${noticia.titulo}</a>
                </h3>
                <p class="text-gray-600 text-sm">${noticia.resumen}</p>
            </div>
        </div>
    `).join('');
}

function renderizarReportajes(reportajes) {
    const lista = document.getElementById('reportajes-lista');
    lista.innerHTML = reportajes.map(reportaje => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden md:flex">
            <div class="md:w-1/3">
                <a href="articulo.html?id=${reportaje.id}">
                   <img class="h-full w-full object-cover" src="${reportaje.imagen}" alt="${reportaje.titulo}">
                </a>
            </div>
            <div class="p-6 md:w-2/3">
                <h3 class="font-bold text-2xl mb-2">
                     <a href="articulo.html?id=${reportaje.id}" class="hover:text-blue-600">${reportaje.titulo}</a>
                </h3>
                <p class="text-gray-600 leading-relaxed">${reportaje.resumen}</p>
                <a href="articulo.html?id=${reportaje.id}" class="text-blue-600 font-semibold hover:underline mt-4 inline-block">Ver reportaje completo &rarr;</a>
            </div>
        </div>
    `).join('');
}