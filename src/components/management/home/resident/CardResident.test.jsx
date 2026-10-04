import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CardResident from "./CardResident";
import { activateResident } from "../../../../api/services/residentService";

const mockSetIsLoading = jest.fn();

jest.mock("../../../../api/services/residentService", () => ({ activateResident: jest.fn() }));
jest.mock("../../../../loader/LoadingContext", () => ({
  useLoading: () => ({ setIsLoading: mockSetIsLoading }),
}));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key) => key }) }));
jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
  Bounce: {},
}));
jest.mock("./ModalResident", () => () => null);
jest.mock("./ModalActivateResident", () => ({ show, onActivate, resident }) => show
  ? <button onClick={() => onActivate(resident.id)}>confirm-activation</button>
  : null);

beforeEach(() => {
  jest.clearAllMocks();
});

test("closes confirmation and keeps the global loader through activation and refresh", async () => {
  let finishActivation;
  let finishRefresh;
  activateResident.mockReturnValue(new Promise((resolve) => { finishActivation = resolve; }));
  const onSaved = jest.fn().mockReturnValue(new Promise((resolve) => { finishRefresh = resolve; }));

  render(
    <CardResident
      resident={{ id: 10, firstName: "Ivan", lastName: "Ivanov", deleted: true }}
      home={{ id: 2 }}
      condominium={{ id: 1 }}
      onSaved={onSaved}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: /common:activate/ }));
  fireEvent.click(screen.getByRole("button", { name: "confirm-activation" }));

  expect(screen.queryByRole("button", { name: "confirm-activation" })).not.toBeInTheDocument();
  expect(mockSetIsLoading).toHaveBeenCalledWith(true);
  expect(mockSetIsLoading).not.toHaveBeenCalledWith(false);

  finishActivation();
  await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
  expect(mockSetIsLoading).not.toHaveBeenCalledWith(false);

  finishRefresh();
  await waitFor(() => expect(mockSetIsLoading).toHaveBeenCalledWith(false));
});
