export const parseBudgetRange = (budget: string) => {
  const cleanedBudget = budget.replace(/\$/g, '').trim();

  const [min, max] = cleanedBudget.split('-');

  return {
    minPrice: Number(min),
    maxPrice: Number(max),
  };
};
