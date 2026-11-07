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
    icon: path.join(__dirname, '../assets/icon.ico'),
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

  // Get available printers from Windows OS
  ipcMain.handle('get-printers', async () => {
    if (!mainWindow) return [];
    return await mainWindow.webContents.getPrintersAsync();
  });

  // Direct Silent Printing bridge to connected thermal printer without dialog
  ipcMain.handle('print-receipt', async (event, receiptData) => {
    if (!mainWindow) return { success: false, error: 'Window not active' };
    
    return new Promise((resolve) => {
      mainWindow?.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: receiptData?.printerName || ''
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

