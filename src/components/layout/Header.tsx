import React from 'react';
import { useMatrixContext } from '@/store/MatrixContext';

const Header: React.FC = () => {
  const { state, dispatch } = useMatrixContext();

  // テーマを切り替え
  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
    
    // HTML要素にクラスを追加/削除
    if (state.theme === 'light') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // データをリセット
  const resetData = () => {
    if (confirm('すべてのデータをリセットしますか？')) {
      dispatch({ type: 'RESET_DATA' });
    }
  };

  // ファイルを保存
  const saveData = () => {
    const data = JSON.stringify({
      matrices: Object.entries(state.matrices).map(([name, matrix]) => ({
        name,
        rows: matrix.rows,
        cols: matrix.cols,
        position: matrix.position,
        values: matrix.values
      })),
      arrows: state.arrows,
      coloredCells: state.coloredCells
    }, null, 2);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matrix_data.json';
    a.click();
    
    URL.revokeObjectURL(url);
  };

  // ファイルを読み込み
  const loadData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          // データの検証
          if (!data.matrices || !Array.isArray(data.matrices)) {
            throw new Error('無効なデータ形式: matrices の配列が見つかりません');
          }
          
          // データをインポート
          const importData = {
            matrices: {},
            arrows: data.arrows || [],
            coloredCells: data.coloredCells || [],
            theme: state.theme,
            selectedMatrix: null,
            selectedArrow: null,
            selectedColoredCell: null,
            lastSelectedCell: null
          };
          
          // 行列データを変換
          data.matrices.forEach((matrix: any) => {
            if (matrix.name && matrix.values) {
              importData.matrices[matrix.name] = {
                values: matrix.values,
                position: matrix.position || [0, 0],
                rows: matrix.rows || matrix.values.length,
                cols: matrix.cols || (matrix.values[0]?.length || 0)
              };
            }
          });
          
          dispatch({
            type: 'IMPORT_DATA',
            data: importData as any
          });
          
          alert('データを読み込みました');
        } catch (error) {
          alert(`データの読み込みに失敗しました: ${(error as Error).message}`);
        }
      };
      reader.readAsText(file);
    });
    
    input.click();
  };

  // 図を保存
  const saveFigure = (format: 'png' | 'pdf' | 'svg') => {
    alert(`図を${format.toUpperCase()}形式で保存する機能は開発中です。`);
    // 実際には canvas または SVG を保存する処理を実装する
  };

  // コマンド一覧を表示
  const showCommands = () => {
    alert(`コマンド一覧:

1. 行列定義:
A := [3, 3] @ (0, 0)
（行列名 := [行, 列] @ (位置X, 位置Y)）

2. 矢印定義:
A[0][0] -> B[1][1] : red
（始点行列[行][列] -> 終点行列[行][列] : 色）

3. 要素の色設定:
A[0][0] : lightblue
（行列[行][列] : 色）

4. 複数のコマンドは改行で区切って実行できます。

※ 色は色名（red, blue）またはカラーコード（#FF0000）で指定できます。`);
  };

  // ショートカットキー一覧を表示
  const showShortcuts = () => {
    alert(`ショートカットキー一覧:

[実装予定]
Ctrl+N: 新規（すべてリセット）
Ctrl+S: PNG形式で保存
Ctrl+P: PDF形式で保存
Ctrl+C: 選択した行列をクリップボードにコピー
Ctrl+A: すべて選択
Ctrl++: 拡大
Ctrl+-: 縮小
Ctrl+0: ビューをリセット`);
  };

  // アプリについて表示
  const showAbout = () => {
    alert(`行列演算可視化ツール

バージョン: 2.0 Web版

このアプリケーションは行列演算を視覚的に表現するためのツールです。
行列の定義、演算、そして視覚的な表現を簡単に行うことができます。

主な機能:
- 行列の作成と編集
- 矢印による要素間の関係の表示
- 色を使った要素の強調
- 行列式の評価と視覚化
- コマンドラインによる操作`);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">行列演算可視化ツール</h1>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative" x-data="{ open: false }">
              {/* ファイルメニュー */}
              <div className="relative inline-block text-left mr-2">
                <div>
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                    id="file-menu"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={() => {
                      const menu = document.getElementById('file-dropdown');
                      menu?.classList.toggle('hidden');
                    }}
                  >
                    ファイル
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div
                  id="file-dropdown"
                  className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:text-white z-10"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="file-menu"
                >
                  <div className="py-1" role="none">
                    <button
                      onClick={resetData}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      新規
                    </button>
                    <button
                      onClick={loadData}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      データを開く
                    </button>
                    <button
                      onClick={saveData}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      データを保存
                    </button>
                    <hr className="my-1 dark:border-gray-600" />
                    <button
                      onClick={() => saveFigure('png')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      PNG形式で保存
                    </button>
                    <button
                      onClick={() => saveFigure('pdf')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      PDF形式で保存
                    </button>
                  </div>
                </div>
              </div>
              
              {/* ヘルプメニュー */}
              <div className="relative inline-block text-left mr-2">
                <div>
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                    id="help-menu"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={() => {
                      const menu = document.getElementById('help-dropdown');
                      menu?.classList.toggle('hidden');
                    }}
                  >
                    ヘルプ
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div
                  id="help-dropdown"
                  className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:text-white z-10"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="help-menu"
                >
                  <div className="py-1" role="none">
                    <button
                      onClick={showCommands}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      コマンド一覧
                    </button>
                    <button
                      onClick={showShortcuts}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      ショートカットキー
                    </button>
                    <hr className="my-1 dark:border-gray-600" />
                    <button
                      onClick={showAbout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      このアプリについて
                    </button>
                  </div>
                </div>
              </div>
              
              {/* テーマ切替ボタン */}
              <button
                onClick={toggleTheme}
                className="bg-gray-200 dark:bg-gray-700 p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {state.theme === 'light' ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;