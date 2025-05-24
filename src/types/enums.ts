
// Enums that can be used as values (not export type)
export enum BonusType {
  WELCOME = "welcome",
  DEPOSIT = "deposit", 
  RELOAD = "reload",
  CASHBACK = "cashback",
  FREE_SPINS = "free_spins",
  VIP = "vip",
  REFERRAL = "referral"
}

export enum BonusStatus {
  ACTIVE = "active",
  USED = "used", 
  EXPIRED = "expired",
  PENDING = "pending"
}

export enum PromotionType {
  DEPOSIT_BONUS = "deposit_bonus",
  FREE_SPINS = "free_spins",
  CASHBACK = "cashback",
  WELCOME_BONUS = "welcome_bonus",
  RELOAD_BONUS = "reload_bonus"
}

export enum PromotionStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  EXPIRED = "expired"
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed", 
  FAILED = "failed",
  CANCELLED = "cancelled"
}

export enum GameStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance"
}
