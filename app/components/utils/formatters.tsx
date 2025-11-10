export const formatMontant = (montant: number): string => {
  const formatter = new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(montant);
};


export const formatMontantSansSigne = (montant: number): string => {
  const formatter = new Intl.NumberFormat('fr-GN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(montant);
};
