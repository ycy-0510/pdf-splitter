const { app, BrowserWindow, ipcMain,dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

// require('electron-reload')(__dirname, {
//   electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
// });


function createWindow() {
  const win = new BrowserWindow({
    minWidth: 900,
    minHeight: 700,
    width: 1000,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadFile('./renderer/index.html');
}

// Handle window close event
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

app.whenReady().then(createWindow);


ipcMain.handle('save-pdf', async (_, { pageSlices }) => {
  const pdfDoc = await PDFDocument.create();

  for (const imageDataList of pageSlices) {
    for (const imageData of imageDataList) {
      const imageBytes = Buffer.from(imageData.split(',')[1], 'base64');
      const img = await pdfDoc.embedPng(imageBytes);
      const page = pdfDoc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
  }

  const pdfBytes = await pdfDoc.save();

  const { filePath, canceled } = await dialog.showSaveDialog({
    title: '儲存 PDF',
    defaultPath: 'split.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });

  if (canceled || !filePath) return { success: false };

  try {
    fs.writeFileSync(filePath, pdfBytes);
    return { success: true, filePath };
  } catch (err) {
    console.error('儲存 PDF 時發生錯誤:', err);
    return { success: false, error: err.message };
  }
});