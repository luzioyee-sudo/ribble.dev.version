const translateDefinition = (def: string, targetLang: string) => {
  if (targetLang === 'English') return def;
  
  const translations: Record<string, Record<string, string>> = {
    'heat': {
      'French': 'la chaleur',
      'German': 'die Hitze',
      'Arabic': 'الحرارة',
      'Spanish': 'el calor'
    },
    'government': {
      'French': 'le gouvernement',
      'German': 'die Regierung',
      'Arabic': 'الحكومة',
      'Spanish': 'el gobierno'
    }
  };
  
  if (translations[def] && translations[def][targetLang]) {
    return translations[def][targetLang];
  }
  
  // Generic mock for demonstration
  return `[${targetLang}] ${def}`;
};
