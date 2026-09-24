/**
 * Ribble App Centralized Design Tokens & Visual System (Apple-inspired)
 * 
 * MASTER PALETTE:
 * 1. Primary Background:    #FFFFFF (Light) / #000000 (Dark)
 * 2. Secondary Background:  #F5F5F7 (Light) / #1C1C1E (Dark)
 * 3. Tertiary Background:   #EDEDF0 (Light) / #2C2C2E (Dark)
 * 4. Primary Accent (Blue): #007AFF (Light) / #0A84FF (Dark)
 * 5. Primary Text:          #1D1D1F (Light) / #F5F5F7 (Dark)
 * 6. Secondary Text:        #6E6E73 (Light) / #98989D (Dark)
 * 7. Border / Separator:    #D1D1D6 (Light) / #38383A (Dark)
 */

export const RIBBLE_COLORS = {
  // Primary Surfaces
  primaryBackground: '#FFFFFF',
  secondaryBackground: '#F5F5F7',
  tertiaryBackground: '#EDEDF0',
  
  // Backward compatibility alias keys
  offWhite: '#F5F5F7',
  softGray: '#D1D1D6',
  softGrayLight: '#EDEDF0',
  softGrayDark: '#8E8E93',

  // Primary Interactive Accent (Apple Blue)
  accent: '#007AFF',
  accentHover: '#0066D6',
  accentSubtle: 'rgba(0, 122, 255, 0.1)',
  mint: '#007AFF',
  mintHover: '#0066D6',
  mintLight: 'rgba(0, 122, 255, 0.1)',
  mintDark: '#FFFFFF',

  // Secondary Accent (Indigo / Neutral)
  lavender: '#5856D6',
  lavenderHover: '#4745B8',
  lavenderLight: 'rgba(88, 86, 214, 0.1)',
  lavenderDark: '#FFFFFF',

  // Typography & Dark
  primaryText: '#1D1D1F',
  secondaryText: '#6E6E73',
  tertiaryText: '#8E8E93',
  charcoal: '#1D1D1F',
  charcoalHover: '#2C2C2E',
  charcoalLight: '#38383A',
  charcoalMuted: '#6E6E73',

  // Semantic Status Tokens
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  border: '#D1D1D6',

  // Semantic Tokens
  semantic: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSubtle: '#F5F5F7',
    surfaceNeutral: '#EDEDF0',
    
    primaryAccent: '#007AFF',
    primaryAccentHover: '#0066D6',
    secondaryAccent: '#5856D6',
    secondaryAccentHover: '#4745B8',

    textPrimary: '#1D1D1F',
    textSecondary: '#6E6E73',
    textMuted: '#8E8E93',
    textOnDark: '#FFFFFF',
    textOnMint: '#FFFFFF',
    textOnLavender: '#FFFFFF',

    border: '#D1D1D6',
    borderSubtle: '#E5E5EA',
    borderFocus: '#007AFF',

    success: '#34C759',
    active: '#007AFF',
    streak: '#FF9500',
    category: '#007AFF',
    special: '#5856D6',
    error: '#FF3B30',
    errorLight: 'rgba(255, 59, 48, 0.1)',
  }
} as const;

/**
 * Standard semantic Tailwind class strings for Apple-inspired UI
 */
export const RIBBLE_CLASSES = {
  // Page canvas foundation
  pageCanvas: 'bg-white dark:bg-black text-[#1D1D1F] dark:text-[#F5F5F7] min-h-screen',
  
  // Card surfaces
  card: 'bg-white dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl shadow-xs transition-all',
  cardNeutral: 'bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] border border-[#D1D1D6] dark:border-[#38383A] rounded-2xl transition-all',
  cardMint: 'bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 text-[#007AFF] dark:text-[#0A84FF] border border-[#007AFF]/20 rounded-2xl transition-all',
  cardLavender: 'bg-[#5856D6]/10 text-[#5856D6] border border-[#5856D6]/20 rounded-2xl transition-all',
  cardDark: 'bg-[#1D1D1F] text-[#F5F5F7] rounded-2xl transition-all',
  
  // Buttons
  buttonPrimary: 'bg-[#007AFF] hover:bg-[#0066D6] active:scale-[0.98] text-white font-semibold rounded-xl px-4 py-2 transition-all shadow-xs cursor-pointer',
  buttonSecondary: 'bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#EDEDF0] dark:hover:bg-[#38383A] active:scale-[0.98] text-[#1D1D1F] dark:text-[#F5F5F7] border border-[#D1D1D6] dark:border-[#38383A] font-semibold rounded-xl px-4 py-2 transition-all cursor-pointer',
  buttonDark: 'bg-[#1D1D1F] dark:bg-[#2C2C2E] hover:bg-[#2C2C2E] text-white font-semibold rounded-xl px-4 py-2 transition-all shadow-xs cursor-pointer',
  buttonLavender: 'bg-[#5856D6] hover:bg-[#4745B8] active:scale-[0.98] text-white font-semibold rounded-xl px-4 py-2 transition-all shadow-xs cursor-pointer',
  buttonGhost: 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] rounded-xl font-medium px-3 py-1.5 transition-all cursor-pointer',

  // Active / Selected badges & items
  activeNav: 'bg-[#007AFF] text-white font-semibold shadow-xs',
  inactiveNav: 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]',

  // Accent highlights & badges
  badgeMint: 'bg-[#007AFF]/10 text-[#007AFF] dark:bg-[#0A84FF]/15 dark:text-[#0A84FF] font-semibold rounded-full px-2.5 py-0.5 text-xs',
  badgeLavender: 'bg-[#5856D6]/10 text-[#5856D6] font-semibold rounded-full px-2.5 py-0.5 text-xs',
  badgeNeutral: 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] border border-[#D1D1D6] dark:border-[#38383A] font-medium rounded-full px-2.5 py-0.5 text-xs',
  badgeDark: 'bg-[#1D1D1F] text-white font-semibold rounded-full px-2.5 py-0.5 text-xs',
  
  // Inputs
  input: 'bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-[#D1D1D6] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#8E8E93] focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 rounded-xl transition-all outline-none',
};
