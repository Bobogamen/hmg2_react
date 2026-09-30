import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UserSettings from "./UserSettings";
import { getAdminUserSettings, updateAdminUserSetting } from "../../api/services/adminUserService";
jest.mock("../../api/services/adminUserService", () => ({ getAdminUserSettings: jest.fn(), updateAdminUserSetting: jest.fn() }));
const setting = { settingKey: "fee_home_limit", value: "6", defaultValue: "6", type: "INTEGER",
  overridden: false, targetType: "HOME", targetId: 9, targetName: "Sunrise / Home 1" };
beforeEach(() => { jest.clearAllMocks(); getAdminUserSettings.mockResolvedValue([setting]); });

test("saves zero directly on the target entity and resets it to the default", async () => {
  updateAdminUserSetting.mockResolvedValueOnce({ ...setting, value: "0", overridden: true }).mockResolvedValueOnce(setting);
  render(<UserSettings userId={2} onBusy={jest.fn()} />);
  fireEvent.change(await screen.findByLabelText("fee_home_limit"), { target: { value: "0" } });
  fireEvent.click(screen.getByRole("button", { name: "Save setting" }));
  await screen.findByText("Custom");
  expect(updateAdminUserSetting).toHaveBeenCalledWith(2, setting, "0");
  fireEvent.click(screen.getByRole("button", { name: "Reset to default" }));
  await screen.findByText("Default");
  expect(updateAdminUserSetting).toHaveBeenLastCalledWith(2, { ...setting, value: "0", overridden: true }, null);
});

test("accepts one as a limit and rejects negative values", async () => {
  render(<UserSettings userId={2} onBusy={jest.fn()} />);
  const input = await screen.findByLabelText("fee_home_limit");
  fireEvent.change(input, { target: { value: "-1" } });
  expect(screen.getByRole("button", { name: "Save setting" })).toBeDisabled();
  fireEvent.change(input, { target: { value: "1" } });
  expect(screen.getByRole("button", { name: "Save setting" })).toBeEnabled();
});

test("failed saves retain the entered value for retry", async () => {
  updateAdminUserSetting.mockRejectedValue(new Error("offline"));
  render(<UserSettings userId={2} onBusy={jest.fn()} />);
  fireEvent.change(await screen.findByLabelText("fee_home_limit"), { target: { value: "8" } });
  fireEvent.click(screen.getByRole("button", { name: "Save setting" }));
  await screen.findByRole("alert");
  await waitFor(() => expect(screen.getByRole("button", { name: "Save setting" })).toBeEnabled());
  expect(screen.getByLabelText("fee_home_limit")).toHaveValue(8);
});
