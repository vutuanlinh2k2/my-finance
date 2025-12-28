export type TransactionType = 'expense' | 'income'

export interface Transaction {
  id: string
  title: string
  amount: number
  date: string // ISO date string YYYY-MM-DD
  type: TransactionType
  tagId: string | null
  createdAt: string
}

const TRANSACTIONS_STORAGE_KEY = 'my-finance-transactions'

export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions))
}

export function addTransaction(
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Transaction {
  const newTransaction: Transaction = {
    ...transaction,
    id: generateTransactionId(),
    createdAt: new Date().toISOString(),
  }
  const transactions = getTransactions()
  transactions.push(newTransaction)
  saveTransactions(transactions)
  return newTransaction
}

export function updateTransaction(
  id: string,
  updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>
): Transaction | null {
  const transactions = getTransactions()
  const index = transactions.findIndex((t) => t.id === id)
  if (index === -1) return null

  transactions[index] = { ...transactions[index], ...updates }
  saveTransactions(transactions)
  return transactions[index]
}

export function deleteTransaction(id: string): boolean {
  const transactions = getTransactions()
  const filtered = transactions.filter((t) => t.id !== id)
  if (filtered.length === transactions.length) return false

  saveTransactions(filtered)
  return true
}

export function getTransactionsByDate(date: string): Transaction[] {
  return getTransactions().filter((t) => t.date === date)
}

export function getTransactionsByMonth(year: number, month: number): Transaction[] {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`

  return getTransactions().filter((t) => t.date >= startDate && t.date <= endDate)
}

export function getMonthlyTotals(year: number, month: number): {
  totalIncome: number
  totalExpenses: number
  balance: number
} {
  const transactions = getTransactionsByMonth(year, month)

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  }
}

export function getDailyTotals(
  year: number,
  month: number
): Map<number, { income: number; expense: number }> {
  const transactions = getTransactionsByMonth(year, month)
  const dailyTotals = new Map<number, { income: number; expense: number }>()

  for (const t of transactions) {
    const day = parseInt(t.date.split('-')[2], 10)
    const current = dailyTotals.get(day) || { income: 0, expense: 0 }

    if (t.type === 'income') {
      current.income += t.amount
    } else {
      current.expense += t.amount
    }

    dailyTotals.set(day, current)
  }

  return dailyTotals
}

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function generateTransactionId(): string {
  return `txn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
