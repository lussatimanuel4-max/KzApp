// script.js
// Lógica do Website do Kwanza App

document.addEventListener('DOMContentLoaded', () => {
    calculateApkSize();
});

// ─────────────────────────────
// CALCULAR TAMANHO DO APK
// ─────────────────────────────
function calculateApkSize() {
    const sizeElement = document.getElementById('apk-size');
    if (!sizeElement) return;
    
    
    sizeElement.textContent = '89.7 MB';
}

// ─────────────────────────────
// INICIAR DOWNLOAD DO APK
// ─────────────────────────────
function downloadApp() {
    const btn = document.getElementById('downloadBtn');
    const originalText = btn.textContent;
    btn.textContent = 'A descarregar...';
    btn.style.opacity = '0.7';

    // Link direto para o ficheiro Kwanza.App.apk no GitHub Releases
    const apkUrl = 'https://github.com/lussatimanuel4-max/KzApp/releases/download/v5.1.0/Kwanza.App.apk';

    const link = document.createElement('a');
    link.href = apkUrl;
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
    const imgSrc = element.querySelector('img').src;
    const viewer = document.getElementById('image-viewer');
    const expandedImg = document.getElementById('expanded-image');
    
    expandedImg.src = imgSrc;
    viewer.classList.add('active');
}

// ─────────────────────────────
// FECHAR IMAGEM EM TELA CHEIA
// ─────────────────────────────
function closeImage() {
    const viewer = document.getElementById('image-viewer');
    viewer.classList.remove('active');
}