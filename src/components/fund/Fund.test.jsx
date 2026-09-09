import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Fund from "./Fund";
import { BreadcrumbProvider } from "../breadcrumb/BreadcrumpContext";
import { getCondominium } from "../../api/services/managementService";
import { getFundDetails, addFundExpense } from "../../api/services/fundService";

jest.mock("../../api/services/managementService", () => ({ getCondominium: jest.fn() }));
jest.mock("../../api/services/fundService", () => ({ getFundDetails: jest.fn(), addFundExpense: jest.fn() }));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn() } }));
jest.mock("../../user/UserContext", () => ({ useUser: () => ({ user: { condominiums: [{ id: 1, name: "Building A" }] } }) }));
jest.mock("react-i18next", () => {
    const translations = { finance: require("../../locales/en/finance.json"), home: require("../../locales/en/home.json"),
        common: require("../../locales/en/common.json"), validation: require("../../locales/en/validation.json") };
    const t = (key, options = {}) => {
        const [ns, path] = key.includes(":") ? key.split(":") : ["common", key];
        const value = path.split(".").reduce((result, part) => result?.[part], translations[ns]);
        return typeof value === "string" ? value.replace(/{{(\w+)}}/g, (_, name) => options[name]) : key;
    };
    return { useTranslation: () => ({ t, i18n: { language: "en" } }) };
});
const fund = { id: 5, name: "Reserve", availableFunds: "80.00" };
const condo = { id: 1, name: "Building A", funds: [fund, { id: 6, name: "Garden" }] };
const details = { fund, incomes: "100.00", totalExpenses: "20.00", balance: "80.00", expenses: [], homes: [
    { id: 10, floor: "1", name: "2", ownerName: "Anna", totalFee: "12.50", fees: [
        { id: 7, name: "Reserve fee", value: "12.50", times: 1, amount: "12.50" },
    ] },
] };
const open = (path = "/fund/condominiums/1/funds/5") => render(<MemoryRouter initialEntries={[path]}>
    <BreadcrumbProvider><Routes>
        <Route path="/fund" element={<Fund />} />
        <Route path="/fund/condominiums/:condominiumId" element={<Fund />} />
        <Route path="/fund/condominiums/:condominiumId/funds/:fundId" element={<Fund />} />
    </Routes></BreadcrumbProvider>
</MemoryRouter>);
beforeEach(() => {
    jest.clearAllMocks();
    getCondominium.mockResolvedValue(condo);
    getFundDetails.mockResolvedValue(details);
    addFundExpense.mockResolvedValue({ id: 1 });
});
test("selects a building and fund, shows fees and finances without payment controls", async () => {
    open("/fund");
    fireEvent.click(screen.getByRole("link", { name: "Building A" }));
    fireEvent.click(await screen.findByRole("link", { name: /Reserve/ }));
    expect(await screen.findByRole("heading", { name: "Reserve" })).toBeInTheDocument();
    expect(screen.getByText("Anna")).toBeInTheDocument();
    expect(screen.getByText("€ 12.50")).toBeInTheDocument();
    expect(screen.getAllByText("€ 80.00")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: /pay/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Browse funds" }));
    const modal = within(await screen.findByRole("dialog"));
    getFundDetails.mockResolvedValue({ ...details, fund: { id: 6, name: "Garden" } });
    fireEvent.click(modal.getByRole("link", { name: "Garden" }));
    await screen.findByRole("heading", { name: "Garden" });
    expect(getFundDetails).toHaveBeenLastCalledWith({ condominiumId: "1", fundId: "6" });
});
test("saves a fund expense and refreshes its financial totals", async () => {
    open();
    fireEvent.click(await screen.findByRole("button", { name: "Add expense" }));
    const modal = within(await screen.findByRole("dialog"));
    fireEvent.change(modal.getByLabelText(/^name$/i), { target: { value: "Materials" } });
    fireEvent.change(modal.getByLabelText(/Value/i), { target: { value: "5.25" } });
    fireEvent.change(modal.getByLabelText("Document number"), { target: { value: "INV-1" } });
    getFundDetails.mockResolvedValue({ ...details, totalExpenses: "25.25", balance: "74.75", expenses: [
        { id: 1, name: "Materials", value: "5.25", documentNumber: "INV-1", documentDate: "2026-01-01" },
    ] });
    fireEvent.click(modal.getByRole("button", { name: "Add", exact: true }));
    await waitFor(() => expect(addFundExpense).toHaveBeenCalledWith(expect.objectContaining({
        condominiumId: 1, fundId: 5, name: "Materials", value: "5.25", documentNumber: "INV-1",
    })));
    expect(await screen.findByText("Materials")).toBeInTheDocument();
    expect(screen.getAllByText("€ 74.75")).toHaveLength(2);
});
test("failed detail requests provide retry", async () => {
    getFundDetails.mockRejectedValueOnce(new Error("offline"));
    open();
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { name: "Reserve" })).toBeInTheDocument();
});
