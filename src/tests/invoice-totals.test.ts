import { describe, it, expect } from 'vitest';

describe('Invoice Totals and Payment Math Logic', () => {
  it('should compute subtotal and grand total with tax and discount', () => {
    const lineItems = [
      { quantity: 2, unit_price: 500 }, // 1000
      { quantity: 4, unit_price: 25 },  // 100
    ];

    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    expect(subtotal).toBe(1100);

    const discount = 100;
    const taxPercent = 18; // 18%

    const taxableAmount = Math.max(0, subtotal - discount); // 1000
    const taxAmount = (taxableAmount * taxPercent) / 100; // 180
    const grandTotal = taxableAmount + taxAmount; // 1180

    expect(grandTotal).toBe(1180);
  });

  it('should transition status from sent to partially_paid to paid on payment recording', () => {
    const total = 1000;
    let amountPaid = 0;
    let status = 'sent';

    // First Partial Payment
    const payment1 = 400;
    amountPaid += payment1;
    if (amountPaid >= total) {
      status = 'paid';
    } else if (amountPaid > 0) {
      status = 'partially_paid';
    }

    expect(status).toBe('partially_paid');
    expect(amountPaid).toBe(400);

    // Second Payment fulfilling total
    const payment2 = 600;
    amountPaid += payment2;
    if (amountPaid >= total) {
      status = 'paid';
    } else if (amountPaid > 0) {
      status = 'partially_paid';
    }

    expect(status).toBe('paid');
    expect(amountPaid).toBe(1000);
  });
});
