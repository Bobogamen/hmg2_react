import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ModalFund from "./ModalFund";
import { validateFund } from "../../../api/services/fundService";

jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: key => key }), Trans: () => null }));
jest.mock("../../../api/services/fundService", () => ({
    validateFund: jest.fn(), addFund: jest.fn(), editFund: jest.fn(), deleteFund: jest.fn(),
}));

test("rejects dates before the condominium start date and accepts the same date", async () => {
    validateFund.mockClear();
    validateFund.mockResolvedValue({});
    render(<ModalFund show handleClose={jest.fn()} condominium={{ id: 1, startDate: "2026-05-10", fees: [], homes: [] }} />);
    const date = screen.getByLabelText("finance:period.startDate");
    expect(date).toHaveAttribute("min", "2026-05-10");
    fireEvent.change(date, { target: { value: "2026-05-09" } });
    fireEvent.submit(screen.getByRole("form", { name: "finance:fundForm" }));
    expect(validateFund).not.toHaveBeenCalled();
    const dateError = screen.getByText("fundStartDateBeforeCondominium");
    expect(dateError).toHaveClass("bg-danger", "text-light", "rounded");
    fireEvent.change(date, { target: { value: "2026-05-10" } });
    fireEvent.submit(screen.getByRole("form", { name: "finance:fundForm" }));
    await screen.findByText("finance:assignFundFees");
    expect(validateFund).toHaveBeenCalledWith(expect.objectContaining({ startDate: "2026-05-10" }));
});

test("overlapping fund fees cannot be selected together and become available after deselection", async () => {
    validateFund.mockResolvedValue({});
    render(<ModalFund show handleClose={jest.fn()} condominium={{ id: 1, homes: [], fees: [
        { id: 1, name: "First", fund: true, homeIds: [1], homes: 1 },
        { id: 2, name: "Conflicting", fund: true, homeIds: ["1"], homes: 1 },
        { id: 3, name: "Separate", fund: true, homeIds: [2], homes: 1 },
    ] }} />);
    fireEvent.submit(screen.getByRole("form", { name: "finance:fundForm" }));
    const first = await screen.findByRole("checkbox", { name: "select First" });
    const conflicting = screen.getByRole("checkbox", { name: "select Conflicting" });
    fireEvent.click(first);
    expect(conflicting).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "select Separate" })).toBeEnabled();
    expect(screen.getByText("finance:homeFundFeeAlreadyAssigned")).toBeInTheDocument();
    fireEvent.click(first);
    expect(conflicting).toBeEnabled();
});

test("renders backend start-date validation in the same format as name validation", async () => {
    validateFund.mockRejectedValueOnce({
        isValidationError: true,
        validationErrors: { startDate: [{ code: "pastOrPresent" }] }
    });
    render(<ModalFund show handleClose={jest.fn()} condominium={{ id: 1, startDate: "2026-01-01", fees: [], homes: [] }} />);

    fireEvent.submit(screen.getByRole("form", { name: "finance:fundForm" }));

    const dateError = await screen.findByText("pastOrPresent");
    expect(dateError).toHaveClass("bg-danger", "text-light", "rounded", "mt-1", "px-2");
});
