import { buildPrintModel, createPrintDocument } from "./printDocument";
jest.mock("react-dom/server", () => jest.requireActual("react-dom/server.node"));
const labels = {
  fund: "Фонд",
  ...require("../../locales/bg/dashboard.json").printPage,
  "home:residents": require("../../locales/bg/home.json").residents,
};
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
test.each(["properties", "receipts"])("%s print contains only the requested section", (section) => {
  const html = createPrintDocument({ ...options, section });
  const dom = new DOMParser().parseFromString(html, "text/html");
  expect(dom.body.children).toHaveLength(1);
  expect(dom.body.firstElementChild.className).toBe(`${section}-document`);
  if (section === "properties") {
    expect(dom.querySelectorAll(".fee-summary")).toHaveLength(2);
    expect(dom.querySelector(".receipt")).toBeNull();
  } else {
    expect(dom.querySelector(".properties-table")).toBeNull();
    expect(dom.querySelectorAll(".receipt")).toHaveLength(2);
  }
});
test("sorts fee types across homes and styles funds in both summary and slips", () => {
  const fund = { ...fee, name: "A fund", fundName: "Roof reserve", primary: false, fund: true, monthly: true };
  const monthly = { ...fee, name: "B monthly", primary: false, monthly: true };
  const once = { ...fee, name: "C once", primary: false };
  const primary = { ...fee, name: "Z primary" };
  const mixed = { ...details, homes: [
    { ...details.homes[0], charges: [fund], receipts: [] },
    { ...details.homes[1], charges: [once, fund, monthly], receipts: [primary] },
  ] };
  const expected = [primary.name, monthly.name, once.name, fund.name];
  const model = buildPrintModel(mixed);
  expect(model.fees.map(f => f.name)).toEqual(expected);
  expect(model.homes[1].fees.map(f => f.name)).toEqual(expected);
  const dom = new DOMParser().parseFromString(createPrintDocument({ ...options, details: mixed }), "text/html");
  expect(dom.querySelectorAll(".properties-document .fund-fee")).toHaveLength(1);
  expect(dom.querySelectorAll(".receipts-document .fund-fee")).toHaveLength(2);
  dom.querySelectorAll(".fund-fee td:first-child").forEach(cell => {
    expect(cell.children[0].textContent).toBe('Фонд "Roof reserve"');
    expect(cell.children[1].textContent).toBe("A fund");
  });
  const summaries = dom.querySelectorAll(".fee-summary");
  expect([...summaries].map(table => table.querySelector("caption").textContent)).toEqual(["Такси", "Фондове"]);
  expect(summaries[0].querySelectorAll(".fund-fee")).toHaveLength(0);
  expect(summaries[0].querySelector(".total .number").textContent).toBe("€ 15,00");
  expect(summaries[1].querySelector(".total .number").textContent).toBe("€ 10,00");
});
test("combined document uses portrait properties and landscape slips with narrow margins and escaped text", () => {
  const html = createPrintDocument({ ...options, mode: "landscape", condominium: { ...options.condominium, address: "<script>alert(1)</script>" } });
  const normalized = html.replace(/\s+/g, " ");
  expect(normalized).toContain("@page properties { size: A4 portrait; margin: 6mm 6mm 6mm 16mm; }");
  expect(normalized).toContain("@page receipts { size: A4 landscape; margin: 6mm; }");
  const dom = new DOMParser().parseFromString(html, "text/html");
  expect(dom.body.children[0].className).toBe("properties-document");
  expect(dom.body.children[1].className).toBe("receipts-document");
  expect(html).toContain("Подпис");
  expect(html).not.toContain("Обобщение по такси");
  expect(html).toContain("&lt;script&gt;");
  expect(html).not.toContain("<script>");
  expect(html).toContain("Общо €");
  expect(html).toContain("12,50");
  expect(dom.querySelector(".properties-table tbody tr").children[4].textContent).toBe("7,50");
  expect(dom.querySelector(".properties-table .total").children[1].textContent).toBe("€ 12,50");
});
test("prints active resident counts by home ID, preserving zero and missing values", () => {
  const html = createPrintDocument({ ...options, condominium: { ...options.condominium,
    homes: [{ id: 2, residentsSize: 0 }, { id: 1, residentsSize: 3 }] } });
  const dom = new DOMParser().parseFromString(html, "text/html");
  const rows = dom.querySelectorAll(".properties-table tbody tr:not(.total)");
  expect(rows[0].children[3].textContent).toBe("3");
  expect(rows[1].children[3].textContent).toBe("0");
  expect(dom.querySelectorAll(".properties-table th")).toHaveLength(8);
  const missing = new DOMParser().parseFromString(createPrintDocument(options), "text/html");
  expect(missing.querySelector(".properties-table tbody tr").children[3].textContent).toBe("—");
});

test("receipt has framed home identifiers and separate price, quantity and total columns", () => {
  const dom = new DOMParser().parseFromString(createPrintDocument(options), "text/html");
  const receipt = dom.querySelector(".receipt");
  expect([...receipt.querySelectorAll(".receipt-home span")].map(el => el.textContent)).toEqual(["ет", "ап"]);
  expect([...receipt.querySelectorAll(".receipt-home b")].map(el => el.textContent)).toEqual(["1", "1"]);
  expect([...receipt.querySelectorAll("th")].map(el => el.textContent)).toEqual([labels.fee, "€", "бр.", labels.total]);
  expect([...receipt.querySelector("tbody tr").children].map(el => el.textContent)).toEqual([fee.name, "2,50", "2", "5,00"]);
  expect(receipt.querySelector(".receipt-total").textContent).toBe("Общо€ 7,50");
});
test("landscape slips use three per row and carry long fee lists into numbered parts", () => {
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
