# React Native Expo Tesseract.js Demo

[![Expo](https://img.shields.io/badge/Expo-000000?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Tesseract.js](https://img.shields.io/badge/Tesseract.js-4A154B?style=for-the-badge&logo=tesseract&logoColor=white)](https://github.com/naptha/tesseract.js)
[![Language: Burmese](https://img.shields.io/badge/Language-Burmese-red?style=for-the-badge)](https://github.com/tesseract-ocr/tessdata)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

A proof-of-concept demonstrating how to perform **Offline Burmese Optical Character Recognition (OCR)** on mobile devices using **Tesseract.js** inside an Expo / React Native project.

Running Tesseract.js offline inside React Native presents two major technical hurdles:
1. **Missing Web APIs**: React Native's JS runtime (Hermes/JSC) lacks HTML5 Canvas, Web Workers, and WebAssembly support required by Tesseract.js.
2. **WebView `file://` Restrictions**: Fetching local `.js`, `.wasm` and `.traineddata` files directly over `file://` protocol in a WebView triggers security blocks and `fetch()` failures.

Therefore:
* **Local HTTP Host**: A lightweight **`nodejs-mobile`** background process runs an internal HTTP server on `http://127.0.0.1:8080`.
* **Offscreen WebView Engine**: A hidden `react-native-webview` loads Tesseract.js assets from `localhost` to execute `mya.traineddata` completely offline.

## Run Demo

```bash
# Install dependencies
npx expo install

# Generate the native project
npx expo prebuild --clear

# Build and run on android
npx expo run:android
```

## Screenshot

![App Screenshot](./screenshot/screenshot.jpg)

## License

MIT
