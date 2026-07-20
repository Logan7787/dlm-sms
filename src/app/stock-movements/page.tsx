import { Suspense } from 'react';
import { StockMovementsContent } from '@/components/stock-movements/stock-movements-content';

export const dynamic = 'force-dynamic';

export default function StockMovementsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading stock movements ledger...</div>}>
      <StockMovementsContent />
    </Suspense>
  );
}
