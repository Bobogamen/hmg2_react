import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import ModalRepair from "./ModalRepair";
import { addRepair, editRepair, validateRepair } from "../../../api/services/repairService";
import { toast } from "react-toastify";
import { installNativeValidationTranslations } from "../../../utils/nativeValidation";

jest.mock("../../../api/services/repairService", () => ({
    addRepair: jest.fn(), editRepair: jest.fn(), deleteRepair: jest.fn(), validateRepair: jest.fn(),
}));
jest.mock("../../../loader/LoadingContext", () => ({ useLoading: () => ({ setIsLoading: jest.fn() }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key) => key }), Trans: () => null }));
jest.mock("react-toastify", () => ({ Bounce: null, toast: { success: jest.fn(), warning: jest.fn(), error: jest.fn() } }));

const condominium = { id: 1, name: "Building", homes: [{ id: 10, name: "Home 1" }, { id: 11, name: "Home 2" }] };
const setup = (repair) => render(<ModalRepair show handleClose={jest.fn()} condominium={condominium} repair={repair} />);
const continueToSchedule = async () => {
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "Roof repair" } });
    fireEvent.change(screen.getByLabelText(/finance:budget/), { target: { value: "120" } });
    fireEvent.click(screen.getByRole("button", { name: "continue" }));
    await screen.findByLabelText("finance:numberOfInstallments");
};

beforeEach(() => {
    jest.clearAllMocks();
    validateRepair.mockResolvedValue({});
    addRepair.mockResolvedValue({});
    editRepair.mockResolvedValue({});
});

test("validates step one and submits all setup from step two", async () => {
    setup();
    await continueToSchedule();
    expect(validateRepair).toHaveBeenCalledWith({ condominiumId: 1, name: "Roof repair", budget: "120", repairId: undefined });
    expect(screen.getByLabelText("Home 1").checked).toBe(true);
    fireEvent.change(screen.getByLabelText("finance:numberOfInstallments"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(addRepair).toHaveBeenCalledWith({ condominiumId: 1, name: "Roof repair", budget: "120", homeIds: [10, 11], distributionType: "EQUAL", homePercentages: {}, installments: 3 }));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
});

test("keeps name validation errors on the first step", async () => {
    validateRepair.mockRejectedValue({ isValidationError: true, validationErrors: { name: [{ code: "notBlank" }] } });
    setup();
    fireEvent.click(screen.getByRole("button", { name: "continue" }));
    await screen.findByText("notBlank");
    expect(screen.queryByLabelText("finance:numberOfInstallments")).toBeNull();
    expect(addRepair).not.toHaveBeenCalled();
});

test("allows continuing after correcting a budget rejected by translated browser validation", async () => {
    const cleanup = installNativeValidationTranslations({ t: (key) => key, on: jest.fn(), off: jest.fn() });
    try {
        setup();
        fireEvent.change(screen.getByLabelText("name"), { target: { value: "Roof repair" } });
        const budget = screen.getByLabelText(/finance:budget/);
        fireEvent.change(budget, { target: { value: "-5" } });
        expect(budget.checkValidity()).toBe(false);
        expect(validateRepair).not.toHaveBeenCalled();
        expect(budget.validity.customError).toBe(true);
        fireEvent.change(budget, { target: { value: "100" } });
        fireEvent.click(screen.getByRole("button", { name: "continue" }));
        await screen.findByLabelText("finance:numberOfInstallments");
        expect(validateRepair).toHaveBeenCalledWith(expect.objectContaining({ name: "Roof repair", budget: "100" }));
    } finally {
        cleanup();
    }
});

test("requires homes and valid percentages, and omits deselected homes from the payload", async () => {
    setup();
    await continueToSchedule();
    fireEvent.click(screen.getByLabelText("selectAll"));
    expect(screen.getByRole("button", { name: "save" }).disabled).toBe(true);
    fireEvent.click(screen.getByLabelText("selectAll"));
    fireEvent.click(screen.getByLabelText(/finance:differentPercentage$/));
    fireEvent.change(screen.getByLabelText("Home 1 (%)"), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText("Home 2 (%)"), { target: { value: "40" } });
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    expect(addRepair).not.toHaveBeenCalled();
    expect(toast.warning).toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText("Home 2"));
    fireEvent.change(screen.getByLabelText("Home 1 (%)"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(addRepair).toHaveBeenCalledWith(expect.objectContaining({ homeIds: [10], homePercentages: { 10: 100 } })));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
});

test.each([false, true])("editing only submits the name, with paid payments: %s", async (hasPaidPayments) => {
    setup({ id: 5, name: "Roof", budget: 120, homeIds: [10], distributionType: "PERCENTAGE", homePercentages: { 10: 100 }, installments: 3, hasPaidPayments });
    expect(screen.getByLabelText(/finance:budget/).disabled).toBe(true);
    expect(screen.queryByRole("button", { name: "continue" })).toBeNull();
    expect(screen.queryByLabelText("finance:numberOfInstallments")).toBeNull();
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "  New roof name  " } });
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(editRepair).toHaveBeenCalledWith({ condominiumId: 1, repairId: 5, name: "New roof name" });
    expect(validateRepair).not.toHaveBeenCalled();
    expect(addRepair).not.toHaveBeenCalled();
});

test("shows name validation errors when renaming a repair", async () => {
    editRepair.mockRejectedValue({ isValidationError: true, validationErrors: { name: [{ code: "notBlank" }] } });
    setup({ id: 5, name: "Roof", budget: 120 });
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    await screen.findByText("notBlank");
    expect(toast.success).not.toHaveBeenCalled();
});

test("limits installments using the value returned by the backend", async () => {
    render(<ModalRepair show handleClose={jest.fn()} condominium={{ ...condominium, repairInstallmentsLimit: 12 }} />);
    await continueToSchedule();
    const input = screen.getByLabelText("finance:numberOfInstallments");
    expect(input.max).toBe("12");
    expect(screen.getByText("finance:maximumInstallments: 12")).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBe("repair-installments-limit");
    fireEvent.change(input, { target: { value: "13" } });
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    expect(addRepair).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(addRepair).toHaveBeenCalledWith(expect.objectContaining({ installments: 12 }));
});

test("shows a single installment amount rounded up to a whole euro", async () => {
    setup();
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "Roof repair" } });
    fireEvent.change(screen.getByLabelText(/finance:budget/), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "continue" }));
    const input = await screen.findByLabelText("finance:numberOfInstallments");
    expect(input.max).toBe("60");
    fireEvent.change(input, { target: { value: "3" } });
    const tables = screen.getAllByRole("table");
    const row = within(tables[tables.length - 1]).getByText("Home 1").closest("tr");
    expect(within(row).getByText("€ 17")).toBeTruthy();
    expect(within(row).queryByText(/16\.66/)).toBeNull();
});

test("shows consistent rounded-up equal shares across the summary and every home row", async () => {
    const homes = [...condominium.homes, { id: 12, name: "Home 3", owner: { firstName: "Alex", lastName: "Owner" } }];
    render(<ModalRepair show handleClose={jest.fn()} condominium={{ ...condominium, homes }} />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "Roof repair" } });
    fireEvent.change(screen.getByLabelText(/finance:budget/), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "continue" }));
    const input = await screen.findByLabelText("finance:numberOfInstallments");
    fireEvent.change(input, { target: { value: "3" } });
    const tables = screen.getAllByRole("table");
    const preview = tables[tables.length - 1];
    homes.forEach((home) => {
        const row = within(preview).getByText(home.name).closest("tr");
        expect(within(row).getByText("€ 34")).toBeTruthy();
        expect(within(row).getByText("€ 12")).toBeTruthy();
    });
    expect(within(preview).getByText("Alex Owner")).toBeTruthy();
    expect(screen.getAllByText("€ 34")).toHaveLength(4);
});
