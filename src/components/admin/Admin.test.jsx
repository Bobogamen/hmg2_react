import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Admin from "./Admin";
import { getAdminDashboard } from "../../api/services/adminDashboardService";
jest.mock("../../api/services/adminDashboardService", () => ({ getAdminDashboard: jest.fn() }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "bg" } }) }));
jest.mock("../breadcrumb/BreadcrumpContext", () => { const setBreadcrumbs = jest.fn(); return { useBreadcrumb: () => ({ setBreadcrumbs }) }; });
const dashboard = { users: 12, condominiums: 8, homes: 60, registrations: 1, errors: 1, reachedLimits: 1,
  generatedAt: "2026-10-01T12:00:00", periodStart: "2026-09-25", periodEnd: "2026-10-01",
  recentRegistrations: [{ id: 1, name: "Нов потребител", email: "new@example.test", registeredOn: "2026-10-01" }],
  recentErrors: [{ id: 1, action: "Неуспешно начисление", timestamp: "2026-10-01T10:00:00" }],
  capacityAlerts: [{ id: 2, name: "Управител", email: "manager+test@example.test", used: 3, limit: 3 }] };
const mount = () => render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Admin /></MemoryRouter>);
beforeEach(() => { jest.clearAllMocks(); getAdminDashboard.mockResolvedValue(dashboard); });
test("shows real totals and actionable links for errors and reached limits", async () => {
  mount();
  expect(screen.getByRole("status")).toHaveTextContent("Зареждане");
  await screen.findByText("Неуспешно начисление");
  expect(within(screen.getByRole("region", { name: "Основни показатели" })).getByText("60")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Преглед: Управител" })).toHaveAttribute("href", "/admin/users?profile=2");
  expect(screen.getByRole("link", { name: "Отвори всички грешки" })).toHaveAttribute("href", "/admin/application-logs?level=ERROR");
});
test("reloads the selected period and refreshes without changing it", async () => {
  mount(); await screen.findByText("Неуспешно начисление");
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "30" } });
  await waitFor(() => expect(getAdminDashboard).toHaveBeenLastCalledWith(30, expect.any(AbortSignal)));
  await waitFor(() => expect(screen.getByRole("button", { name: "Обнови" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Обнови" }));
  await waitFor(() => expect(getAdminDashboard).toHaveBeenCalledTimes(3));
  expect(getAdminDashboard).toHaveBeenLastCalledWith(30, expect.any(AbortSignal));
});
test("does not turn a failed request into reassuring zero counts and supports retry", async () => {
  getAdminDashboard.mockRejectedValueOnce(new Error("offline"));
  mount(); await screen.findByRole("alert");
  expect(screen.queryByText("Няма записани грешки за този период.")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Опитай отново" }));
  await screen.findByText("Неуспешно начисление");
});
test("shows explicit empty states", async () => {
  getAdminDashboard.mockResolvedValue({ ...dashboard, registrations: 0, errors: 0, reachedLimits: 0, recentRegistrations: [], recentErrors: [], capacityAlerts: [] });
  mount();
  await screen.findByText("Няма записани грешки за този период.");
  expect(screen.getByText("Няма потребители с достигнат лимит за сгради.")).toBeInTheDocument();
  expect(screen.getByText("Няма нови регистрации за този период.")).toBeInTheDocument();
});
test("ignores an older request after changing the period", async () => {
  let finish;
  getAdminDashboard.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  mount();
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "30" } });
  await screen.findByText("Неуспешно начисление");
  expect(getAdminDashboard.mock.calls[0][1].aborted).toBe(true);
  finish({ ...dashboard, recentErrors: [{ id: 99, action: "Old request" }] });
  await waitFor(() => expect(screen.queryByText("Old request")).not.toBeInTheDocument());
});
