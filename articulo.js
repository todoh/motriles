
import { loadHeader } from './app.js';
import { initializeHeader } from './header.js';

// Importar funciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAfK_AOq-Pc2bzgXEzIEZ1ESWvnhMJUvwI",
    authDomain: "enraya-51670.firebaseapp.com",
    databaseURL: "https://enraya-51670-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "enraya-51670",
    storageBucket: "enraya-51670.firebasestorage.app",
    messagingSenderId: "103343380727",
    appId: "1:103343380727:web:b2fa02aee03c9506915bf2",
    measurementId: "G-2G31LLJY1T"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db);

document.addEventListener('DOMContentLoaded', async () => {
 
    // 1. Espera a que el header esté cargado
    await loadHeader();

    // ✅ 2. Inicializa la lógica de la cabecera
    initializeHeader();
    
    const params = new URLSearchParams(window.location.search);
    const noticiaId = params.get('id');
    const articleContainer = document.getElementById('article-content');

    if (!noticiaId) {
        articleContainer.innerHTML = '<h1>Error: Noticia no especificada.</h1>';
        return;
    }

    get(child(dbRef, `noticias/${noticiaId}`)).then((snapshot) => {
        if (snapshot.exists()) {
            const noticia = snapshot.val();
            renderizarArticulo(noticia);
        } else {
            articleContainer.innerHTML = '<h1>Error 404: Noticia no encontrada.</h1>';
            document.title = 'Noticia no encontrada - Motril al Día';
        }
    }).catch((error) => {
        console.error('Error al cargar la noticia desde Firebase:', error);
        articleContainer.innerHTML = '<h1>Error al cargar la noticia.</h1>';
    });
});

function renderizarArticulo(noticia) {
    document.title = `${noticia.titulo} - Motril al Día`;
    const articleContainer = document.getElementById('article-content');
    
    const fechaFormateada = new Date(noticia.fecha).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    articleContainer.innerHTML = `
        <a href="index.html" class="text-blue-600 hover:underline mb-6 inline-block">&larr; Volver a la portada</a>
        <span class="text-sm font-semibold text-blue-500 bg-blue-100 py-1 px-3 rounded-full self-start mb-2">${noticia.categoria}</span>
        <h1 class="text-3xl md:text-4xl font-bold my-4">${noticia.titulo}</h1>
        
        <div class="flex flex-wrap items-center justify-between mb-6">
            <p class="text-gray-500">Por <span class="font-semibold">${noticia.autor}</span> | Publicado el ${fechaFormateada}</p>
            <button id="share-button" class="mt-4 sm:mt-0 flex items-center text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors duration-300">
                <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                   <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Compartir
            </button>
        </div>

        <img class="w-full h-auto rounded-lg mb-8 shadow-md" src="${noticia.imagen.replace('600x400', '1000x600').replace('800x600', '1000x600')}" alt="${noticia.titulo}">
        <div class="prose max-w-none text-lg leading-relaxed text-gray-700">
            ${noticia.contenido}
        </div>
    `;

    // Añadir funcionalidad al botón de compartir
    const shareButton = document.getElementById('share-button');
    const shareData = {
        title: noticia.titulo,
        text: noticia.resumen,
        url: window.location.href,
    };

    shareButton.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                console.log('Noticia compartida con éxito');
            } catch (err) {
                console.error('Error al compartir:', err);
            }
        } else {
            // Fallback para escritorio
            copyToClipboard(window.location.href);
        }
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback();
    }).catch(err => {
        console.error('No se pudo copiar el texto:', err);
    });
}

function showCopyFeedback() {
    const feedback = document.getElementById('copy-feedback');
    feedback.classList.remove('opacity-0');
    setTimeout(() => {
        feedback.classList.add('opacity-0');
    }, 2000);
}