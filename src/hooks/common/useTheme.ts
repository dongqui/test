import { useState } from 'react';

// export const useTheme = () => {
//   const BrowserDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
//   let initThemeInfo = BrowserDarkMode ? 'dark' : 'light';
//   const userSettingTheme = localStorage.getItem('theme');

//   if (userSettingTheme) {
//     initThemeInfo = userSettingTheme;
//   }

//   const [isTheme, setIsTheme] = useState(initThemeInfo);

//   const handleMode = (mode: any) => {
//     window.localStorage.setItem('theme', mode);
//     setIsTheme(mode);
//   };

//   const changeMode = () => handleMode(isTheme === 'light' ? 'dark' : 'light');

//   return { isTheme, changeMode };
// };
