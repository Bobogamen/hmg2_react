import { buildPrintModel, createPrintDocument } from "./printDocument";
jest.mock("react-dom/server", () => jest.requireActual("react-dom/server.node"));
const labels = require("../../locales/bg/dashboard.json").printPage;
const fee = { name: "Почистване", value: 2.5, amount: 5, times: 2, primary: true };
const details = { month: { year: 2026, number: 9 }, homes: [
  { id: 1, name: "1", floor: "1", owner: "Иван", total: 7.5, paid: 2.5, due: 5, charges: [fee], receipts: [{ ...fee, amount: 2.5, times: 1 }] },
  { id: 2, name: "2", floor: "1", owner: "Мария", total: 5, paid: 0, due: 5, charges: [fee], receipts: [] }
] };
const options = { condominium: { address: "ул. Пример 1", city: "София" }, details, locale: "bg", labels };
test("counts each home once per fee and sums paid plus unpaid amounts", () => {
  const model = buildPrintModel(details);
  expect(model.total).toBe(12.5);
  expect(model.fees[0]).toMatchObject({ homeCount: 2, amount: 12.5 });
});
test("landscape uses A4 narrow margins, signature columns and escaped user text", () => {
  const html = createPrintDocument({ ...options, mode: "landscape", condominium: { ...options.condominium, address: "<script>alert(1)</script>" } });
  expect(html).toContain("size: A4 landscape; margin: 5mm");
  expect(html).toContain("Подпис");
  expect(html).toContain("Обобщение по такси");
  expect(html).toContain("&lt;script&gt;");
  expect(html).not.toContain("<script>");
  expect(html).toContain("€ 12,50");
});
test("portrait lays out three slips per row and carries long fee lists into numbered parts", () => {
  const homes = Array.from({ length: 4 }, (_, id) => ({ ...details.homes[1], id }));
  const html = createPrintDocument({ ...options, mode: "portrait", details: { ...details, homes } });
  const dom = new DOMParser().parseFromString(html, "text/html");
  expect(dom.querySelectorAll(".receipt-row")).toHaveLength(2);
  expect(dom.querySelector(".receipt-row").children).toHaveLength(3);
  expect(html).toContain("size: A4 portrait");
  const long = createPrintDocument({ ...options, mode: "portrait", details: { ...details, homes: [{ ...homes[0], charges: Array(25).fill(fee) }] } });
  expect(long).toContain("Част 3/3");
  expect((long.match(/class="receipt-total"/g) || [])).toHaveLength(1);
});
