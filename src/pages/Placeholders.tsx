import React from 'react';
import { Tag, CreditCard, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PlaceholderPageProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ icon, title, description }) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <Card className="max-w-sm w-full text-center shadow-md">
      <CardContent className="flex flex-col items-center gap-4 p-8">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="inline-flex items-center rounded-full border border-dashed px-4 py-1.5 text-xs text-muted-foreground">
          Coming in the next phase
        </div>
      </CardContent>
    </Card>
  </div>
);

export const Categories: React.FC = () => (
  <PlaceholderPage
    icon={<Tag className="h-8 w-8" />}
    title="Categories"
    description="Manage your expense categories and icons."
  />
);

export const PaymentModes: React.FC = () => (
  <PlaceholderPage
    icon={<CreditCard className="h-8 w-8" />}
    title="Payment Modes"
    description="Add and manage your credit cards, wallets and bank accounts."
  />
);

export const Expenses: React.FC = () => (
  <PlaceholderPage
    icon={<Receipt className="h-8 w-8" />}
    title="Expenses"
    description="View, create and filter your expense transactions."
  />
);
