import React from "react";
import { render, screen, within } from "@testing-library/react";
import HomeRepairsTable from "./HomeRepairsTable";
import { getHomeRepairs } from "../../../api/services/repairService";
import api from "../../../api/axios";
import finance from "../../../locales/en/finance.json";

jest.mock("../../../api/axios", () => ({ get: jest.fn() }));
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key, options = {}) => {
            const translations = require("../../../locales/en/finance.json");
            const value = key.replace("finance:", "").split(".")
                .reduce((result, part) => result[part], translations);
            return value.replace(/{{(\w+)}}/g, (_, name) => options[name]);
        },
    }),
}));

beforeEach(() => api.get.mockReset());

test("loads only assigned repairs and counts payments for the current home", async () => {
    api.get.mockResolvedValueOnce({ data: [
        { id: 1, name: "Roof", budget: "1000.01", homeIds: [7, 8], completed: false },
        { id: 2, name: "Lift", budget: 300, homeIds: [8], completed: false },
    ] }).mockResolvedValueOnce({ data: [
        { id: 11, homeId: 7, value: "33.33", paidDate: "2026-09-01" },
        { id: 12, homeId: "7", value: "33.34", paidDate: null },
        { id: 13, homeId: 8, value: "200.00", paidDate: "2026-09-02" },
    ] });

    const repairs = await getHomeRepairs({ condominiumId: 5, homeId: "7" });
    expect(api.get).toHaveBeenCalledTimes(2);
    expect(api.get).toHaveBeenNthCalledWith(1, "/management/condominiums/5/repairs");
    expect(api.get).toHaveBeenNthCalledWith(2, "/management/condominiums/5/repairs/1/payments");
    render(<HomeRepairsTable repairs={repairs} />);

    const row = within(screen.getByRole("rowheader", { name: /Roof/ }).closest("tr"));
    expect(row.getByText(/€ 1001/)).toBeInTheDocument();
    expect(row.getByText("€ 34")).toBeInTheDocument();
    expect(row.getByRole("cell", { name: "2" })).toBeInTheDocument();
    expect(row.getByText("1 of 2")).toBeInTheDocument();
    expect(row.getByText("Not completed")).toBeInTheDocument();
    expect(screen.queryByText("Lift")).not.toBeInTheDocument();
});

test("repair completion is independent of this home's payment progress", () => {
    render(<HomeRepairsTable repairs={[
        { id: 1, name: "Roof", budget: 100, completed: false,
            payments: [{ value: 50, paidDate: "2026-09-01" }] },
        { id: 2, name: "Entrance", budget: 200, completed: true,
            payments: [{ value: 100, paidDate: null }] },
    ]} />);
    const roof = within(screen.getByRole("rowheader", { name: /Roof/ }).closest("tr"));
    expect(roof.getByText("1 of 1")).toHaveClass("bg-success");
    expect(roof.getByText("Not completed")).toBeInTheDocument();
    const entrance = within(screen.getByRole("rowheader", { name: /Entrance/ }).closest("tr"));
    expect(entrance.getByText("0 of 1")).toBeInTheDocument();
    expect(entrance.getByText("Completed")).toBeInTheDocument();
});

test("shows the empty state without requesting payments for unrelated repairs", async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1, homeIds: [8] }] });
    const repairs = await getHomeRepairs({ condominiumId: 5, homeId: 7 });
    render(<HomeRepairsTable repairs={repairs} />);
    expect(screen.getByText(finance.homeRepairs.empty)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(api.get).toHaveBeenCalledTimes(1);
});

test("payment loading failures are propagated instead of reporting zero paid", async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1, homeIds: [7] }] })
        .mockRejectedValueOnce(new Error("Failed to load payments"));
    await expect(getHomeRepairs({ condominiumId: 5, homeId: 7 }))
        .rejects.toThrow("Failed to load payments");
});
