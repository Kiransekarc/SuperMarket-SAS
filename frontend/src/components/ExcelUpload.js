import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuthItem } from "../utils/authStorage";

const ExcelUpload = () => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use the same upload endpoint as the main app
      await axios.post(
        "/api/sales/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${getAuthItem("token")}`,
          }
        }
      );

      toast.success("Excel data uploaded and analyzed successfully");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  return (
    <div className="card">
      <h3>📤 Upload Sales Excel File</h3>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload} style={{ marginTop: "10px" }}>
        Upload & Analyze
      </button>
    </div>
  );
};

export default ExcelUpload;
