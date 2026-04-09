/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // 使用 CSS 变量实现主题切换
        bg: {
          DEFAULT: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
        },
        text: {
          DEFAULT: 'var(--color-text-primary)',
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
        accent: {
          DEFAULT: 'var(--color-accent-primary)',
          primary: 'var(--color-accent-primary)',
          secondary: 'var(--color-accent-secondary)',
        },
        border: {
          DEFAULT: 'var(--color-border-primary)',
          primary: 'var(--color-border-primary)',
          secondary: 'var(--color-border-secondary)',
          focus: 'var(--color-border-focus)',
        },
        // 语义色
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
        // Callout 组件颜色
        'info-bg': 'oklch(25% 0.05 230)',
        'info-border': 'oklch(50% 0.1 230)',
        'info-text': 'oklch(85% 0.05 230)',
        'warn-bg': 'oklch(30% 0.08 85)',
        'warn-border': 'oklch(55% 0.12 85)',
        'warn-text': 'oklch(90% 0.08 85)',
        'error-bg': 'oklch(25% 0.08 25)',
        'error-border': 'oklch(50% 0.12 25)',
        'error-text': 'oklch(85% 0.08 25)',
        'tip-bg': 'oklch(25% 0.06 145)',
        'tip-border': 'oklch(50% 0.1 145)',
        'tip-text': 'oklch(85% 0.06 145)',
        highlight: {
          bg: 'oklch(30% 0.05 250 / 0.3)',
        },
        // 玻璃拟态
        glass: {
          bg: 'var(--glass-bg)',
          'bg-subtle': 'var(--glass-bg-subtle)',
          'bg-hover': 'var(--glass-bg-hover)',
          'bg-active': 'var(--glass-bg-active)',
          border: 'var(--glass-border)',
          'border-subtle': 'var(--glass-border-subtle)',
          'border-focus': 'var(--glass-border-focus)',
          shadow: 'var(--glass-shadow)',
          'shadow-lg': 'var(--glass-shadow-lg)',
          'shadow-inset': 'var(--glass-shadow-inset)',
        },
        // 渐变
        gradient: {
          primary: 'var(--gradient-primary)',
          accent: 'var(--gradient-accent)',
          subtle: 'var(--gradient-subtle)',
          'card-bg': 'var(--gradient-card-bg)',
          mesh: 'var(--mesh-gradient)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'var(--color-text-primary)',
            a: {
              color: 'var(--color-accent-primary)',
              '&:hover': {
                color: 'var(--color-accent-secondary)',
              },
            },
            code: {
              color: 'var(--color-accent-primary)',
              backgroundColor: 'var(--color-bg-tertiary)',
              borderRadius: '0.25rem',
              padding: '0.125rem 0.25rem',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              background: 'linear-gradient(135deg, oklch(12% 0.08 220), oklch(10% 0.08 280), oklch(14% 0.06 240), oklch(12% 0.08 220))',
              backgroundSize: '300% 300%',
              animation: 'aurora-flow 12s ease infinite',
              color: 'oklch(94% 0.02 260)',
              border: '1px solid oklch(22% 0.06 260)',
            },
            'pre code': {
              color: 'inherit',
            },
            blockquote: {
              borderLeftColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-secondary)',
            },
          },
        },
      }),
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      transitionTimingFunction: {
        spring: 'var(--ease-spring)',
        smooth: 'var(--ease-smooth)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'fade-in': 'fade-in var(--duration-normal) var(--ease-smooth)',
        'fade-in-up': 'fade-in-up var(--duration-normal) var(--ease-smooth)',
        'slide-in-left': 'slide-in-left var(--duration-slow) var(--ease-smooth)',
        'slide-in-right': 'slide-in-right var(--duration-slow) var(--ease-smooth)',
        'scale-in': 'scale-in var(--duration-fast) var(--ease-spring)',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};