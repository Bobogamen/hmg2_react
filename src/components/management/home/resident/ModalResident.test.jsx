import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ModalResident from "./ModalResident";
import { addResident } from "../../../../api/services/residentService";

const mockSetIsLoading = jest.fn();

jest.mock("../../../../api/services/residentService", () => ({
  addResident: jest.fn(),
  editResident: jest.fn(),
  deleteResident: jest.fn(),
}));
jest.mock("../../../../user/UserContext", () => ({
  useUser: () => ({ updateUser: jest.fn().mockResolvedValue({}) }),
}));
jest.mock("../../../../loader/LoadingContext", () => ({
  useLoading: () => ({ setIsLoading: mockSetIsLoading }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { t: (key) => key },
  }),
  Trans: ({ i18nKey }) => i18nKey,
}));
jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), warning: jest.fn(), error: jest.fn(), info: jest.fn() },
  Bounce: {},
}));

test("closes immediately and keeps the global loader through saving and refreshing", async () => {
  let finishSave;
  let finishRefresh;
  addResident.mockReturnValue(new Promise((resolve) => { finishSave = resolve; }));
  const onSaved = jest.fn().mockReturnValue(new Promise((resolve) => { finishRefresh = resolve; }));
  const handleClose = jest.fn();

  render(
    <ModalResident
      show
      handleClose={handleClose}
      home={{ id: 2, name: "2", floor: "1" }}
      condominium={{ id: 1 }}
      onSaved={onSaved}
    />,
  );

  fireEvent.change(screen.getByLabelText("form:firstName"), { target: { value: "Ivan" } });
  fireEvent.click(screen.getByRole("button", { name: "add" }));

  expect(handleClose).toHaveBeenCalledTimes(1);
  expect(mockSetIsLoading).toHaveBeenCalledWith(true);
  expect(mockSetIsLoading).not.toHaveBeenCalledWith(false);

  finishSave({ id: 10, firstName: "Ivan" });
  await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
  expect(mockSetIsLoading).not.toHaveBeenCalledWith(false);

  finishRefresh();
  await waitFor(() => expect(mockSetIsLoading).toHaveBeenCalledWith(false));
  expect(handleClose).toHaveBeenCalledTimes(1);
});
