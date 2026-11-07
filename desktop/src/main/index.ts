import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'Chai Wala Original - Restrove POS',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Silent ESC/POS thermal printing bridge
  ipcMain.handle('print-receipt', async (event, receiptData) => {
    if (!mainWindow) return { success: false, error: 'Window not active' };
    
    // Windows Native / ESC-POS printer silent print
    return new Promise((resolve) => {
      mainWindow?.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: receiptData.printerName || ''
      }, (success, failureReason) => {
        resolve({ success, failureReason });
      });
    });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

