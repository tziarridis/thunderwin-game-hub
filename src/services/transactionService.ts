
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from "@/types";

interface OxaPayWallet {
  id: string;
  currency: string;
  address: string;
  status: string;
  balance: number;
}

// Function to create a new transaction
export const createTransaction = async (
  userId: string,
  userName: string,
  type: "deposit" | "withdraw" | "bet" | "win" | "bonus",
  amount: number,
  currency: string,
  status: "pending" | "completed" | "failed",
  method: string,
  gameId?: string
): Promise<Transaction> => {
  const transaction: Transaction = {
    id: uuidv4(),
    userId: userId,
    userName: userName,
    type: type,
    amount: amount,
    currency: currency,
    status: status,
    method: method,
    date: new Date().toISOString(),
    gameId: gameId,
  };

  // Save the transaction to the database (or localStorage)
  saveTransaction(transaction);

  return transaction;
};

// Function to save a transaction to localStorage
const saveTransaction = (transaction: Transaction): void => {
  let transactions = JSON.parse(localStorage.getItem("transactions") || "[]") as Transaction[];
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

// Function to get all transactions from localStorage
export const getTransactions = (): Transaction[] => {
  return JSON.parse(localStorage.getItem("transactions") || "[]");
};

// Function to get a single transaction by ID from localStorage
export const getTransactionById = (id: string): Transaction | undefined => {
  const transactions = getTransactions();
  return transactions.find((transaction) => transaction.id === id);
};

// Function to get all transactions for a user from localStorage
export const getTransactionsByUserId = (userId: string): Transaction[] => {
  const transactions = getTransactions();
  return transactions.filter((transaction) => transaction.userId === userId);
};

// Function to update a transaction in localStorage
export const updateTransaction = (id: string, updates: Partial<Transaction>): Transaction | undefined => {
  let transactions = getTransactions();
  const transactionIndex = transactions.findIndex((transaction) => transaction.id === id);

  if (transactionIndex === -1) {
    return undefined;
  }

  transactions[transactionIndex] = { ...transactions[transactionIndex], ...updates };
  localStorage.setItem("transactions", JSON.stringify(transactions));
  return transactions[transactionIndex];
};

// Function to delete a transaction from localStorage
export const deleteTransaction = (id: string): void => {
  let transactions = getTransactions();
  transactions = transactions.filter((transaction) => transaction.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

// Simulate OxaPay wallet operations
export const createWallet = async (currency: string, address: string): Promise<OxaPayWallet> => {
  const wallet: OxaPayWallet = {
    id: `wallet-${Date.now()}`, 
    currency: currency,
    address: address,
    status: "active",
    balance: 0
  };
  
  let wallets = JSON.parse(localStorage.getItem("wallets") || "[]") as OxaPayWallet[];
  wallets.push(wallet);
  localStorage.setItem("wallets", JSON.stringify(wallets));

  return wallet;
};

export const getWalletByCurrency = async (currency: string): Promise<OxaPayWallet | undefined> => {
    const wallets = JSON.parse(localStorage.getItem("wallets") || "[]") as OxaPayWallet[];
    return wallets.find((wallet: OxaPayWallet) => wallet.currency === currency);
};

export const updateWalletBalance = async (currency: string, amount: number): Promise<OxaPayWallet | undefined> => {
    let wallets = JSON.parse(localStorage.getItem("wallets") || "[]") as OxaPayWallet[];
    const walletIndex = wallets.findIndex((wallet: OxaPayWallet) => wallet.currency === currency);

    if (walletIndex === -1) {
        return undefined;
    }

    wallets[walletIndex].balance += amount;
    localStorage.setItem("wallets", JSON.stringify(wallets));
    return wallets[walletIndex];
};
