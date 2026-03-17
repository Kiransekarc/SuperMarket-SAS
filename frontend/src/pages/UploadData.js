import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { getAuthItem } from "../utils/authStorage";
import "./UploadData.css";

const UploadData = ({ onUpdate }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Accept files by MIME type or by extension (some browsers may not populate MIME for xlsx)
      const isXlsxMime = selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const name = (selectedFile.name || "").toLowerCase();
      const isXlsxExt = name.endsWith(".xlsx") || name.endsWith(".xls");
      if (!isXlsxMime && !isXlsxExt) {
        toast.error("Please upload a valid .xlsx or .xls file");
        return;
      }
      setFile(selectedFile);
      toast.info(`File selected: ${selectedFile.name}`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    // Test backend connection first
    try {
      const healthCheck = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/health`);
      console.log("✅ Backend is reachable:", healthCheck.data);
    } catch (err) {
      console.error("❌ Backend not reachable!");
      toast.error("Cannot connect to server. Make sure backend is running on port 5000.");
      return;
    }

    console.log("📤 Starting analysis...");
    console.log("File:", file.name, file.size, "bytes", file.type);

    setAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = getAuthItem("token");

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      console.log("Sending POST to: " + (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/sales/analyze-transactions");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/sales/analyze-transactions`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      console.log("✅ Analysis response:", response.data);

      setAnalysisData(response.data);
      setShowConfirmModal(true);
      toast.info("File analyzed successfully! Review the details before confirming.");

    } catch (err) {
      console.error("❌ Analysis error:", err);

      let errorMessage = "Failed to analyze file";

      if (err.code === 'ERR_NETWORK') {
        errorMessage = "Network Error: Cannot reach server. Is backend running on port 5000?";
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. File might be too large or server is slow.";
      } else if (err.response) {
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
      }

      toast.error(`Analysis Failed: ${errorMessage}`, { autoClose: 8000 });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!file || !analysisData) {
      toast.error("No analysis data available");
      return;
    }

    console.log("📤 Confirming upload...");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = getAuthItem("token");

      console.log("Sending POST to: " + (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/sales/upload-transactions");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/sales/upload-transactions`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      );

      console.log("✅ Upload response:", response.data);

      const { summary } = response.data;

      let message = "📊 Upload Complete!\n\n";
      if (summary.transactionsCreated > 0) message += `✅ Transactions: ${summary.transactionsCreated}\n`;
      if (summary.customersCreated > 0) message += `🆕 New Customers: ${summary.customersCreated}\n`;
      if (summary.customersUpdated > 0) message += `🔄 Updated Customers: ${summary.customersUpdated}\n`;
      if (summary.stockUpdated > 0) message += `📦 Stock Updated: ${summary.stockUpdated} products\n`;
      if (summary.duplicates > 0) message += `⚠️  Duplicates Skipped: ${summary.duplicates}\n`;
      if (summary.errors > 0) message += `❌ Errors: ${summary.errors}\n`;

      toast.success(message, { autoClose: 5000 });

      setFile(null);
      setAnalysisData(null);
      setShowConfirmModal(false);
      const fileInput = document.getElementById("file-upload");
      if (fileInput) fileInput.value = "";

      if (onUpdate) await onUpdate();
    } catch (err) {
      console.error("❌ Upload error:", err);

      let errorMessage = "Failed to upload file";

      if (err.code === 'ERR_NETWORK') {
        errorMessage = "Network Error: Cannot reach server. Is backend running on port 5000?";
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. File might be too large or server is slow.";
      } else if (err.response) {
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
      }

      toast.error(`Upload Failed: ${errorMessage}`, { autoClose: 8000 });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page-container">
      {/* Animated Hero Header */}
      <div className="upload-hero">
        <h1>
          <i className="fas fa-cloud-upload-alt"></i>
          Upload Transaction Data
        </h1>
        <p>
          Import sales transactions from Excel files (.xlsx, .xls) to update inventory, customer records, and generate comprehensive analytics.
        </p>
      </div>

      <div className="upload-grid">
        {/* Main Upload Card (Left Side) */}
        <div>
          <div className="upload-main-card">
            <div className="upload-header-icon">
              <i className="fas fa-file-excel"></i>
            </div>

            <h2 className="upload-title">Excel File Import</h2>
            <p className="upload-subtitle">
              Drag and drop your spreadsheet to securely upload sales records to the database.
            </p>

            {/* Drag and Drop Zone */}
            <div
              className="dropzone-container"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('is-dragover');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('is-dragover');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('is-dragover');
                if (e.dataTransfer.files[0]) {
                  handleFileChange({ target: { files: [e.dataTransfer.files[0]] } });
                }
              }}
            >
              {file ? (
                <div className="file-selected-box">
                  <i className="fas fa-file-excel" style={{ fontSize: "32px", color: "#10b981" }}></i>
                  <div className="file-info">
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button
                    type="button"
                    className="btn-remove-file"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      const fileInput = document.getElementById("file-upload");
                      if (fileInput) fileInput.value = "";
                    }}
                    title="Remove file"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ) : (
                <div className="dropzone-empty">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <h3>Drop your Excel file here</h3>
                  <p>or click the button below to browse from your computer</p>

                  <label htmlFor="file-upload" className="btn-choose-file">
                    <i className="fas fa-folder-open"></i>
                    Browse Files
                  </label>
                </div>
              )}

              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            {/* Submit Upload Button */}
            <button
              className="btn-upload-submit"
              onClick={handleUpload}
              disabled={!file || uploading || analyzing}
            >
              {analyzing ? (
                <><i className="fas fa-spinner fa-spin"></i> Analyzing File...</>
              ) : uploading ? (
                <><i className="fas fa-spinner fa-spin"></i> Uploading & Processing...</>
              ) : (
                <><i className="fas fa-search"></i> Analyze Spreadsheet</>
              )}
            </button>
          </div>
        </div>

        {/* Info Panels Sidebar (Right Side) */}
        <div>
          {/* File Requirements Panel */}
          <div className="sidebar-panel panel-primary">
            <h3 className="panel-header">
              <i className="fas fa-clipboard-check"></i>
              Requirements
            </h3>

            <div className="format-box">
              <div className="format-icon">
                <i className="fas fa-file-excel"></i>
              </div>
              <div>
                <p className="format-title">Accepted Format</p>
                <p><strong>.xlsx</strong> or <strong>.xls</strong></p>
              </div>
            </div>

            <p style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
              Required Columns (Exact match):
            </p>
            <div className="columns-grid">
              {[
                { icon: "fa-box", name: "Product", color: "#3b82f6" },
                { icon: "fa-sort-numeric-up", name: "Quantity", color: "#f59e0b" },
                { icon: "fa-credit-card", name: "Payment Method", color: "#8b5cf6" },
                { icon: "fa-rupee-sign", name: "Total Amount", color: "#10b981" },
                { icon: "fa-phone", name: "Phone Number", color: "#ec4899" },
                { icon: "fa-user", name: "Customer Name", color: "#ef4444" }
              ].map((col, idx) => (
                <div key={idx} className="col-badge">
                  <i className={`fas ${col.icon}`} style={{ color: col.color }}></i>
                  <span>{col.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tips Panel */}
          <div className="sidebar-panel panel-warning" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
            <h3 className="panel-header">
              <i className="fas fa-lightbulb"></i>
              Pro Tips
            </h3>
            <ul className="pro-tips-list">
              <li>Payment Method should be <strong>cash</strong>, <strong>card</strong>, or <strong>upi</strong>.</li>
              <li>Phone Number should be <strong>10 digits</strong> for customer tracking.</li>
              <li>Product names must <strong>match existing products</strong> in inventory.</li>
              <li>System will automatically <strong>update stock</strong> and <strong>customer records</strong>.</li>
              <li>Maximum supported file size is <strong>10MB</strong>.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Analysis Confirmation Modal */}
      {showConfirmModal && analysisData && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="analysis-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-chart-bar"></i> File Analysis Complete</h2>
              <button className="btn-close-modal" onClick={() => setShowConfirmModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="analysis-summary">
                <h3>📊 Summary</h3>
                <div className="summary-grid">
                  <div className="summary-card">
                    <div className="summary-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div>
                      <p className="summary-label">Total Rows</p>
                      <p className="summary-value">{analysisData.analysis.totalRows}</p>
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-icon" style={{ background: '#dcfce7', color: '#10b981' }}>
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div>
                      <p className="summary-label">Valid Transactions</p>
                      <p className="summary-value">{analysisData.analysis.validTransactions}</p>
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                      <i className="fas fa-users"></i>
                    </div>
                    <div>
                      <p className="summary-label">Unique Customers</p>
                      <p className="summary-value">{analysisData.analysis.uniqueCustomers}</p>
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div>
                      <p className="summary-label">Errors Found</p>
                      <p className="summary-value">{analysisData.analysis.errors}</p>
                    </div>
                  </div>
                </div>

                {/* Products Breakdown */}
                {analysisData.analysis.productBreakdown && analysisData.analysis.productBreakdown.length > 0 && (
                  <div className="breakdown-section">
                    <h4><i className="fas fa-box"></i> Products Breakdown</h4>
                    <div className="breakdown-list">
                      {analysisData.analysis.productBreakdown.map((item, idx) => (
                        <div key={idx} className="breakdown-item">
                          <div className="breakdown-info">
                            <span className="breakdown-name">{item.product}</span>
                            <span className="breakdown-detail">
                              {item.totalQuantity} units • ₹{item.totalAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="breakdown-badge">
                            {item.transactions} {item.transactions === 1 ? 'transaction' : 'transactions'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                {analysisData.analysis.paymentMethods && (
                  <div className="breakdown-section">
                    <h4><i className="fas fa-credit-card"></i> Payment Methods</h4>
                    <div className="payment-methods-grid">
                      {Object.entries(analysisData.analysis.paymentMethods).map(([method, count]) => (
                        <div key={method} className="payment-method-card">
                          <i className={`fas ${method === 'cash' ? 'fa-money-bill-wave' : method === 'card' ? 'fa-credit-card' : 'fa-mobile-alt'}`}></i>
                          <span className="payment-method-name">{method.toUpperCase()}</span>
                          <span className="payment-method-count">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors */}
                {analysisData.errorDetails && analysisData.errorDetails.length > 0 && (
                  <div className="breakdown-section error-section">
                    <h4><i className="fas fa-exclamation-circle"></i> Errors Detected</h4>
                    <div className="error-list">
                      {analysisData.errorDetails.slice(0, 5).map((error, idx) => (
                        <div key={idx} className="error-item">
                          <i className="fas fa-times-circle"></i>
                          <span>{error}</span>
                        </div>
                      ))}
                      {analysisData.errorDetails.length > 5 && (
                        <p className="error-more">... and {analysisData.errorDetails.length - 5} more errors</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Total Amount */}
                <div className="total-amount-section">
                  <div className="total-amount-card">
                    <span className="total-amount-label">Total Transaction Amount</span>
                    <span className="total-amount-value">₹{analysisData.analysis.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-modal-cancel" 
                onClick={() => {
                  setShowConfirmModal(false);
                  setAnalysisData(null);
                }}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
              <button 
                className="btn-modal-confirm" 
                onClick={handleConfirmUpload}
                disabled={uploading || analysisData.analysis.validTransactions === 0}
              >
                {uploading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                ) : (
                  <><i className="fas fa-check-circle"></i> Confirm & Upload ({analysisData.analysis.validTransactions} transactions)</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadData;