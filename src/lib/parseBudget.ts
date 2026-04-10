export const parseBudgetRange = (budget: string) => {
  const cleanedBudget = budget.replace(/\$/g, '').trim();

  if (cleanedBudget.includes('+')) {
    const min = cleanedBudget.replace('+', '');
    return {
      minPrice: Number(min),
      maxPrice: 100000,
    };
  }

  const [min, max] = cleanedBudget.split('-');

  return {
    minPrice: Number(min),
    maxPrice: Number(max),
  };
};
