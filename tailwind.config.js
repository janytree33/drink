/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind CSS가 스타일을 적용할 파일들의 경로를 지정합니다.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 나중에 우리가 원하는 특별한 색상이나 크기 폰트가 있다면 여기에 정의합니다.
    },
  },
  plugins: [],
}
