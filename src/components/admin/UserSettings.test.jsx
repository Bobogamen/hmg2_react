import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UserSettings from "./UserSettings";
import { getAdminUserSettings, updateAdminUserSetting } from "../../api/services/adminUserService";
jest.mock("../../api/services/adminUserService", () => ({ getAdminUserSettings: jest.fn(), updateAdminUserSetting: jest.fn() }));
const setting = { settingKey: "fee_home_limit", value: "6", defaultValue: "6", type: "INTEGER",
  overridden: false, targetType: "CONDOMINIUM", targetId: 3, targetName: "Sunrise" };
beforeEach(() => { jest.clearAllMocks(); getAdminUserSettings.mockResolvedValue([setting]); });

test("saves zero directly on the target entity and resets it to the default", async () => {
  updateAdminUserSetting.mockResolvedValueOnce({ ...setting, value: "0", overridden: true }).mockResolvedValueOnce(setting);
  render(<UserSettings userId={2} onBusy={jest.fn()} />);
  fireEvent.change(await screen.findByLabelText("Fees per home"), { target: { value: "0" } });
  fireEvent.click(screen.getByRole("button", { name: "Save fee_home_limit" }));
  await screen.findByText("Custom");
  expect(updateAdminUserSetting).toHaveBeenCalledWith(2, setting, "0");
  fireEvent.click(screen.getByRole("button", { name: "Reset fee_home_limit to default" }));
  await screen.findByText("Default");
  expect(updateAdminUserSetting).toHaveBeenLastCalledWith(2, { ...setting, value: "0", overridden: true }, null);
});

test("accepts one as a limit and rejects negative values", async () => {
  render(<UserSettings userId={2} onBusy={jest.fn()} />);
  const input = await screen.findByLabelText("Fees per home");
  fireEvent.change(input, { target: { value: "-1" } });
  expect(screen.getByRole("button", { name: "Save fee_home_limit" })).toBeDisabled();
  fireEvent.change(input, { target: { value: "1" } });
  expect(screen.getByRole("button", { name: "Save fee_home_limit" })).toBeEnabled();
});

test("failed saves retain the entered value for retry", async () => {
  updateAdminUserSetting.mockRejectedValue(new Error("offline"));
  render(<UserSettings userId={2} onBusy={jest.fn()} />);
  fireEvent.change(await screen.findByLabelText("Fees per home"), { target: { value: "8" } });
  fireEvent.click(screen.getByRole("button", { name: "Save fee_home_limit" }));
  await screen.findByRole("alert");
  await waitFor(() => expect(screen.getByRole("button", { name: "Save fee_home_limit" })).toBeEnabled());
  expect(screen.getByLabelText("Fees per home")).toHaveValue(8);
});
