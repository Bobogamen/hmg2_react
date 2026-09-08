const amountFormatter = new Intl.NumberFormat("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
});

export const repairAmountValue = (value) => amountFormatter.format(Number(value || 0));
export const repairAmount = (value) => `€ ${repairAmountValue(value)}`;
