const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "SATI AGIO - Sistema de Assistência Técnica",
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Em produção carrega o arquivo local, em desenvolvimento você pode apontar para o localhost
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    win.loadFile(indexPath).catch(err => {
        console.error("Erro ao carregar o arquivo index.html:", err);
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
