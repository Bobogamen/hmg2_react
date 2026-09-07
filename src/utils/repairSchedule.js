/* global BigInt */
// Work in whole cents so the preview matches the saved payment schedule.
export const repairSchedule = ({ budget, homeIds, distributionType, homePercentages, installments, installmentsLimit = 60 }) => {
    const count = Number(installments);
    const amount = String(budget);
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0 ||
        !Number.isInteger(count) || count < 1 || count > installmentsLimit || !homeIds.length) return [];
    const cents = BigInt(amount.split(".")[0]) * 100n + BigInt((amount.split(".")[1] || "").padEnd(2, "0"));
    const ids = [...homeIds].sort((a, b) => a - b);
    const equal = distributionType === "EQUAL";
    if (!equal && distributionType !== "PERCENTAGE") return [];
    const weights = ids.map((id) => {
        const value = String(homePercentages[id] ?? "");
        if (!/^\d+(\.\d{1,4})?$/.test(value) || Number(value) > 100) return null;
        return BigInt(value.split(".")[0]) * 10000n + BigInt((value.split(".")[1] || "").padEnd(4, "0"));
    });
    if (!equal && (weights.includes(null) || weights.reduce((sum, weight) => sum + weight, 0n) !== 1000000n)) return [];
    const divisor = equal ? BigInt(ids.length) : 1000000n;
    const shares = ids.map((homeId, index) => {
        const numerator = cents * (equal ? 1n : weights[index]);
        return { homeId, cents: numerator / divisor, remainder: numerator % divisor };
    });
    const remainder = Number(cents - shares.reduce((sum, share) => sum + share.cents, 0n));
    [...shares].sort((a, b) => Number(b.remainder - a.remainder) || a.homeId - b.homeId)
        .slice(0, remainder).forEach((share) => { share.cents += 1n; });
    return shares.map((share) => ({
        homeId: share.homeId,
        total: Number(share.cents) / 100,
        payments: Array.from({ length: count }, (_, index) =>
            Number(share.cents / BigInt(count) + (BigInt(index) < share.cents % BigInt(count) ? 1n : 0n)) / 100),
    }));
};
