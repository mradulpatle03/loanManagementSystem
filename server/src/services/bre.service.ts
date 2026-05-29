interface BREInput {
  dateOfBirth: Date;
  monthlySalary: number;
  pan: string;
  employmentMode: string;
}

interface BREResult {
  passed: boolean;
  reason?: string;
}

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function runBRE(input: BREInput): BREResult {
  const age = calculateAge(new Date(input.dateOfBirth));

  if (age < 23 || age > 50)
    return { passed: false, reason: `Age must be between 23 and 50. Yours: ${age}` };

  if (input.monthlySalary < 25000)
    return { passed: false, reason: `Monthly salary must be ≥ ₹25,000. Yours: ₹${input.monthlySalary}` };

  if (!PAN_REGEX.test(input.pan))
    return { passed: false, reason: 'Invalid PAN format. Expected format: ABCDE1234F' };

  if (input.employmentMode === 'unemployed')
    return { passed: false, reason: 'Unemployed applicants are not eligible' };

  return { passed: true };
}