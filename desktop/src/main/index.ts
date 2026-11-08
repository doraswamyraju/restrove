import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function setupAutoUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('updater-message', {
      type: 'update-available',
      version: info.version
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('updater-message', {
      type: 'update-downloaded',
      version: info.version
    });

    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Restrove Update Ready',
      message: `A new version (v${info.version}) of Chai Wala POS has been downloaded. Restart now to apply?`,
      buttons: ['Restart and Install', 'Later']
    }).then((buttonIndex) => {
      if (buttonIndex.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  // Check for updates every 4 hours or on launch (in packaged builds)
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.warn('Auto-updater notice:', err?.message);
    });
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    }, 4 * 60 * 60 * 1000);
  }
}

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
  // Manual update check IPC
  ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged) return { available: false, message: 'Dev environment' };
    try {
      const result = await autoUpdater.checkForUpdates();
      return { available: Boolean(result?.updateInfo), version: result?.updateInfo?.version };
    } catch (e: any) {
      return { available: false, error: e.message };
    }
  });

  setupAutoUpdater();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

