import api from "../axios";
import { payRepairInstallment, addRepairExpense } from "./repairService";

jest.mock("../axios", () => ({ put: jest.fn(), post: jest.fn() }));

test("records the selected installment date without changing its scheduled value", async () => {
    const payment = { id: 12, paidDate: "2026-01-04" };
    api.put.mockResolvedValue({ data: payment });
    const result = await payRepairInstallment({ condominiumId: 1, repairId: 5, paymentId: 12, paidDate: "2026-01-04", value: 999 });
    expect(api.put).toHaveBeenCalledWith("/management/condominiums/1/repairs/5/payments/12/paid", { paidDate: "2026-01-04" });
    expect(result).toEqual(payment);
});

test("expense requests contain only editable fields and leave addedOn to the server", async () => {
    api.post.mockResolvedValue({ data: { id: 1, addedOn: "2026-09-08" } });
    await addRepairExpense({ condominiumId: 1, repairId: 5, name: "Materials", value: "25", documentNumber: "INV-1", documentDate: "2026-01-01", addedOn: "1900-01-01" });
    expect(api.post).toHaveBeenCalledWith("/management/condominiums/1/repairs/5/expenses", {
        name: "Materials", value: "25", documentNumber: "INV-1", documentDate: "2026-01-01",
    });
});
