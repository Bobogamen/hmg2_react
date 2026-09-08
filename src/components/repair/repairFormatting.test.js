import { repairAmount } from "./repairFormatting";

test.each([
    [0, "€ 0.00"],
    ["33.34", "€ 33.34"],
    ["10.234", "€ 10.23"],
    ["10.235", "€ 10.24"],
    ["1.005", "€ 1.01"],
    ["2.675", "€ 2.68"],
    ["-10.235", "€ -10.24"],
    ["9.999", "€ 10.00"],
])("formats %s to cents using the third decimal digit", (value, expected) => {
    expect(repairAmount(value)).toBe(expected);
});
