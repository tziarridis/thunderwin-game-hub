
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'montserrat': ['Montserrat', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				casino: {
					'thunder-green': '#00FF66',
					'thunder-dark': '#121212',
					'thunder-darker': '#0A0A0A',
					'thunder-light': '#F9FAFB',
					'thunder-gray': '#1E1E1E',
					'thunder-accent': '#3FE077',
					'thunder-highlight': '#00CC52',
					'gold': '#FFD700',
					'royal-purple': '#5D3FD3',
					'royal-blue': '#4169E1',
					'deep-black': '#050505',
					'platinum': '#E5E4E2',
					'diamond': '#B9F2FF',
					'vip-gold': '#BF953F',
					'vip-platinum': '#E5E4E2',
					'vip-diamond': '#B9F2FF',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
				'casino-gradient': 'linear-gradient(135deg, rgba(0, 255, 102, 0.1) 0%, rgba(0, 204, 82, 0.05) 100%)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				lightning: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				pulse: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.6' },
				},
				scale: {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' },
					'100%': { transform: 'scale(1)' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				spin: {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' },
				},
				float: {
					'0%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' },
					'100%': { transform: 'translateY(0px)' },
				},
				glow: {
					'0%, 100%': { boxShadow: '0 0 5px rgba(0, 255, 102, 0.3), 0 0 20px rgba(0, 255, 102, 0.1)' },
					'50%': { boxShadow: '0 0 20px rgba(0, 255, 102, 0.6), 0 0 40px rgba(0, 255, 102, 0.3)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'lightning': 'lightning 2s ease-in-out infinite',
				'pulse': 'pulse 1.5s infinite',
				'scale': 'scale 1.5s infinite',
				'shimmer': 'shimmer 4s ease-in-out infinite',
				'spin-slow': 'spin 4s linear infinite',
				'float': 'float 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
			},
			boxShadow: {
				'neon': '0 0 5px rgba(0, 255, 102, 0.5), 0 0 20px rgba(0, 255, 102, 0.3)',
				'neon-hover': '0 0 10px rgba(0, 255, 102, 0.7), 0 0 30px rgba(0, 255, 102, 0.5)',
				'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
				'card-hover': '0 8px 30px rgba(0, 0, 0, 0.5)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
