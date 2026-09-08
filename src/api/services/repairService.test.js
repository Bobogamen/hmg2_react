import api from "../axios";
import { payRepairInstallment, addRepairExpense, completeRepair, addRepair } from "./repairService";
import { repairSchedule } from "../../utils/repairSchedule";

jest.mock("../axios", () => ({ put: jest.fn(), post: jest.fn() }));

test("sends the rounded installment values shown in the creation preview", async () => {
    const input = { budget: "100", homeIds: [1, 2, 3], distributionType: "EQUAL", installments: 3 };
    const schedule = repairSchedule(input);
    api.post.mockResolvedValue({ data: { id: 5 } });
    await addRepair({ condominiumId: 1, name: "Roof repair", ...input,
        homeInstallmentValues: Object.fromEntries(schedule.map((share) => [share.homeId, share.payments[0]])),
    });
    expect(api.post).toHaveBeenCalledWith("/management/condominiums/1/repairs", expect.objectContaining({
        budget: "100", installments: 3, homeInstallmentValues: { 1: 12, 2: 12, 3: 12 },
    }));
});

test("completes the repair selected by condominium and repair IDs", async () => {
    api.put.mockResolvedValue({ status: 204 });
    await completeRepair({ condominiumId: 1, repairId: 5 });
    expect(api.put).toHaveBeenCalledWith("/management/condominiums/1/repairs/5/complete");
});

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
