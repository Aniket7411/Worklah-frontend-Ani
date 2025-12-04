/** @type {import('tailwindcss').Config} */
export default  {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
     
      boxShadow: {
        custom: '0px 4px 4px 0px #000000', // Your custom shadow
      },
    },
  },
  plugins: [],
};