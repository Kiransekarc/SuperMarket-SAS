import { saveAs } from "file-saver";

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row =>
    Object.values(row).join(",")
  );

  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  saveAs(blob, filename);
};
