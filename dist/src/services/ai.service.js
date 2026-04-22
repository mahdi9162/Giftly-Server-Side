"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreferredCategories = void 0;
const getPreferredCategories = (occasion, person) => {
    const normalizedOccasion = occasion.toLowerCase();
    const normalizedPerson = person.toLowerCase();
    const categorySet = new Set();
    // Occasion-based preference
    if (normalizedOccasion === 'birthday') {
        categorySet.add('birthday');
        categorySet.add('personalized');
    }
    if (normalizedOccasion === 'anniversary') {
        categorySet.add('anniversary');
        categorySet.add('personalized');
    }
    if (normalizedOccasion === 'wedding') {
        categorySet.add('family');
        categorySet.add('personalized');
    }
    if (normalizedOccasion === 'graduation') {
        categorySet.add('personalized');
        categorySet.add('for-him');
        categorySet.add('for-her');
    }
    if (normalizedOccasion === 'valentine') {
        categorySet.add('for-her');
        categorySet.add('for-him');
        categorySet.add('personalized');
    }
    if (normalizedOccasion === 'just because') {
        categorySet.add('personalized');
        categorySet.add('for-him');
        categorySet.add('for-her');
    }
    // Person-based preference
    if (['girlfriend', 'mom'].includes(normalizedPerson)) {
        categorySet.add('for-her');
        categorySet.add('personalized');
    }
    if (['boyfriend', 'dad'].includes(normalizedPerson)) {
        categorySet.add('for-him');
        categorySet.add('personalized');
    }
    if (['friend', 'colleague'].includes(normalizedPerson)) {
        categorySet.add('personalized');
    }
    if (normalizedPerson === 'sibling') {
        categorySet.add('for-him');
        categorySet.add('for-her');
        categorySet.add('personalized');
    }
    // fallback
    if (categorySet.size === 0) {
        categorySet.add('personalized');
    }
    return Array.from(categorySet);
};
exports.getPreferredCategories = getPreferredCategories;
