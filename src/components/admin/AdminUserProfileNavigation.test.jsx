import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Users from "./Users";
import { getAdminUsers } from "../../api/services/adminUserService";
import { getAdminUserProfile } from "../../api/services/adminUserProfileService";
jest.mock("../../api/services/adminUserService", () => ({ getAdminUsers: jest.fn() }));
jest.mock("../../api/services/adminUserProfileService", () => ({ getAdminUserProfile: jest.fn() }));
jest.mock("./UserSettings", () => () => <div>Entity settings</div>);
jest.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "bg" } }) }));
jest.mock("../breadcrumb/BreadcrumpContext", () => { const setBreadcrumbs = jest.fn(); return { useBreadcrumb: () => ({ setBreadcrumbs }) }; });
const user = { id: 7, name: "Иван", email: "ivan@example.test", roles: ["MANAGER"], registeredOn: "2026-09-01", condominiumCount: 0, condominiumLimit: 3, blocked: false };
beforeEach(() => {
  jest.clearAllMocks();
  getAdminUsers.mockResolvedValue({ content: [user], totalElements: 1, totalPages: 1 });
  getAdminUserProfile.mockResolvedValue({ user, lastActivity: null, limits: [], buildings: [], recentActions: [] });
});
afterEach(() => window.history.replaceState({}, "", "/"));
test("opens a profile directly from a dashboard link", async () => {
  window.history.replaceState({}, "", "/admin/users?profile=7");
  render(<Users />);
  await screen.findByText("Няма записана активност");
  expect(getAdminUserProfile).toHaveBeenCalledWith("7", expect.any(AbortSignal));
  expect(screen.getByRole("dialog", { name: "Профил на потребител" })).toBeInTheDocument();
});
test("opens from the user list and switches to the existing account editor", async () => {
  render(<Users />);
  fireEvent.click((await screen.findAllByRole("button", { name: "Профил: ivan@example.test" }))[0]);
  await screen.findByText("Няма записана активност");
  fireEvent.click(screen.getByRole("button", { name: "Редактирай акаунта" }));
  await waitFor(() => expect(screen.queryByRole("dialog", { name: "Профил на потребител" })).not.toBeInTheDocument());
  expect(screen.getByRole("dialog", { name: /Edit user/ })).toBeInTheDocument();
  expect(screen.getByLabelText("Condominium limit")).toHaveValue(3);
});
test("ignores invalid profile links", async () => {
  window.history.replaceState({}, "", "/admin/users?profile=invalid");
  render(<Users />);
  await screen.findAllByText(user.email);
  expect(getAdminUserProfile).not.toHaveBeenCalled();
});
