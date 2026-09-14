import { render, screen } from "@testing-library/react";
import FinancePeriod from "./FinancePeriod";
jest.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" }, t: (key, values) => values?.duration ? `${key}: ${values.duration}` : key }) }));
beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(new Date(2026, 8, 13)); });
afterEach(() => jest.useRealTimers());
test("fund duration runs from its start date to today", () => {
  render(<FinancePeriod startDate="2025-08-10" fund />);
  expect(screen.getByText("finance:period.activeFor: 1 year 1 month 3 days")).toBeInTheDocument();
});
test("completed repair duration stops at completeAt", () => {
  render(<FinancePeriod startDate="2024-02-28" completeAt="2024-03-01" />);
  expect(screen.getByText("finance:period.duration: 2 days")).toBeInTheDocument();
});
test("unfinished repair counts through today", () => {
  render(<FinancePeriod startDate="2026-09-13" completeAt={null} />);
  expect(screen.getByText("finance:period.duration: 0 days")).toBeInTheDocument();
  expect(screen.getByText(/finance:period.untilToday/)).toBeInTheDocument();
});
test("future dates show upcoming without a negative duration", () => {
  render(<FinancePeriod startDate="2026-09-14" fund />);
  expect(screen.getByText("finance:period.planned")).toBeInTheDocument();
});
