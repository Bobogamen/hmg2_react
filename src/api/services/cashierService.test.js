import api from "../axios";
import { payCashierHomeFees } from "./cashierService";

jest.mock("../axios", () => ({ post: jest.fn() }));

test("sends the selected payment date unchanged with the expected total", async () => {
  const result = { homes: [] };
  api.post.mockResolvedValue({ data: result });
  expect(await payCashierHomeFees(1, 9, 2, "13.00", "2026-08-25")).toBe(result);
  expect(api.post).toHaveBeenCalledWith(
    "/cashier/condominium/1/months/9/homes/2/payments",
    { expectedTotal: "13.00", paidDate: "2026-08-25" },
  );
});
