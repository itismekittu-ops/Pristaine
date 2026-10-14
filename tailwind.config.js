export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/ui-pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/utils/**/*.{js,ts,jsx,tsx,mdx}',
    './src/data/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/types/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs: '360px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      // Dark theme
      ink: { 950: '#0B1020', 900: '#151C33' },
      'on-dark': '#F6F8FB',
      'muted-on-dark': '#A9B2C6',
      aqua: { 400: '#2DD4BF' },
      indigo: { 400: '#818CF8', 600: '#4F46E5' },
      'border-dark': '#6B7590',
      // Light theme
      surface: { 50: '#F6F8FB' },
      white: '#FFFFFF',
      'on-light': '#0B1020',
      slate: { 600: '#5B6475' },
      teal: { 700: '#0F766E' },
      'border-light': '#737D92',
      // Status
      error: { dark: '#F87171', light: '#B42318' },
      success: { dark: '#34D399', light: '#047857' },
      // Hairlines
      'hairline-dark': 'rgba(255, 255, 255, 0.12)',
      'hairline-light': 'rgba(11, 16, 32, 0.10)',
      // Decorative gradients only
      deco: {
        aqua: '#2DD4BF',
        indigo: '#4F46E5',
        violet: '#A78BFA',
        sky: '#38BDF8',
      },
    },
    spacing: {
      0: '0px',
      px: '1px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      6: '24px',
      8: '32px',
      11: '44px', // minimum touch target
      12: '48px',
      14: '56px', // mobile navbar height
      16: '64px',
      24: '96px',
      32: '128px',
    },
    fontFamily: {
      heading: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      display: ['4rem', '4.25rem'],
      'display-m': ['2.5rem', '2.75rem'],
      h2: ['2.75rem', '3rem'],
      'h2-m': ['2rem', '2.375rem'],
      h3: ['1.75rem', '2.125rem'],
      'h3-m': ['1.375rem', '1.75rem'],
      h4: ['1.25rem', '1.75rem'],
      'body-lg': ['1.25rem', '1.875rem'],
      'body-lg-m': ['1.125rem', '1.75rem'],
      body: ['1rem', '1.625rem'],
      small: ['0.875rem', '1.375rem'],
      button: ['1rem', '1.5rem'],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
    },
    borderRadius: {
      none: '0px',
      field: '8px',
      button: '12px',
      card: '16px',
      pill: '999px',
    },
    boxShadow: {
      none: 'none',
      glow: '0 0 24px 0 rgba(45, 212, 191, 0.35)',
      'glow-strong': '0 0 32px 4px rgba(45, 212, 191, 0.45)',
    },
    transitionDuration: {
      DEFAULT: '150ms',
      0: '0ms',
      150: '150ms',
      250: '250ms',
      400: '400ms',
      800: '800ms',
    },
    transitionTimingFunction: {
      DEFAULT: 'cubic-bezier(0.2, 0, 0, 1)',
      brand: 'cubic-bezier(0.2, 0, 0, 1)',
    },
    extend: {
      maxWidth: {
        content: '1200px',
        chat: '760px',
        headline: '900px',
      },
      aspectRatio: {
        card: '12 / 5',
        'card-mobile': '4 / 5',
      },
      borderWidth: {
        1.5: '1.5px',
      },
      height: {
        hero: '100svh',
      },
      minHeight: {
        hero: '640px',
      },
      maxHeight: {
        hero: '900px',
        panel: '60svh',
      },
      transitionProperty: {
        control:
          'color, background-color, border-color, text-decoration-color, outline-color, box-shadow, transform, opacity',
      },
    },
  },
  plugins: [],
}
