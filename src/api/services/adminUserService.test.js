import api from "../axios";
import { getAdminUsers } from "./adminUserService";

jest.mock("../axios", () => ({
  get: jest.fn(),
  put: jest.fn()
}));

test("normalizes Spring Data VIA_DTO pagination metadata", async () => {
  api.get.mockResolvedValue({
    data: {
      content: [{ id: 7 }],
      page: { size: 20, number: 1, totalElements: 42, totalPages: 3 }
    }
  });

  await expect(getAdminUsers({ page: 1 })).resolves.toEqual({
    content: [{ id: 7 }],
    size: 20,
    number: 1,
    totalElements: 42,
    totalPages: 3
  });
});
