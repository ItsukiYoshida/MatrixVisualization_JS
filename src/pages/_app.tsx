import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  // ダークモードの初期化
  useEffect(() => {
    // ローカルストレージからテーマ設定を取得
    const theme = localStorage.getItem('theme');
    
    // ダークモードの場合、HTMLにdarkクラスを追加
    if (theme === 'dark' || 
        (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  return <Component {...pageProps} />;
}

export default MyApp;