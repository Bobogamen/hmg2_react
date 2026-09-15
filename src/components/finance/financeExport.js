export const createCsv = (rows) => "\uFEFF" + rows.map(row => row.map(value => {
  let text = String(value ?? "");
  // Keep descriptions and document numbers from becoming spreadsheet formulas.
  if (typeof value !== "number" && /^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}).join(";")).join("\r\n");

export const downloadCsv = (name, rows) => {
  const url = URL.createObjectURL(new Blob([createCsv(rows)], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
