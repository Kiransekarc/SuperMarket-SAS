import React, { useEffect, useState } from "react";
import axios from "axios";

const AIPredictions = ({ products }) => {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    axios.get("/api/sales/predict-demand").then((res) => {
      setPredictions(res.data);
    });
  }, []);

  return (
    <div className="card">
      <h2>🤖 AI Demand Prediction & Recommendations</h2>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Predicted Demand (Next 7 Days)</th>
            <th>AI Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((p, index) => {
            const product = products.find(
              (prod) => `${prod.name} (${prod.brand})` === p.name
            );

            let recommendation = "Stable demand";

            if (product) {
              if (p.predictedNextWeek > product.stock) {
                recommendation = "⚠️ Restock Immediately";
              } else if (p.predictedNextWeek < product.stock / 3) {
                recommendation = "📉 Consider Discount / Promotion";
              }
            }

            return (
              <tr key={index}>
                <td>{p.name}</td>
                <td>{p.predictedNextWeek}</td>
                <td>{recommendation}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AIPredictions;
