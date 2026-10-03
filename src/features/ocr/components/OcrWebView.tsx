import { forwardRef, useImperativeHandle, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

const SERVER_URL = "http://127.0.0.1:8080/";

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextBlock {
  text: string;
  bbox: BBox;
}

interface WebviewSuccessResponse {
  success: true;
  data: TextBlock[];
}

interface WebviewErrorResponse {
  success: false;
  error: string;
}

type WebviewResponse = WebviewSuccessResponse | WebviewErrorResponse;

interface PromiseResolver {
  resolve: (value: TextBlock[]) => void;
  reject: (reason?: Error | unknown) => void;
}

export interface OcrWebViewRef {
  recognize: (imageInput: string) => Promise<TextBlock[]>;
}

export const OcrWebView = forwardRef<OcrWebViewRef>((_, ref) => {
  const webViewRef = useRef<WebView>(null);
  const promiseRef = useRef<PromiseResolver | null>(null);

  const HTML_CONTENT = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="${SERVER_URL}tesseract.min.js"></script>
    </head>
    <body>
      <script>
        var worker = null;

        async function initWorker() {
          if (!worker) {
            worker = await Tesseract.createWorker('mya', 1, {
              workerPath: "${SERVER_URL}worker.min.js",
              langPath: "${SERVER_URL}lang",
              corePath: "${SERVER_URL}core",
              gzip: false,
            });
          }
        }

        async function processImage(imageData) {
          try {
            await initWorker();
            
            const ret = await worker.recognize(imageData);
            const words = (ret.data.words || []).map(function(w) {
              return {
                text: w.text,
                bbox: {
                  x: w.bbox.x0,
                  y: w.bbox.y0,
                  width: w.bbox.x1 - w.bbox.x0,
                  height: w.bbox.y1 - w.bbox.y0
                }
              };
            });

            window.ReactNativeWebView.postMessage(JSON.stringify({ success: true, data: words }));
          } catch (err) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              success: false, 
              error: err ? (err.message || String(err)) : 'Unknown OCR Error' 
            }));
          }
        }

        function handleMessage(event) {
          if (event.data) {
            processImage(event.data);
          }
        }

        window.addEventListener('message', handleMessage);
        document.addEventListener('message', handleMessage);
      </script>
    </body>
  </html>
  `;

  useImperativeHandle(ref, () => ({
    recognize: (imageInput: string): Promise<TextBlock[]> => {
      return new Promise<TextBlock[]>((resolve, reject) => {
        promiseRef.current = { resolve, reject };
        if (webViewRef.current) {
          webViewRef.current.postMessage(imageInput);
        } else {
          reject(new Error("WebView reference is null"));
        }
      });
    },
  }));

  const handleMessage = (event: WebViewMessageEvent) => {
    if (!promiseRef.current) return;

    try {
      const response: WebviewResponse = JSON.parse(event.nativeEvent.data);
      if (response.success) {
        promiseRef.current.resolve(response.data);
      } else {
        promiseRef.current.reject(new Error(response.error));
      }
    } catch (err) {
      promiseRef.current.reject(err);
    } finally {
      promiseRef.current = null;
    }
  };

  return (
    <View style={styles.hidden}>
      <WebView
        ref={webViewRef}
        source={{
          html: HTML_CONTENT,
          baseUrl:
            Platform.OS === "android"
              ? "file:///android_asset/tesseract/"
              : undefined,
        }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={["*"]}
        mixedContentMode="always" // REQUIRED: Allows HTTP requests from a file:// Base URL on Android
      />
    </View>
  );
});

OcrWebView.displayName = "OcrWebView";

const styles = StyleSheet.create({
  hidden: {
    position: "absolute",
    height: 1,
    width: 1,
    opacity: 0,
  },
});
