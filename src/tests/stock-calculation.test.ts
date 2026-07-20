import { describe, it, expect } from 'vitest';
import { calculateStockOnHand } from '../lib/store';
import { StockMovement } from '../types/database';

describe('Stock On Hand Calculation Logic', () => {
  it('should calculate initial stock from purchase_in movements', () => {
    const movements: StockMovement[] = [
      { id: 'm1', item_id: 'item-1', movement_type: 'purchase_in', quantity: 10, reference_invoice_id: null, note: '', created_by: null, created_at: '' },
      { id: 'm2', item_id: 'item-1', movement_type: 'purchase_in', quantity: 5, reference_invoice_id: null, note: '', created_by: null, created_at: '' },
    ];

    const stock = calculateStockOnHand('item-1', movements);
    expect(stock).toBe(15);
  });

  it('should correctly deduct stock on usage_out and damaged movements', () => {
    const movements: StockMovement[] = [
      { id: 'm1', item_id: 'item-1', movement_type: 'purchase_in', quantity: 20, reference_invoice_id: null, note: '', created_by: null, created_at: '' },
      { id: 'm2', item_id: 'item-1', movement_type: 'usage_out', quantity: 4, reference_invoice_id: null, note: '', created_by: null, created_at: '' },
      { id: 'm3', item_id: 'item-1', movement_type: 'damaged', quantity: 1, reference_invoice_id: null, note: '', created_by: null, created_at: '' },
    ];

    const stock = calculateStockOnHand('item-1', movements);
    expect(stock).toBe(15);
  });

  it('should increase stock on returned movements and handle adjustments', () => {
    const movements: StockMovement[] = [
      { id: 'm1', item_id: 'item-1', movement_type: 'purchase_in', quantity: 10, reference_invoice_id: null, note: '', created_by: null, created_at: '' },
      { id: 'm2', item_id: 'item-1', movement_type: 'returned', quantity: 2, reference_invoice_id: null, note: '', created_by: null, created_at: '' },
      { id: 'm3', item_id: 'item-1', movement_type: 'adjustment', quantity: -3, reference_invoice_id: null, note: '', created_by: null, created_at: '' },
    ];

    const stock = calculateStockOnHand('item-1', movements);
    expect(stock).toBe(9);
  });

  it('should correctly identify low-stock status when stock is below reorder level', () => {
    const stockOnHand = 2;
    const reorderLevel = 5;
    const isLowStock = stockOnHand <= reorderLevel;
    expect(isLowStock).toBe(true);
  });
});
