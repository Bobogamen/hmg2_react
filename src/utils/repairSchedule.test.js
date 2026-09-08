import { repairSchedule } from "./repairSchedule";

const input = { budget: "100", homeIds: [3, 1, 2], distributionType: "EQUAL", homePercentages: {}, installments: 3 };

test("rounds all equal installments up to whole euros and includes the rounding in home totals", () => {
    const schedule = repairSchedule(input);
    expect(schedule.map((share) => share.total)).toEqual([36, 36, 36]);
    expect(schedule.every((share) => share.payments.every((payment) => payment === 12))).toBe(true);
    expect(schedule.flatMap((share) => share.payments).reduce((sum, amount) => sum + amount, 0)).toBe(108);
});

test("uses each home's percentage and handles a full 100 percent share", () => {
    expect(repairSchedule({ ...input, homeIds: [1, 2], distributionType: "PERCENTAGE", homePercentages: { 1: "25", 2: "75" }, installments: 2 })
        .map((share) => share.payments)).toEqual([[13, 13], [38, 38]]);
    expect(repairSchedule({ ...input, homeIds: [1], distributionType: "PERCENTAGE", homePercentages: { 1: "100" }, installments: 1 })[0].total).toBe(100);
});

test("rounds exact shares directly without losing tiny amounts or increasing exact whole installments", () => {
    expect(repairSchedule({ ...input, budget: "90" }).map((share) => share.payments)).toEqual([[10, 10, 10], [10, 10, 10], [10, 10, 10]]);
    expect(repairSchedule({ ...input, budget: "0.02" }).map((share) => share.payments)).toEqual([[1, 1, 1], [1, 1, 1], [1, 1, 1]]);
    expect(repairSchedule({ ...input, budget: "6.01", homeIds: [1, 2] }).map((share) => share.payments)).toEqual([[2, 2, 2], [2, 2, 2]]);
    expect(repairSchedule({ ...input, homeIds: [1, 2], distributionType: "PERCENTAGE", homePercentages: { 1: "0", 2: "100" }, installments: 2 })
        .map((share) => share.payments)).toEqual([[0, 0], [50, 50]]);
});

test.each([
    { installments: "2.5" }, { installments: 61 }, { installments: "" },
    { homeIds: [] }, { budget: "1.001" },
    { distributionType: "PERCENTAGE", homePercentages: { 1: "NaN", 2: 50, 3: 50 } },
    { distributionType: "PERCENTAGE", homePercentages: { 1: 30, 2: 30, 3: 30 } },
])("does not preview invalid schedules: %j", (overrides) => {
    expect(repairSchedule({ ...input, ...overrides })).toEqual([]);
});

test("uses the configured installment limit and allows its boundary", () => {
    expect(repairSchedule({ ...input, installments: 60 })[0].payments).toHaveLength(60);
    expect(repairSchedule({ ...input, installmentsLimit: 12, installments: 13 })).toEqual([]);
    expect(repairSchedule({ ...input, installmentsLimit: 12, installments: 12 })[0].payments).toHaveLength(12);
});
