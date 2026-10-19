
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  ChartNoAxesCombined,
  Settings,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Utensils,
  Car,
  ShoppingBag,
  House,
  Zap,
  Menu,
  X,
  LogOut,
  Trash2,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { supabase } from './lib/supabase'

type TransactionType = 'income' | 'expense'

type Transaction = {
  id: string
  title: string
  category: string
  date: string
  amount: number
  type: TransactionType
}

type Budget = {
  id: string
  category: string
  amount: number
  month: string
}

const categories = [
  { label: 'Food & Dining', icon: Utensils },
  { label: 'Transport', icon: Car },
  { label: 'Shopping', icon: ShoppingBag },
  { label: 'Housing', icon: House },
  { label: 'Utilities', icon: Zap },
  { label: 'Other', icon: Wallet },
]

const money = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

function getIcon(category: string, type: TransactionType) {
  if (type === 'income') return ArrowUpRight
  return categories.find(item => item.label === category)?.icon ?? Wallet
}

function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [budgetLoading, setBudgetLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [active, setActive] = useState('Overview')
  const [query, setQuery] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [category, setCategory] = useState('Food & Dining')
  const [budgetCategory, setBudgetCategory] = useState('Food & Dining')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [analyticsMonth, setAnalyticsMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      setError('')

      try {
        const [transactionResult, budgetResult] = await Promise.all([
          supabase
            .from('transactions')
            .select('id, title, category, type, amount, transaction_date')
            .order('transaction_date', { ascending: false })
            .order('created_at', { ascending: false }),

          supabase
            .from('budgets')
            .select('id, category, amount, month')
            .eq('month', currentMonth())
            .order('category'),
        ])

        if (transactionResult.error) throw transactionResult.error
        if (budgetResult.error) throw budgetResult.error

        if (!cancelled) {
          setTransactions(
            (transactionResult.data ?? []).map(row => ({
              id: row.id,
              title: row.title,
              category: row.category,
              date: row.transaction_date,
              amount: Number(row.amount),
              type: row.type as TransactionType,
            })),
          )

          setBudgets(
            (budgetResult.data ?? []).map(row => ({
              id: row.id,
              category: row.category,
              amount: Number(row.amount),
              month: row.month,
            })),
          )
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load your data.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadData()

    return () => {
      cancelled = true
    }
  }, [])

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const thisMonth = new Date().toISOString().slice(0, 7)

  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(thisMonth))
    .reduce((sum, t) => sum + t.amount, 0)

  const filtered = transactions.filter(t =>
    `${t.title} ${t.category} ${t.type}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )

  const chartData = Array.from({ length: 7 }, (_, index) => {
    const day = new Date()
    day.setDate(day.getDate() - (6 - index))

    const date = [
      day.getFullYear(),
      String(day.getMonth() + 1).padStart(2, '0'),
      String(day.getDate()).padStart(2, '0'),
    ].join('-')

    const rows = transactions.filter(t => t.date === date)

    return {
      day: day.toLocaleDateString('en-IN', { weekday: 'short' }),
      income: rows.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expenses: rows.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  })

  const categoryTotals = categories
    .map(item => ({
      ...item,
      amount: transactions
        .filter(t => t.type === 'expense' && t.category === item.label && t.date.startsWith(thisMonth))
        .reduce((sum, t) => sum + t.amount, 0),
    }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const analyticsTransactions = transactions.filter(
    t => t.date.startsWith(analyticsMonth),
  )

  const analyticsIncome = analyticsTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const analyticsExpenses = analyticsTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const analyticsSavings = analyticsIncome - analyticsExpenses

  const analyticsSavingsRate = analyticsIncome > 0
    ? (analyticsSavings / analyticsIncome) * 100
    : null

  const analyticsExpenseTransactions = analyticsTransactions.filter(
    t => t.type === 'expense',
  )

  const analyticsAverageExpense = analyticsExpenseTransactions.length > 0
    ? analyticsExpenses / analyticsExpenseTransactions.length
    : 0

  const analyticsCategories = Array.from(
    analyticsExpenseTransactions.reduce((map, transaction) => {
      map.set(
        transaction.category,
        (map.get(transaction.category) ?? 0) + transaction.amount,
      )
      return map
    }, new Map<string, number>()),
  )
    .map(([name, value]) => ({
      name,
      value,
      percentage: analyticsExpenses > 0 ? (value / analyticsExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)

  const monthDate = new Date(`${analyticsMonth}-15T12:00:00`)
  const validAnalyticsMonth = !Number.isNaN(monthDate.getTime())

  const previousMonthDate = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() - 1,
    15,
  )

  const previousMonth = [
    previousMonthDate.getFullYear(),
    String(previousMonthDate.getMonth() + 1).padStart(2, '0'),
  ].join('-')

  const previousMonthTransactions = transactions.filter(
    t => t.date.startsWith(previousMonth),
  )

  const previousMonthExpenses = previousMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenseChange = previousMonthExpenses > 0
    ? ((analyticsExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
    : null

  const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() - 5 + index,
      15,
    )
    const monthKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
    ].join('-')
    const rows = transactions.filter(t => t.date.startsWith(monthKey))

    return {
      month: date.toLocaleDateString('en-IN', { month: 'short' }),
      income: rows.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      expenses: rows.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    }
  })

  const analyticsBudgets = budgets.filter(b => b.month.startsWith(analyticsMonth))

  const budgetInsights = analyticsBudgets.flatMap(budget => {
    const spent = analyticsExpenseTransactions
      .filter(t => t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0)
    const percentage = (spent / budget.amount) * 100

    if (percentage >= 100) {
      return [{
        title: `${budget.category} budget exceeded`,
        detail: `${money(spent)} spent against ${money(budget.amount)} budget.`,
        tone: 'warning' as const,
      }]
    }
    if (percentage >= 80) {
      return [{
        title: `${budget.category} budget nearly used`,
        detail: `${Math.round(percentage)}% of the monthly limit has been used.`,
        tone: 'warning' as const,
      }]
    }
    return []
  })

  const financialInsights = [
    ...(analyticsIncome > 0
      ? [{
          title: analyticsSavings >= 0 ? 'Positive cash flow' : 'Spending exceeds income',
          detail: analyticsSavings >= 0
            ? `You have ${money(analyticsSavings)} remaining after recorded expenses.`
            : `Recorded expenses exceed income by ${money(Math.abs(analyticsSavings))}.`,
          tone: analyticsSavings >= 0 ? 'positive' as const : 'warning' as const,
        }]
      : []),
    ...(expenseChange !== null
      ? [{
          title: expenseChange > 0 ? 'Expenses increased' : expenseChange < 0 ? 'Expenses decreased' : 'Expenses unchanged',
          detail: expenseChange === 0
            ? 'Recorded expenses are unchanged from the previous month.'
            : `Expenses are ${Math.abs(Math.round(expenseChange))}% ${expenseChange > 0 ? 'higher' : 'lower'} than the previous month.`,
          tone: expenseChange > 0 ? 'warning' as const : 'positive' as const,
        }]
      : []),
    ...budgetInsights,
  ].slice(0, 5)

  const chartColors = ['#34d399', '#a78bfa', '#60a5fa', '#fbbf24', '#f87171', '#2dd4bf']

  async function addTransaction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const value = Number(amount)
    const cleanTitle = title.trim()

    if (!cleanTitle || cleanTitle.length > 120 || !Number.isFinite(value) || value <= 0) {
      setError('Enter a description and a valid positive amount.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!userData.user) throw new Error('Please sign in again.')

      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: userData.user.id,
          title: cleanTitle,
          category: type === 'income' ? 'Income' : category,
          type,
          amount: value,
          transaction_date: new Date().toLocaleDateString('en-CA'),
        })
        .select('id, title, category, type, amount, transaction_date')
        .single()

      if (insertError) throw insertError

      setTransactions(previous => [{
        id: data.id,
        title: data.title,
        category: data.category,
        date: data.transaction_date,
        amount: Number(data.amount),
        type: data.type as TransactionType,
      }, ...previous])

      setTitle('')
      setAmount('')
      setType('expense')
      setCategory('Food & Dining')
      setShowTransactionForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save transaction.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteTransaction(id: string) {
    if (!window.confirm('Delete this transaction permanently?')) return

    setError('')

    try {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setTransactions(previous => previous.filter(t => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete transaction.')
    }
  }

  async function saveBudget(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const value = Number(budgetAmount)

    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter a valid positive budget amount.')
      return
    }

    setBudgetLoading(true)
    setError('')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!userData.user) throw new Error('Please sign in again.')

      const { data, error: upsertError } = await supabase
        .from('budgets')
        .upsert({
          user_id: userData.user.id,
          category: budgetCategory,
          amount: value,
          month: currentMonth(),
        }, {
          onConflict: 'user_id,category,month',
        })
        .select('id, category, amount, month')
        .single()

      if (upsertError) throw upsertError

      setBudgets(previous => [
        ...previous.filter(b => b.id !== data.id && !(b.category === data.category && b.month === data.month)),
        {
          id: data.id,
          category: data.category,
          amount: Number(data.amount),
          month: data.month,
        },
      ])

      setBudgetAmount('')
      setShowBudgetForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save budget.')
    } finally {
      setBudgetLoading(false)
    }
  }

  async function deleteBudget(id: string) {
    if (!window.confirm('Delete this monthly budget?')) return

    setError('')

    try {
      const { error: deleteError } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setBudgets(previous => previous.filter(b => b.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete budget.')
    }
  }

  const nav = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Transactions', icon: ArrowLeftRight },
    { label: 'Budgets', icon: Wallet },
    { label: 'Analytics', icon: ChartNoAxesCombined },
    { label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {mobileMenu && (
        <button aria-label="Close navigation overlay" onClick={() => setMobileMenu(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/[0.07] bg-[#0d0d10] p-5 transition-transform lg:translate-x-0 ${mobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-12 flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-black"><IndianRupee size={23} /></div>
          <div>
            <h1 className="text-lg font-bold">PaisaFlow</h1>
            <p className="text-xs text-zinc-500">Personal finance</p>
          </div>
        </div>

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Workspace</p>
        <nav className="space-y-1">
          {nav.map(({ label, icon: Icon }) => (
            <button key={label} onClick={() => { setActive(label); setMobileMenu(false) }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${active === label ? 'bg-emerald-400/10 text-emerald-300' : 'text-zinc-500 hover:bg-white/[0.04] hover:text-white'}`}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
          <p className="mb-2 text-xs text-zinc-400">This month's expenses</p>
          <p className="text-xl font-semibold">{money(monthlyExpenses)}</p>
          <p className="mt-2 text-xs text-zinc-500">{transactions.length} saved transactions</p>
        </div>
        <p className="mt-5 text-center text-[10px] text-zinc-700">PAISAFLOW · PERSONAL FINANCE</p>
      </aside>

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[0.07] bg-[#09090b]/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button aria-label="Open navigation" onClick={() => setMobileMenu(true)} className="text-zinc-400 lg:hidden"><Menu /></button>
            <div>
              <p className="text-xs text-zinc-500">Your finances at a glance</p>
              <h2 className="mt-1 text-sm font-semibold">{active}</h2>
            </div>
          </div>
          <span className="hidden text-xs text-zinc-500 sm:block">Supabase connected</span>
        </header>

        <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
          {error && (
            <div role="alert" className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
              <span>{error}</span>
              <button aria-label="Dismiss error" onClick={() => setError('')}><X size={16} /></button>
            </div>
          )}

          {active === 'Overview' && (
            <>
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-2 text-sm text-zinc-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <h2 className="text-2xl font-semibold sm:text-3xl">Financial overview<span className="text-emerald-400">.</span></h2>
                  <p className="mt-2 text-sm text-zinc-500">Your saved income and expenses.</p>
                </div>
                <button onClick={() => setShowTransactionForm(true)} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"><Plus size={17} /> Add transaction</button>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Net recorded balance', value: income - expenses, icon: Wallet },
                  { label: 'Total income', value: income, icon: ArrowDownRight },
                  { label: 'Total expenses', value: expenses, icon: ArrowUpRight },
                  { label: 'This month spent', value: monthlyExpenses, icon: ChartNoAxesCombined },
                ].map(card => (
                  <div key={card.label} className="rounded-2xl border border-white/[0.07] bg-[#111114] p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-sm text-zinc-400">{card.label}</span>
                      <span className="rounded-xl bg-white/[0.05] p-2 text-emerald-300"><card.icon size={18} /></span>
                    </div>
                    <p className="break-words text-2xl font-semibold">{loading ? 'Loading…' : money(card.value)}</p>
                    <p className="mt-2 text-xs text-zinc-500">Calculated from saved records</p>
                  </div>
                ))}
              </div>

              <div className="mb-6 grid gap-6 xl:grid-cols-[1.65fr_1fr]">
                <section className="rounded-2xl border border-white/[0.07] bg-[#111114] p-5 sm:p-6">
                  <h3 className="font-semibold">Cash flow · Last 7 days</h3>
                  <div className="my-5 flex gap-5 text-xs text-zinc-400"><span>● Income</span><span>● Expenses</span></div>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={0.2} /><stop offset="95%" stopColor="#34d399" stopOpacity={0} /></linearGradient>
                          <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity={0.2} /><stop offset="95%" stopColor="#a78bfa" stopOpacity={0} /></linearGradient>
                        </defs>
                        <CartesianGrid stroke="#27272a" strokeDasharray="4 4" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={55} tickFormatter={v => `₹${v}`} />
                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12, fontSize: 12 }} formatter={(v) => money(Number(v))} />
                        <Area type="monotone" dataKey="income" name="Income" stroke="#34d399" fill="url(#incomeFill)" strokeWidth={2} />
                        <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#a78bfa" fill="url(#expenseFill)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="rounded-2xl border border-white/[0.07] bg-[#111114] p-5 sm:p-6">
                  <h3 className="font-semibold">Monthly spending</h3>
                  <p className="mb-6 mt-1 text-xs text-zinc-500">Expenses grouped by category</p>
                  {categoryTotals.length === 0 ? <p className="py-8 text-sm text-zinc-500">No expenses recorded this month.</p> : categoryTotals.map(item => (
                    <div key={item.label} className="mb-6 last:mb-0">
                      <div className="mb-2 flex justify-between gap-2 text-sm"><span>{item.label}</span><span>{money(item.amount)}</span></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${(item.amount / Math.max(...categoryTotals.map(c => c.amount), 1)) * 100}%` }} /></div>
                    </div>
                  ))}
                </section>
              </div>
            </>
          )}

          {active === 'Transactions' && (
            <section className="rounded-2xl border border-white/[0.07] bg-[#111114]">
              <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center">
                <div><h2 className="font-semibold">Transactions</h2><p className="mt-1 text-xs text-zinc-500">{transactions.length} saved records</p></div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search transactions..." className="w-full rounded-xl border border-white/10 bg-[#19191d] py-2.5 pl-9 pr-3 text-sm outline-none sm:w-64" /></div>
                  <button onClick={() => setShowTransactionForm(true)} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black"><Plus size={15} className="mr-1 inline" /> Add</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[580px] text-left text-sm">
                  <thead><tr className="border-b border-white/[0.06] text-xs text-zinc-500"><th className="px-6 py-4">Transaction</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Category</th><th className="px-6 py-4 text-right">Amount</th><th className="px-4 py-4" /></tr></thead>
                  <tbody>
                    {filtered.map(t => {
                      const Icon = getIcon(t.category, t.type)
                      return <tr key={t.id} className="border-b border-white/[0.04] last:border-0">
                        <td className="px-6 py-4"><span className="flex items-center gap-3"><span className="rounded-xl bg-white/[0.05] p-2"><Icon size={17} /></span>{t.title}</span></td>
                        <td className="px-6 py-4 text-xs text-zinc-500">{t.date}</td>
                        <td className="px-6 py-4 text-zinc-400">{t.category}</td>
                        <td className={`px-6 py-4 text-right font-medium ${t.type === 'income' ? 'text-emerald-300' : ''}`}>{t.type === 'income' ? '+' : '−'}{money(t.amount)}</td>
                        <td className="px-4 py-4"><button title="Delete transaction" aria-label={`Delete ${t.title}`} onClick={() => void deleteTransaction(t.id)} className="rounded-lg p-2 text-zinc-600 hover:text-red-400"><Trash2 size={16} /></button></td>
                      </tr>
                    })}
                    {!loading && filtered.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">{query ? 'No matching transactions.' : 'No transactions yet. Add your first transaction.'}</td></tr>}
                    {loading && <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">Loading transactions…</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {active === 'Budgets' && (
            <section className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><h2 className="text-2xl font-semibold">Monthly budgets</h2><p className="mt-2 text-sm text-zinc-500">Track category limits for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}.</p></div>
                <button onClick={() => setShowBudgetForm(true)} className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black"><Plus size={16} className="mr-1 inline" /> Set budget</button>
              </div>
              {budgetLoading && <p className="text-sm text-zinc-400">Saving budget…</p>}
              {budgets.length === 0 && !loading && <div className="rounded-2xl border border-white/10 bg-[#111114] p-8 text-center text-sm text-zinc-500">No budgets yet. Create a category budget to get started.</div>}
              <div className="grid gap-4 md:grid-cols-2">
                {budgets.map(budget => {
                  const spent = transactions.filter(t => t.type === 'expense' && t.category === budget.category && t.date.startsWith(budget.month.slice(0, 7))).reduce((sum, t) => sum + t.amount, 0)
                  const percent = (spent / budget.amount) * 100
                  return <div key={budget.id} className="rounded-2xl border border-white/10 bg-[#111114] p-5">
                    <div className="mb-4 flex justify-between gap-3"><h3 className="font-medium">{budget.category}</h3><button aria-label={`Delete ${budget.category} budget`} onClick={() => void deleteBudget(budget.id)} className="text-zinc-500 hover:text-red-400"><Trash2 size={16} /></button></div>
                    <div className="mb-3 h-2 overflow-hidden rounded-full bg-zinc-800"><div className={`h-full rounded-full ${percent > 100 ? 'bg-red-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(percent, 100)}%` }} /></div>
                    <p className="text-sm">{money(spent)} <span className="text-zinc-500">spent of {money(budget.amount)}</span></p>
                    <p className={`mt-2 text-xs ${percent > 100 ? 'text-red-300' : 'text-zinc-500'}`}>{percent > 100 ? `Over budget by ${money(spent - budget.amount)}` : `${Math.round(percent)}% used`}</p>
                  </div>
                })}
              </div>
            </section>
          )}

          {active === 'Analytics' && (
            <section className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-2xl font-semibold">Financial analytics<span className="text-emerald-400">.</span></h2>
                  <p className="mt-2 text-sm text-zinc-500">Explore monthly cash flow, spending categories, and financial patterns.</p>
                </div>
                <label className="text-sm text-zinc-400">
                  Select month
                  <input
                    type="month"
                    value={analyticsMonth}
                    onChange={e => { if (e.target.value) setAnalyticsMonth(e.target.value) }}
                    className="mt-2 block rounded-xl border border-white/10 bg-[#19191d] px-3 py-2 text-white"
                  />
                </label>
              </div>

              {loading ? (
                <p className="rounded-2xl border border-white/[0.07] bg-[#111114] p-6 text-sm text-zinc-400">Loading analytics…</p>
              ) : !validAnalyticsMonth ? (
                <p className="rounded-2xl border border-white/[0.07] bg-[#111114] p-6 text-sm text-zinc-400">Choose a valid month to view analytics.</p>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: 'Income', value: analyticsIncome },
                      { label: 'Expenses', value: analyticsExpenses },
                      { label: 'Net cash flow', value: analyticsSavings },
                      { label: 'Average expense', value: analyticsAverageExpense },
                    ].map(card => (
                      <div key={card.label} className="rounded-2xl border border-white/[0.07] bg-[#111114] p-5">
                        <p className="text-sm text-zinc-400">{card.label}</p>
                        <p className="mt-3 break-words text-xl font-semibold">{money(card.value)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                    <section className="rounded-2xl border border-white/[0.07] bg-[#111114] p-5">
                      <h3 className="font-semibold">Six-month cash flow</h3>
                      <p className="mt-1 text-xs text-zinc-500">Income compared with expenses</p>
                      <div className="mt-5 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyTrend}>
                            <CartesianGrid stroke="#27272a" strokeDasharray="4 4" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} width={65} tickFormatter={value => value >= 1000 ? `₹${(value / 1000).toFixed(0)}k` : `₹${value}`} />
                            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12 }} formatter={(value) => money(Number(value))} />
                            <Legend />
                            <Bar dataKey="income" name="Income" fill="#34d399" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" name="Expenses" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-white/[0.07] bg-[#111114] p-5">
                      <h3 className="font-semibold">Expense categories</h3>
                      <p className="mt-1 text-xs text-zinc-500">{monthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                      {analyticsCategories.length === 0 ? (
                        <p className="py-12 text-center text-sm text-zinc-500">No expenses recorded for this month.</p>
                      ) : (
                        <>
                          <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={analyticsCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3}>
                                  {analyticsCategories.map((item, index) => <Cell key={item.name} fill={chartColors[index % chartColors.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12 }} formatter={(value) => money(Number(value))} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-3">
                            {analyticsCategories.map((item, index) => (
                              <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                                <span className="flex min-w-0 items-center gap-2">
                                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                                  <span className="truncate">{item.name}</span>
                                </span>
                                <span className="shrink-0 text-right">{money(item.value)} <span className="ml-2 text-xs text-zinc-500">{item.percentage.toFixed(1)}%</span></span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </section>
                  </div>

                  <section className="rounded-2xl border border-white/[0.07] bg-[#111114] p-5">
                    <h3 className="font-semibold">Savings rate</h3>
                    <p className="mt-1 text-sm text-zinc-500">Net cash flow as a percentage of recorded income</p>
                    <p className="mt-4 text-3xl font-semibold">{analyticsSavingsRate === null ? '—' : `${analyticsSavingsRate.toFixed(1)}%`}</p>
                    {analyticsSavingsRate !== null && (
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div className={`h-full rounded-full ${analyticsSavingsRate >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`} style={{ width: `${Math.min(Math.abs(analyticsSavingsRate), 100)}%` }} />
                      </div>
                    )}
                    <p className="mt-3 text-xs text-zinc-500">This is a calculated ratio, not a forecast. A negative rate means recorded expenses exceed recorded income.</p>
                  </section>

                  <section className="rounded-2xl border border-white/[0.07] bg-[#111114] p-5">
                    <h3 className="font-semibold">Financial insights</h3>
                    <p className="mt-1 text-sm text-zinc-500">Observations based on your saved transactions and budgets.</p>
                    {financialInsights.length === 0 ? (
                      <p className="mt-5 text-sm text-zinc-500">Add income, expenses, or monthly budgets to generate insights. A month-over-month comparison requires previous-month expenses.</p>
                    ) : (
                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {financialInsights.map((insight, index) => (
                          <div key={`${insight.title}-${index}`} className={`rounded-xl border p-4 ${insight.tone === 'warning' ? 'border-amber-400/20 bg-amber-400/[0.06]' : 'border-emerald-400/20 bg-emerald-400/[0.05]'}`}>
                            <h4 className="text-sm font-medium">{insight.title}</h4>
                            <p className="mt-2 text-sm text-zinc-400">{insight.detail}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </section>
          )}

          {active === 'Settings' && (
            <section className="rounded-2xl border border-white/10 bg-[#111114] p-6">
              <h2 className="text-2xl font-semibold">Settings</h2>
              <p className="mt-2 text-sm text-zinc-500">PaisaFlow uses Indian Rupees (INR) and your authenticated Supabase account.</p>
              <div className="mt-6 rounded-xl bg-white/[0.03] p-4"><p className="text-sm">Currency</p><p className="mt-1 text-sm text-zinc-400">INR — Indian Rupee (₹)</p></div>
            </section>
          )}
        </div>
      </main>

      {showTransactionForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={addTransaction} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141417] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><h3 className="text-lg font-semibold">Add transaction</h3><button type="button" onClick={() => setShowTransactionForm(false)} aria-label="Close form"><X /></button></div>
            <label className="mb-2 block text-sm text-zinc-400">Type</label>
            <div className="mb-5 grid grid-cols-2 gap-2">{(['expense', 'income'] as const).map(value => <button key={value} type="button" onClick={() => setType(value)} className={`rounded-xl border p-3 text-sm capitalize ${type === value ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300' : 'border-white/10 text-zinc-400'}`}>{value}</button>)}</div>
            <label htmlFor="transaction-title" className="mb-2 block text-sm text-zinc-400">Description</label>
            <input id="transaction-title" required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Groceries" className="mb-5 w-full rounded-xl border border-white/10 bg-[#09090b] p-3 text-sm outline-none" />
            {type === 'expense' && <><label htmlFor="transaction-category" className="mb-2 block text-sm text-zinc-400">Category</label><select id="transaction-category" value={category} onChange={e => setCategory(e.target.value)} className="mb-5 w-full rounded-xl border border-white/10 bg-[#09090b] p-3 text-sm">{categories.map(item => <option key={item.label} value={item.label}>{item.label}</option>)}</select></>}
            <label htmlFor="transaction-amount" className="mb-2 block text-sm text-zinc-400">Amount (₹)</label>
            <input id="transaction-amount" required type="number" min="0.01" max="9999999999.99" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="mb-6 w-full rounded-xl border border-white/10 bg-[#09090b] p-3 text-sm outline-none" />
            <button type="submit" disabled={saving} className="w-full rounded-xl bg-emerald-400 p-3 font-semibold text-black disabled:opacity-50">{saving ? 'Saving…' : 'Save transaction'}</button>
          </form>
        </div>
      )}

      {showBudgetForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={saveBudget} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141417] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><h3 className="text-lg font-semibold">Set monthly budget</h3><button type="button" onClick={() => setShowBudgetForm(false)} aria-label="Close form"><X /></button></div>
            <label htmlFor="budget-category" className="mb-2 block text-sm text-zinc-400">Category</label>
            <select id="budget-category" value={budgetCategory} onChange={e => setBudgetCategory(e.target.value)} className="mb-5 w-full rounded-xl border border-white/10 bg-[#09090b] p-3 text-sm">{categories.map(item => <option key={item.label} value={item.label}>{item.label}</option>)}</select>
            <label htmlFor="budget-amount" className="mb-2 block text-sm text-zinc-400">Monthly limit (₹)</label>
            <input id="budget-amount" required type="number" min="0.01" max="9999999999.99" step="0.01" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} placeholder="5000" className="mb-6 w-full rounded-xl border border-white/10 bg-[#09090b] p-3 text-sm outline-none" />
            <button type="submit" disabled={budgetLoading} className="w-full rounded-xl bg-emerald-400 p-3 font-semibold text-black disabled:opacity-50">{budgetLoading ? 'Saving…' : 'Save budget'}</button>
          </form>
        </div>
      )}
    </div>
  )
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()
      if (!mounted) return
      if (error) setError(error.message)
      setSession(data.session)
      setCheckingSession(false)
    }

    void loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) setSession(newSession)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    try {
      const result = isSignup
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

      if (result.error) throw result.error

      if (isSignup && !result.data.session) {
        setMessage('Account created. Check your email to confirm it, then sign in.')
      } else if (isSignup) {
        setMessage('Account created successfully.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.')
    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) setError(error.message)
  }

  if (checkingSession) {
    return <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-zinc-300">Checking your session…</div>
  }

  if (session) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <div className="flex items-center justify-end gap-3 border-b border-white/10 px-5 py-3">
          {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
          <span className="max-w-[220px] truncate text-xs text-zinc-400">{session.user.email}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"><LogOut size={15} /> Sign out</button>
        </div>
        <Dashboard />
      </div>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-10 text-zinc-100">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111114] p-7 shadow-2xl sm:p-9">
        <div className="mb-8 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-black"><IndianRupee size={24} /></div><div><h1 className="text-xl font-bold">PaisaFlow</h1><p className="text-xs text-zinc-500">Personal finance tracker</p></div></div>
        <h2 className="text-2xl font-semibold">{isSignup ? 'Create your account' : 'Welcome back'}</h2>
        <p className="mt-2 text-sm text-zinc-500">{isSignup ? 'Start managing your money in one place.' : 'Sign in to access your finance dashboard.'}</p>

        <form onSubmit={handleAuth} className="mt-7 space-y-5">
          <div><label htmlFor="email" className="mb-2 block text-sm text-zinc-300">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3 outline-none focus:border-emerald-400/60" /></div>
          <div><label htmlFor="password" className="mb-2 block text-sm text-zinc-300">Password</label><input id="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={6} required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3 outline-none focus:border-emerald-400/60" /></div>
          {error && <p role="alert" className="rounded-xl bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}
          {message && <p role="status" className="rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-300">{message}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-50">{busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}</button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">{isSignup ? 'Already have an account?' : 'New to PaisaFlow?'}{' '}<button type="button" onClick={() => { setIsSignup(v => !v); setError(''); setMessage('') }} className="font-medium text-emerald-300 hover:text-emerald-200">{isSignup ? 'Sign in' : 'Create account'}</button></p>
      </div>
    </main>
  )
}

export default App
