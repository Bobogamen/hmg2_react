export const repairAmount = (value) => `€ ${Math.ceil(Number(value || 0)).toFixed(0)}`;
