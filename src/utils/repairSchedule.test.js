import { repairSchedule } from "./repairSchedule";

const input = { budget: "100", homeIds: [3, 1, 2], distributionType: "EQUAL", homePercentages: {}, installments: 3 };

test("allocates every cent across homes and installments deterministically", () => {
    const schedule = repairSchedule(input);
    expect(schedule.map((share) => share.total)).toEqual([33.34, 33.33, 33.33]);
    expect(schedule[0].payments).toEqual([11.12, 11.11, 11.11]);
    expect(schedule.flatMap((share) => share.payments).reduce((sum, amount) => sum + Math.round(amount * 100), 0)).toBe(10000);
});

test("uses each home's percentage and handles a full 100 percent share", () => {
    expect(repairSchedule({ ...input, homeIds: [1, 2], distributionType: "PERCENTAGE", homePercentages: { 1: "25", 2: "75" }, installments: 2 })
        .map((share) => share.payments)).toEqual([[12.5, 12.5], [37.5, 37.5]]);
    expect(repairSchedule({ ...input, homeIds: [1], distributionType: "PERCENTAGE", homePercentages: { 1: "100" }, installments: 1 })[0].total).toBe(100);
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
