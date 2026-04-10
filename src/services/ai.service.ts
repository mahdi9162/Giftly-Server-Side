export const getPreferredCategories = (occasion: string, person: string) => {
  const normalizedOccasion = occasion.toLowerCase();
  const normalizedPerson = person.toLowerCase();

  const categorySet = new Set<string>();

  // Occasion-based preference
  if (normalizedOccasion === 'birthday') {
    categorySet.add('birthday');
    categorySet.add('personalized');
  }

  if (normalizedOccasion === 'anniversary') {
    categorySet.add('anniversary');
    categorySet.add('personalized');
  }

  // Person-based preference
  if (['wife', 'girlfriend', 'mom', 'mother', 'sister', 'female friend'].includes(normalizedPerson)) {
    categorySet.add('for-her');
    categorySet.add('personalized');
  }

  if (['husband', 'boyfriend', 'dad', 'father', 'brother', 'male friend'].includes(normalizedPerson)) {
    categorySet.add('for-him');
    categorySet.add('personalized');
  }

  if (['family', 'parents', 'parent'].includes(normalizedPerson)) {
    categorySet.add('family');
    categorySet.add('personalized');
  }

  if (normalizedOccasion === 'valentine') {
    categorySet.add('for-her');
    categorySet.add('for-him');
    categorySet.add('personalized');
  }

  // Fallback
  if (categorySet.size === 0) {
    categorySet.add('personalized');
  }

  return Array.from(categorySet);
};
