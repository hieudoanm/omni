import { PersonRow, Settlement } from '../types';

export const calculateSettlements = (persons: PersonRow[]): Settlement[] => {
  const net = persons.map((p) => ({
    name: p.name.trim(),
    net: (p.paid || 0) - (p.owes || 0),
  }));
  const creditors = net.filter((n) => n.net > 0).sort((a, b) => b.net - a.net);
  const debtors = net.filter((n) => n.net < 0).sort((a, b) => a.net - b.net);
  const settlements: Settlement[] = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i],
      creditor = creditors[j];
    const amount = Math.min(-debtor.net, creditor.net);
    settlements.push({ from: debtor.name, to: creditor.name, amount });
    debtor.net += amount;
    creditor.net -= amount;
    if (debtor.net === 0) i++;
    if (creditor.net === 0) j++;
  }
  return settlements;
};
