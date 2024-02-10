/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                background: '#003566',
                background_dark: '#001D3D',
                primary: '#ffd60a',
                accent: '#ffc300',
                grey: '#9ca3af',
                dark_grey: '#313438',
                danger: '#f87171'
            },
            gridTemplateColumns: {
                16: 'repeat(16, minmax(0, 1fr))'
            }
        }
    },
    safelist: [
        'text-2xl',
        'text-3xl',
        'text-4xl',
        'text-5xl',
        'text-6xl',
        'text-7xl',
        'text-8xl',
        'text-9xl',
        'bg-background',
        'bg-background_dark',
        'bg-danger'
    ],
    plugins: []
};
