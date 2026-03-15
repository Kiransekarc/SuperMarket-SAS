import React, { useRef, useState } from "react";
import { createWorker } from "tesseract.js";

let ocrWorkerPromise = null;
const getOcrWorker = async () => {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = createWorker("eng");
  }
  return ocrWorkerPromise;
};

const BarcodeCamera = ({ onScanSuccess, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState("");
  const [capturedImageUrl, setCapturedImageUrl] = useState(""); // For camera capture
  const [manualBarcode, setManualBarcode] = useState("");
  const [mode, setMode] = useState("camera"); // "camera" | "upload"
  const [isBusy, setIsBusy] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false); // Capture state

  React.useEffect(() => {
    if (mode !== "camera") {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    let isActive = true;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setErrorMsg("Camera not supported in this browser.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (!isActive) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch {
            // ignore autoplay errors
          }
        }
      } catch (err) {
        console.error("Camera error:", err);
        setErrorMsg("Could not access camera. Please allow camera permission.");
      }
    };

    startCamera();

    return () => {
      isActive = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [mode]);

  const handleUploadFile = async (file) => {
    if (!file) return;
    setErrorMsg("");
    if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    const objectUrl = URL.createObjectURL(file);
    setUploadPreviewUrl(objectUrl);
    if (fileInputRef.current) {
      // allow re‑uploading the same file
      fileInputRef.current.value = "";
    }

    // Try to read the digits from the image using OCR.
    try {
      const worker = await getOcrWorker();
      await worker.setParameters({
        tessedit_char_whitelist: "0123456789",
      });
      const { data } = await worker.recognize(objectUrl);
      const rawText = data?.text || "";
      const digitsOnly = rawText.replace(/[^\d]/g, "");

      if (digitsOnly && digitsOnly.length >= 4) {
        setManualBarcode(digitsOnly);
        setErrorMsg("");
        // Also behave like a successful scan: add item automatically.
        onScanSuccess(digitsOnly);
      } else {
        setErrorMsg(
          "Could not read numbers from this image. Please upload a clearer image where the digits under the barcode are sharp."
        );
      }
    } catch (err) {
      console.error("OCR error:", err);
      setErrorMsg(
        "Could not read numbers from this image. Please upload a clearer image where the digits under the barcode are sharp."
      );
    }
  };

  const handleCaptureFromCamera = async () => {
    if (!videoRef.current) {
      setErrorMsg("Camera not ready yet.");
      return;
    }
    try {
      setIsBusy(true);
      setErrorMsg("");

      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setErrorMsg("Your browser does not support camera capture.");
        setIsBusy(false);
        return;
      }

      ctx.drawImage(video, 0, 0, width, height);

      const worker = await getOcrWorker();
      await worker.setParameters({
        tessedit_char_whitelist: "0123456789",
      });
      const { data } = await worker.recognize(canvas);
      const rawText = data?.text || "";
      const digitsOnly = rawText.replace(/[^\d]/g, "");

      if (digitsOnly && digitsOnly.length >= 4) {
        setManualBarcode(digitsOnly);
        setErrorMsg("");
        onScanSuccess(digitsOnly);
      } else {
        setErrorMsg(
          "Could not read numbers from camera. Move closer so the digits under the barcode are sharp."
        );
      }
    } catch (err) {
      console.error("Camera OCR error:", err);
      setErrorMsg(
        "Could not read numbers from camera. Move closer so the digits under the barcode are sharp."
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleUseBarcode = () => {
    const trimmed = manualBarcode.trim();
    if (!trimmed) {
      setErrorMsg("Enter or paste a barcode number first.");
      return;
    }
    setErrorMsg("");
    onScanSuccess(trimmed);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h3 style={styles.title}>
              <i className="fas fa-barcode" /> Scan / Upload Barcode
            </h3>
            <div style={styles.modeTabs}>
              <button
                type="button"
                style={{
                  ...styles.tabBtn,
                  ...(mode === "camera" ? styles.tabBtnActive : {}),
                }}
                onClick={() => setMode("camera")}
              >
                Camera
              </button>
              <button
                type="button"
                style={{
                  ...styles.tabBtn,
                  ...(mode === "upload" ? styles.tabBtnActive : {}),
                }}
                onClick={() => setMode("upload")}
              >
                Upload Image
              </button>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <div style={styles.cameraBox}>
          {errorMsg ? (
            <p style={{ color: "#ef4444" }}>{errorMsg}</p>
          ) : mode === "upload" ? (
            <div style={styles.uploadBox}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => handleUploadFile(e.target.files?.[0])}
                style={styles.fileInput}
              />

              <div style={styles.manualBox}>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                  Type or paste the barcode number (digits printed under the
                  barcode).
                </p>
                <div style={styles.manualRow}>
                  <input
                    type="text"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="e.g. 717271883927"
                    style={styles.manualInput}
                  />
                  <button
                    type="button"
                    style={styles.manualBtn}
                    onClick={handleUseBarcode}
                  >
                    Use
                  </button>
                </div>
              </div>

              {uploadPreviewUrl ? (
                <div style={styles.previewWrap}>
                  <img
                    ref={imgRef}
                    alt="Barcode preview"
                    src={uploadPreviewUrl}
                    style={styles.previewImg}
                  />
                </div>
              ) : (
                <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
                  (Optional) Upload a barcode image for your reference.
                </p>
              )}
            </div>
          ) : (
            <div style={styles.cameraInner}>
              <video
                ref={videoRef}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: 12,
                  backgroundColor: "#000000",
                }}
                autoPlay
                playsInline
                muted
              />
              <button
                type="button"
                style={styles.captureBtn}
                onClick={handleCaptureFromCamera}
                disabled={isBusy}
              >
                {isBusy ? "Reading..." : "Capture & Use"}
              </button>
              <p
                style={{
                  margin: 0,
                  marginTop: 8,
                  fontSize: 13,
                  color: "#e5e7eb",
                }}
              >
                Hold the barcode so the digits at the bottom are sharp, then
                tap Capture.
              </p>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <p style={{ margin: 0 }}>
            Enter the barcode number to add the item instantly.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(6px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#ffffff",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  modeTabs: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  tabBtn: {
    appearance: "none",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    padding: "6px 10px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  tabBtnActive: {
    borderColor: "#3b82f6",
    background: "rgba(59, 130, 246, 0.10)",
    color: "#1d4ed8",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    color: "#64748b",
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1,
  },
  cameraBox: {
    background: "#000000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "270px",
    position: "relative",
    overflow: "hidden",
    padding: "32px 16px 20px 16px",
  },
  cameraInner: {
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  uploadBox: {
    width: "100%",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    color: "#0f172a",
    height: "100%",
    textAlign: "center",
  },
  fileInput: {
    width: "100%",
    maxWidth: 420,
  },
  manualBox: {
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: 8,
  },
  manualRow: {
    display: "flex",
    gap: 8,
    width: "100%",
  },
  manualInput: {
    flex: 1,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    padding: "6px 10px",
    fontSize: 14,
  },
  manualBtn: {
    padding: "6px 14px",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    flexShrink: 0,
  },
  previewWrap: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  previewImg: {
    display: "block",
    width: "100%",
    height: "auto",
  },
  captureBtn: {
    marginTop: 8,
    padding: "8px 16px",
    borderRadius: 999,
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  footer: {
    padding: "16px 20px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
    backgroundColor: "#f8fafc",
  },
};

export default BarcodeCamera;
