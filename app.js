const content = document.getElementById('app-content');
const searchInput = document.getElementById('search-input');
const btnBack = document.getElementById('btn-back');

let currentChapter = '';

function getColorCapitulo(capitulo) {
    switch (capitulo) {
        case "Tórax": return "#4fc3f7";                     
        case "Abdomen": return "#ffb74d";                   
        case "Extremidad superior": return "#81c784";       
        case "Región proximal del húmero y la cintura escapular": return "#014c69"; 
        case "Extremidad inferior": return "#ba68c8";       
        case "Región proximal del fémur y cintura pelviana": return "#fafafa"; 
        case "Columna cervical y torácica": return "#4db6ac"; 
        case "Columna lumbar, sacro y cóccix": return "#ff7043"; 
        case "Tórax óseo, esternón y costillas": return "#864d4d"; 
        case "Cráneo y huesos craneales": return "#df0505"; 
        case "Huesos faciales": return "#aed58173";           
        case "Senos paranasales, mastoides y hueso temporal": return "#ffe600"; 
        default: return "#4fc3f7";                          
    }
}

// Funciones modificadas para sincronizar con los gestos del celular
function renderHome(pushState = true) {
    if (pushState) {
        history.pushState({ view: 'home' }, '');
    }
    searchInput.value = '';
    btnBack.classList.add('hidden');
    content.innerHTML = '';
    
    capitulos.forEach(cap => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.style.borderLeftColor = getColorCapitulo(cap);
        div.textContent = cap;
        div.onclick = () => {
            currentChapter = cap;
            renderChapter(cap);
        };
        content.appendChild(div);
    });
}

function renderChapter(capitulo, pushState = true) {
    if (pushState) {
        history.pushState({ view: 'chapter', capitulo: capitulo }, '');
    }
    btnBack.classList.remove('hidden');
    content.innerHTML = `<h2 class="detail-title">${capitulo}</h2>`;
    const filtradas = tecnicas.filter(t => t.capitulo === capitulo);
    
    if(filtradas.length === 0) {
        content.innerHTML += `<p class="empty-state">Aún no hay técnicas cargadas en este capítulo.</p>`;
        return;
    }

    filtradas.forEach(t => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.style.borderLeftColor = getColorCapitulo(t.capitulo);
        div.textContent = t.nombre;
        div.onclick = () => {
            renderDetail(t);
        };
        content.appendChild(div);
    });
}

function renderDetail(tecnica, pushState = true) {
    if (pushState) {
        history.pushState({ view: 'detail', tecnicaId: tecnica.id }, '');
    }
    btnBack.classList.remove('hidden');
    
    const fallbackImg = "this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'><rect width=\\'200\\' height=\\'200\\' fill=\\'%23333\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23777\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\'>Sin Imagen</text></svg>'";
    
    // Aquí se agregó onclick="abrirImagen(this.src)" a la imagen extra
    const extraImageHTML = tecnica.foto_extra ? `
        <div class="image-box">
            <img src="${tecnica.foto_extra}" alt="Extra: ${tecnica.nombre}" onerror="${fallbackImg}" onclick="abrirImagen(this.src)">
            <span>${tecnica.label_extra || 'Vista Adicional'}</span>
        </div>
    ` : '';

    const containerClass = tecnica.foto_extra ? 'image-container three-images' : 'image-container';

    const notaHTML = tecnica.nota ? `
        <div class="info-block" style="border-color: #ffb74d;">
            <h3 style="color: #ffb74d;">Nota técnica / Criterio de evaluación</h3>
            <p>${tecnica.nota}</p>
        </div>
    ` : '';

    // Aquí se agregó onclick="abrirImagen(this.src)" a las imágenes principales
    content.innerHTML = `
        <h2 class="detail-title">${tecnica.nombre}</h2>
        <div class="${containerClass}">
            <div class="image-box">
                <img src="${tecnica.foto_posicion}" alt="Posición: ${tecnica.nombre}" onerror="${fallbackImg}" onclick="abrirImagen(this.src)">
                <span>Posición del Paciente</span>
            </div>
            <div class="image-box">
                <img src="${tecnica.foto_rx}" alt="Radiografía: ${tecnica.nombre}" onerror="${fallbackImg}" onclick="abrirImagen(this.src)">
                <span>Radiografía Resultante</span>
            </div>
            ${extraImageHTML}
        </div>
        ${createBlock('Patología demostrada', tecnica.patologia)}
        ${createBlock('Factores técnicos', tecnica.factores_tecnicos)}
        ${createBlock('Posición del paciente', tecnica.posicion_paciente)}
        ${createBlock('Posición de la región a explorar', tecnica.posicion_region)}
        ${createBlock('Rayo central', tecnica.rayo_central)}
        ${createBlock('Colimación', tecnica.colimacion)}
        ${createBlock('Respiración', tecnica.respiracion)}
        ${notaHTML}
    `;
}

function createBlock(title, text) {
    return `
        <div class="info-block">
            <h3>${title}</h3>
            <p>${text || 'No especificado.'}</p>
        </div>
    `;
}

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if(query.trim() === '') {
        if(currentChapter !== '') {
            renderChapter(currentChapter, false);
        } else {
            renderHome(false);
        }
        return;
    }
    
    btnBack.classList.remove('hidden');
    content.innerHTML = `<h2 class="detail-title">Resultados de búsqueda</h2>`;
    
    const resultados = tecnicas.filter(t => 
        t.nombre.toLowerCase().includes(query) || 
        t.capitulo.toLowerCase().includes(query) ||
        t.patologia.toLowerCase().includes(query) ||
        t.posicion_region.toLowerCase().includes(query)
    );

    if(resultados.length === 0) {
        content.innerHTML += `<p class="empty-state">No se encontraron resultados.</p>`;
        return;
    }

    resultados.forEach(t => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.style.borderLeftColor = getColorCapitulo(t.capitulo);
        div.textContent = `${t.nombre} (${t.capitulo})`;
        div.onclick = () => {
            renderDetail(t);
        };
        content.appendChild(div);
    });
});

// Botón de flecha izquierda física en pantalla
btnBack.addEventListener('click', () => {
    if(searchInput.value !== '') {
        searchInput.value = '';
        if(currentChapter !== '') {
            renderChapter(currentChapter, false);
        } else {
            renderHome(false);
        }
        return;
    }
    window.history.back(); // Se enlaza con la historia del dispositivo
});

// Escuchador clave: intercepta el gesto de deslizar hacia atrás de tu S20
window.addEventListener('popstate', (e) => {
    if(searchInput.value !== '') {
        searchInput.value = '';
    }

    const state = e.state;
    if (!state || state.view === 'home') {
        renderHome(false);
    } else if (state.view === 'chapter') {
        currentChapter = state.capitulo;
        renderChapter(state.capitulo, false);
    } else if (state.view === 'detail') {
        const tecnicaEncontrada = tecnicas.find(t => t.id === state.tecnicaId);
        if (tecnicaEncontrada) {
            renderDetail(tecnicaEncontrada, false);
        }
    }
});

// --- SISTEMA DE VISOR DE IMÁGENES ---
const visorModal = document.createElement('div');
visorModal.id = 'visor-imagenes';
visorModal.innerHTML = `
    <span id="visor-cerrar">&times;</span>
    <img id="visor-img" src="" alt="Imagen ampliada">
`;
document.body.appendChild(visorModal);

const visorImg = document.getElementById('visor-img');

// Función que abre la imagen en grande
window.abrirImagen = function(src) {
    visorImg.src = src;
    visorModal.classList.add('activo');
};

// Cierra el visor al tocar en cualquier parte de la pantalla negra
visorModal.addEventListener('click', () => {
    visorModal.classList.remove('activo');
});

// Inicializar aplicación registrando el estado inicial
renderHome(true);