
// When creating new Bonus objects, ensure all properties match the Bonus type:
const bonus = {
  id: `bonus-${Math.random().toString(36).substring(2, 11)}`,
  userId: currentUser?.id || "",
  type: "deposit" as BonusType,
  amount: 50,
  status: "active" as const,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  name: "Welcome Bonus",
  description: "Get started with a special welcome bonus just for you!", // This field is now valid
  isCompleted: false,
  progress: 0,
  wagering: 35,
  templateId: "template1"
};
