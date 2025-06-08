const canvas = document.getElementById('pdfCanvas');
const ctx = canvas.getContext('2d');
let pdfDoc, currentPage = 1, scale = 1;
const pageLines = {};
const pageSlices = {};
const pageInfo = document.getElementById('pageInfo');

const progressDialog = document.getElementById("progressDialog");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

function showProgressDialog() {
  progressDialog.classList.remove("hidden");
  updateProgress(0, "開始匯出...");
}

function hideProgressDialog() {
  progressDialog.classList.add("hidden");
}

function updateProgress(percent, text = "") {
  progressBar.style.width = `${percent}%`;
  progressBar.textContent = `${Math.floor(percent)}%`;
  progressText.textContent = text;
}

async function renderPage(pageNum) {
  const page = await pdfDoc.getPage(pageNum);
  const containerWidth = 800;

  //get the unscaled viewport to calculate the scale
  const unscaledViewport = page.getViewport({ scale: 1 });

  const scaleX = containerWidth / unscaledViewport.width;

  const viewport = page.getViewport({ scale: scaleX * scale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;

  redrawLines();

  pageInfo.textContent = `第 ${pageNum} 頁 / 共 ${pdfDoc.numPages} 頁`;
}

function redrawLines() {
  if (!pageLines[currentPage]) return;
  for (const y of pageLines[currentPage]) {
    ctx.beginPath();
    ctx.moveTo(0, y * canvas.height);
    ctx.lineTo(canvas.width, y * canvas.height);
    ctx.strokeStyle = 'blue';
    ctx.stroke();
  }
}

canvas.addEventListener('click', (e) => {
  const y = e.offsetY;
  if (!pageLines[currentPage]) pageLines[currentPage] = [];

  const idx = pageLines[currentPage].findIndex(val => Math.abs(canvas.height * val - y) < 5);
  if (idx !== -1) {
    pageLines[currentPage].splice(idx, 1);
  } else {
    pageLines[currentPage].push(y / canvas.height);
  }

  renderPage(currentPage);
});

document.getElementById('scaleInput').addEventListener('change', (e) => {
  scale = parseFloat(e.target.value) || 2;
  renderPage(currentPage);
});

document.getElementById('pdfInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const data = await file.arrayBuffer();
  pdfDoc = await pdfjsLib.getDocument({ data }).promise;
  currentPage = 1;
  renderPage(currentPage);
});

document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage(currentPage);
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  if (currentPage < pdfDoc.numPages) {
    currentPage++;
    renderPage(currentPage);
  }
});

document.getElementById('exportBtn').addEventListener('click', async () => {
  showProgressDialog();
  const allSlices = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = viewport.width;
    tmpCanvas.height = viewport.height;
    await page.render({ canvasContext: tmpCanvas.getContext('2d'), viewport }).promise;

    const lines = [...(pageLines[pageNum] || [])].sort((a, b) => a - b);
    lines.unshift(0);
    lines.push(1);  // 把最後一個切割線改成比例 1
    const pageImageSlices = [];

    const linesPx = lines.map(ratio => ratio * tmpCanvas.height);

    for (let i = 0; i < linesPx.length - 1; i++) {
      const sliceHeight = linesPx[i + 1] - linesPx[i];
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = tmpCanvas.width;
      sliceCanvas.height = sliceHeight;
      const sliceCtx = sliceCanvas.getContext('2d');
      sliceCtx.drawImage(
        tmpCanvas,
        0, linesPx[i],
        tmpCanvas.width, sliceHeight,
        0, 0,
        tmpCanvas.width, sliceHeight
      );
      pageImageSlices.push(sliceCanvas.toDataURL());
    }
    allSlices.push(pageImageSlices);
    updateProgress(((pageNum) / pdfDoc.numPages) * 100, `正在轉換第 ${pageNum} 段，共 ${pdfDoc.numPages} 段`);
    await new Promise(r => setTimeout(r, 50));
  }

  updateProgress(100, "轉換完成！");
  await window.electronAPI.savePdf(allSlices);
  setTimeout(async () => {
    hideProgressDialog();
  }, 500);
});
