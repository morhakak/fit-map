export const isValidInput = (text: string): boolean => {
  const hebrewRegex = /^[\u0590-\u05FF\s]+$/;
  return hebrewRegex.test(text.trim()) && text.trim().length <= 50;
};
