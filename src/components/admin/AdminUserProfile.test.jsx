import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminUserProfile from "./AdminUserProfile";
import { getAdminUserProfile } from "../../api/services/adminUserProfileService";
jest.mock("../../api/services/adminUserProfileService", () => ({ getAdminUserProfile: jest.fn() }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "bg" } }) }));
const profile = {
  user: { id: 7, name: "Иван", email: "ivan@example.test", registeredOn: "2026-09-01", roles: ["MANAGER"], blocked: false },
  lastActivity: "2026-10-01T10:00:00", limits: [{ key: "condominium_limit", used: 1, limit: 0 }, { key: "cashier_limit", used: 2, limit: 2 }],
  buildings: [{ id: 3, name: "Изгрев", city: "София", address: "Улица 1", homes: 10, limits: [{ key: "fee_limit", used: 3, limit: 5 }], funds: [] }],
  recentActions: [{ id: 1, level: "ERROR", action: "Неуспешно плащане", timestamp: "2026-10-01T10:00:00" }, { id: 2, level: "INFO", action: "Добавена сграда", timestamp: "2026-09-30T10:00:00" }]
};
beforeEach(() => { jest.clearAllMocks(); getAdminUserProfile.mockResolvedValue(profile); });
test("shows account, usage, buildings and recorded activity and passes the account to editing", async () => {
  const onEdit = jest.fn();
  render(<AdminUserProfile userId={7} onHide={jest.fn()} onEdit={onEdit} />);
  expect(screen.getByRole("status")).toHaveTextContent("Зареждане");
  await screen.findByText("ivan@example.test");
  expect(screen.getByText("/ Без лимит")).toBeInTheDocument();
  expect(screen.getByText("Достигнат")).toBeInTheDocument();
  expect(screen.getByText(/Това не е индикатор/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Изгрев/ }));
  expect(screen.getByRole("progressbar", { name: "Такси" })).toHaveAttribute("aria-valuenow", "3");
  fireEvent.click(screen.getByRole("button", { name: "Редактирай акаунта" }));
  expect(onEdit).toHaveBeenCalledWith(profile.user);
});
test("searches buildings and filters the recent activity", async () => {
  render(<AdminUserProfile userId={7} onHide={jest.fn()} onEdit={jest.fn()} />);
  await screen.findByText("ivan@example.test");
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Пловдив" } });
  expect(screen.getByText("Няма сгради, отговарящи на търсенето.")).toBeInTheDocument();
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "ERROR" } });
  expect(screen.getByText("Неуспешно плащане")).toBeInTheDocument();
  expect(screen.queryByText("Добавена сграда")).not.toBeInTheDocument();
});
test("handles failures, retry and missing accounts", async () => {
  getAdminUserProfile.mockRejectedValueOnce(new Error("offline"));
  render(<AdminUserProfile userId={7} onHide={jest.fn()} onEdit={jest.fn()} />);
  await screen.findByRole("alert");
  expect(screen.getByRole("button", { name: "Редактирай акаунта" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Опитай отново" }));
  await screen.findByText("ivan@example.test");
  getAdminUserProfile.mockRejectedValueOnce({ response: { status: 404 } });
  fireEvent.click(screen.getByRole("button", { name: "Обнови" }));
  await screen.findByText("Потребителят не е намерен.");
  expect(screen.queryByText("ivan@example.test")).not.toBeInTheDocument();
});
test("shows empty data without inventing activity", async () => {
  getAdminUserProfile.mockResolvedValue({ ...profile, lastActivity: null, buildings: [], recentActions: [] });
  render(<AdminUserProfile userId={7} onHide={jest.fn()} onEdit={jest.fn()} />);
  await screen.findByText("Няма записана активност");
  expect(screen.getByText("Потребителят няма свързани активни сгради.")).toBeInTheDocument();
  expect(screen.getByText("Няма записани действия за този потребител.")).toBeInTheDocument();
});
test("ignores late results when another user is selected", async () => {
  let finish;
  getAdminUserProfile.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const view = render(<AdminUserProfile userId={7} onHide={jest.fn()} onEdit={jest.fn()} />);
  view.rerender(<AdminUserProfile userId={8} onHide={jest.fn()} onEdit={jest.fn()} />);
  await screen.findByText("ivan@example.test");
  expect(getAdminUserProfile.mock.calls[0][1].aborted).toBe(true);
  finish({ ...profile, user: { ...profile.user, email: "wrong@example.test" } });
  await waitFor(() => expect(screen.queryByText("wrong@example.test")).not.toBeInTheDocument());
});
