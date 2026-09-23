import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ModalFee from "./ModalFee";
import { validateFee, editFee } from "../../../api/services/feeService";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key) => key }),
    Trans: () => null,
}));
jest.mock("../../../loader/LoadingContext", () => ({
    useLoading: () => ({ setIsLoading: jest.fn() }),
}));
jest.mock("../../../user/UserContext", () => ({
    useUser: () => ({ updateUser: jest.fn() }),
}));
jest.mock("../../../api/services/feeService", () => ({
    validateFee: jest.fn(), editFee: jest.fn(), addFee: jest.fn(), deleteFee: jest.fn(),
}));
jest.mock("./PrimaryFeeInfo", () => () => null);
jest.mock("./MonthlyFeeInfo", () => () => null);
jest.mock("./FundFeeInfo", () => () => null);

const condominium = {
    id: 1,
    homes: [
        { id: 1, name: "Occupied home", hasPrimaryFee: true },
        { id: 2, name: "New home", hasPrimaryFee: false },
        { id: 3, name: "Other occupied home", hasPrimaryFee: true },
    ],
};

beforeEach(() => {
    jest.clearAllMocks();
    validateFee.mockResolvedValue({});
    editFee.mockResolvedValue({});
});

function openFee(primary) {
    render(<ModalFee show handleClose={jest.fn()} condominium={condominium}
        fee={{ id: 10, name: "Monthly fee", value: 5, monthly: true, primary, homeIds: [1, 2] }} />);
}

test("converting a monthly fee excludes homes with another primary fee before validation and saving", async () => {
    openFee(false);
    fireEvent.click(screen.getAllByRole("switch")[1]);
    fireEvent.click(await screen.findByText("common:understand"));
    fireEvent.click(await screen.findByRole("button", { name: /finance:primaryFeeConfirmation.confirm/ }));
    await waitFor(() => expect(screen.getAllByRole("switch")[1].checked).toBe(true));
    fireEvent.submit(document.querySelector("form"));
    await screen.findByText("New home");
    expect(validateFee).toHaveBeenCalledWith(expect.objectContaining({ primary: true, homeIds: [2] }));
    expect(screen.queryByText("Occupied home")).toBeNull();
    expect(screen.queryByText("Other occupied home")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(editFee).toHaveBeenCalledWith(expect.objectContaining({ feeId: 10, primary: true, homeIds: [2] })));
});

test("editing an existing primary fee retains its own homes", async () => {
    openFee(true);
    fireEvent.submit(document.querySelector("form"));
    await screen.findByText("Occupied home");
    expect(screen.queryByText("Other occupied home")).toBeNull();
    expect(validateFee).toHaveBeenCalledWith(expect.objectContaining({ homeIds: [1, 2] }));
});
