export const RULES = {
  tokensPerDenar: 2,
  vouchers: [
    { value: 300, tokens: 600 },
    { value: 500, tokens: 1_000 },
    { value: 1_000, tokens: 2_000 },
  ],
  voucherValidityMonths: 3,
  lessonXp: 25,
  premiumLessonXp: 50,
  energyCap: 25,
  premiumEnergyCap: 50,
  adEnergy: 5,
  adCooldownSeconds: 60,
  premiumPrice: 300,
  municipalPrice: 800,
  corporatePrice: 1_800,
  regularActionReward: 100,
  terraPulseActionReward: 200,
  maxOrganiserReward: 100,
  chestWeights: [60, 25, 10, 5] as const,
};

export const formatDenar = (value: number) => `${value.toLocaleString('de-DE')} ден.`;
export const formatTokens = (value: number) => value.toLocaleString('de-DE');

