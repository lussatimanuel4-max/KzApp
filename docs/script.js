// script.js
// Lógica do Website do Kwanza App

document.addEventListener('DOMContentLoaded', () => {
    calculateApkSize();
});

// ─────────────────────────────
// CALCULAR TAMANHO DO APK
// ─────────────────────────────
async function calculateApkSize() {
    const sizeElement = document.getElementById('apk-size');
    if (!sizeElement) return;

    try {
        const response = await fetch('kzapp.apk', { method: 'HEAD' });
        
        if (response.ok) {
            const sizeInBytes = response.headers.get('content-length');
            if (sizeInBytes) {
                const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(1);
                sizeElement.textContent = `${sizeInMB} MB`;
            } else {
                sizeElement.textContent = '~20 MB';
            }
        } else {
            sizeElement.textContent = 'Desconhecido';
        }
    } catch (error) {
        console.error('Erro ao calcular o tamanho do APK:', error);
        sizeElement.textContent = '~20 MB';
    }
}

// ─────────────────────────────
// INICIAR DOWNLOAD DO APK
// ─────────────────────────────
function downloadApp() {
    const btn = document.getElementById('downloadBtn');
    const originalText = btn.textContent;
    btn.textContent = 'A descarregar...';
    btn.style.opacity = '0.7';

    const link = document.createElement('a');
    link.href = 'kzapp.apk';
    link.download = 'KwanzaApp.apk';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.opacity = '1';
    }, 3000);
}

// ─────────────────────────────
// ABRIR IMAGEM EM TELA CHEIA
// ─────────────────────────────
function openImage(element) {
    // Pega a imagem que está dentro do item clicado
    const imgSrc = element.querySelector('img').src;
    
    // Pega o visualizador e define a imagem
    const viewer = document.getElementById('image-viewer');
    const expandedImg = document.getElementById('expanded-image');
    
    expandedImg.src = imgSrc;
    viewer.classList.add('active'); // Mostra o modal
}

// ─────────────────────────────
// FECHAR IMAGEM EM TELA CHEIA
// ─────────────────────────────
function closeImage() {
    const viewer = document.getElementById('image-viewer');
    viewer.classList.remove('active'); // Esconde o modal
}