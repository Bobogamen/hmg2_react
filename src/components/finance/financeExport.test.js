import { createCsv } from "./financeExport";

test("exports Unicode, delimiters, quotes and numeric negatives without allowing formulas in text", () => {
  const csv = createCsv([["Сграда; А", 'Документ "1"', -25.5, "=SUM(A1)", null]]);
  expect(csv).toBe('\uFEFF"Сграда; А";"Документ ""1""";"-25.5";"\'=SUM(A1)";""');
});
