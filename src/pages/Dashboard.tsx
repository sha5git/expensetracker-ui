import React, { useEffect, useState } from 'react';
import api from '@/api/axios';
import { useAuth } from '@/auth/AuthContext';
import {
  TrendingUp,
  Tag,
  CreditCard,
  Receipt,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface TotalExpenseResponse {
  totalExpense: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [totalExpense, setTotalExpense] = useState<number | null>(null);
  const [expenseLoading, setExpenseLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchTotalExpense = async () => {
      try {
        const { data } = await api.get<TotalExpenseResponse>('/test/totalExpense');
        if (!cancelled) setTotalExpense(data.totalExpense);
      } catch {
        // 401 → Axios interceptor will attempt refresh; on true failure leave null
      } finally {
        if (!cancelled) setExpenseLoading(false);
      }
    };

    fetchTotalExpense();
    return () => { cancelled = true; };
  }, []);

  const stats = [
    {
      label: 'Total Expenses',
      value: expenseLoading
        ? null
        : totalExpense !== null
          ? `₹${totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          : '—',
      icon: Receipt,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      isLoading: expenseLoading,
    },
    { label: 'Categories', value: '—', icon: Tag, color: 'text-purple-500', bg: 'bg-purple-500/10', isLoading: false },
    { label: 'Payment Modes', value: '—', icon: CreditCard, color: 'text-orange-500', bg: 'bg-orange-500/10', isLoading: false },
    { label: 'This Month', value: '—', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10', isLoading: false },
  ];

  return (
    <div className="flex-1 space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Good day, <span className="text-primary">{user?.username}</span> 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Here's an overview of your finances.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg, isLoading }) => (
          <Card key={label} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : (
                <div className="text-3xl font-bold">{value}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {label === 'Total Expenses' && !isLoading && totalExpense !== null
                  ? 'Live from API'
                  : 'Feature coming soon'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {[
            { label: 'Manage Categories', to: '/categories', icon: Tag, desc: 'Add or edit spending categories' },
            { label: 'Payment Modes', to: '/payment-modes', icon: CreditCard, desc: 'Manage your payment methods' },
            { label: 'View Expenses', to: '/expenses', icon: Receipt, desc: 'Browse your transaction history' },
          ].map(({ label, to, icon: Icon, desc }) => (
            <Card key={to} className="group transition-all hover:shadow-md hover:border-primary/40">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0" asChild>
                  <Link to={to}>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
