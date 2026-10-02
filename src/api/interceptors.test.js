import { setupInterceptors } from "./interceptors";
import { toast } from "react-toastify";
jest.mock("react-toastify", () => ({ toast: { error: jest.fn() }, Bounce: jest.fn() }));
jest.mock("../locales/i18n", () => ({ t: key => key }));
test("cancelled requests do not display server-unavailable notifications", async () => {
  const use = jest.fn();
  setupInterceptors({ interceptors: { response: { use } } }, jest.fn());
  const failure = { code: "ERR_CANCELED" };
  await expect(use.mock.calls[0][1](failure)).rejects.toBe(failure);
  expect(toast.error).not.toHaveBeenCalled();
});
