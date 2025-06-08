# PDF Splitter

A simple PDF splitting application built with Electron, pdf-lib, and PDF.js. Easily split PDF pages by adding custom horizontal lines and export the result as a new PDF file.

## Features

- Load and preview PDF files page by page
- Click on the page to add or remove horizontal split lines
- Supports multi-page splitting
- Adjustable preview zoom
- Export the split result as a new PDF

## Installation & Usage

### Install dependencies

```sh
yarn install
```
or
```sh
npm install
```

### Start in development mode

```sh
yarn start
```
or
```sh
npm start
```

### Build the application

```sh
yarn build
```
or
```sh
npm run build
```

The installer will be generated in the `dist/` directory.

## How to Use

1. Launch the app and click "選擇檔案" to load a PDF.
2. Click on the page to add or remove split lines.
3. Use "上一頁" and "下一頁" to navigate pages.
4. Adjust the "縮放" slider to change the preview scale.
5. Click "匯出 PDF" to export the split result as a new PDF file.

## Project Structure

- `main.js`: Electron main process, window creation, and PDF export logic
- `preload.js`: Bridge between main and renderer processes
- `renderer/renderer.js`: Frontend logic for PDF preview, splitting, and export
- `renderer/index.html`: Frontend UI
- `renderer/tailwind.css`, `renderer/output.css`: Styles
- `package.json`: Project configuration and scripts

## Technologies Used

- [Electron](https://www.electronjs.org/)
- [pdf-lib](https://pdf-lib.js.org/)
- [PDF.js](https://mozilla.github.io/pdf.js/)
- [Tailwind CSS](https://tailwindcss.com/)

## License

MIT License