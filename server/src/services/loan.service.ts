export function calculateLoan(principal: number, tenureDays: number) {
  const rate = 12; // fixed 12% p.a.
  const simpleInterest = (principal * rate * tenureDays) / (365 * 100);
  const totalRepayment = principal + simpleInterest;

  return {
    interestRate: rate,
    simpleInterest: parseFloat(simpleInterest.toFixed(2)),
    totalRepayment: parseFloat(totalRepayment.toFixed(2)),
  };
}