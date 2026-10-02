import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Users from "./Users";
import Logs from "./Logs";
import { getAdminUsers } from "../../api/services/adminUserService";
import { getLogs } from "../../api/services/logService";
jest.mock("../../api/services/adminUserService", () => ({ getAdminUsers: jest.fn() }));
jest.mock("../../api/services/logService", () => ({ getLogs: jest.fn() }));
jest.mock("../breadcrumb/BreadcrumpContext", () => { const setBreadcrumbs = jest.fn(); return { useBreadcrumb: () => ({ setBreadcrumbs }) }; });
afterEach(() => { window.history.replaceState({}, "", "/"); });
test("opens the user selected on the dashboard with its email filter", async () => {
  window.history.replaceState({}, "", "/admin/users?search=manager%2Btest%40example.test");
  getAdminUsers.mockResolvedValue({ content: [], totalElements: 0, totalPages: 0 });
  render(<Users />);
  await waitFor(() => expect(getAdminUsers).toHaveBeenCalledWith({ search: "manager+test@example.test", page: 0 }));
  expect(screen.getByRole("searchbox")).toHaveValue("manager+test@example.test");
});
test("opens logs with only errors visible", async () => {
  window.history.replaceState({}, "", "/admin/application-logs?level=ERROR");
  getLogs.mockResolvedValue([
    { id: 1, level: "ERROR", action: "Failed task", timestamp: "2026-10-01T10:00:00" },
    { id: 2, level: "INFO", action: "Successful task", timestamp: "2026-10-01T10:00:00" }
  ]);
  render(<Logs />);
  await screen.findByText("Failed task");
  expect(screen.queryByText("Successful task")).not.toBeInTheDocument();
});
