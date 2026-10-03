// 1. Core Modules & Native Bridge
var http = require("http");
var fs = require("fs");
var path = require("path");
var rn_bridge = require("rn-bridge"); // Communicates between Node.js and React Native

const PORT = 8080;
const PUBLIC_DIR = path.join(__dirname, "public");

// 2. MIME Types Mapping
// Critical! WebViews require correct Content-Type headers.
// If .wasm isn't served as "application/wasm", WebAssembly compilation fails in WebView.
const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".wasm": "application/wasm",
  ".traineddata": "application/octet-stream",
  ".json": "application/json",
};

// 3. HTTP Request Listener
const server = http.createServer((req, res) => {
  // CORS Headers: Allows WebViews on any local origin to fetch files without browser blocks
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  // Prevent directory traversal attacks (e.g., requests trying to access root OS files)
  let safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, "");
  let filePath = path.join(
    PUBLIC_DIR,
    safePath === "/" ? "index.html" : safePath,
  );

  // 4. File Reading & Streaming
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

// 5. Start Listening on Localhost
server.listen(PORT, "127.0.0.1", () => {
  // Notify React Native that the server is up and listening
  rn_bridge.channel.send("Nodejs File Server Running");
});