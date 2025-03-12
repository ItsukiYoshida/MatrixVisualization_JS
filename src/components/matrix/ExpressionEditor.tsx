import React, { useState } from 'react';
import { useMatrixContext } from '@/store/MatrixContext';

const ExpressionEditor: React.FC = () => {
  const { state, dispatch } = useMatrixContext();
  const [expression, setExpression] = useState('A + B = C');

  // 予約語リスト
  const reservedWords = ['+', '-', '*', '^', 'Det', 'Tr', '='];

  // 演算子を挿入
  const insertOperator = (op: string) => {
    setExpression(prev => prev + op);
  };

  // テンプレートを読み込む
  const loadTemplate = (template: string) => {
    setExpression(template);
  };

  // 式の評価（デモ実装）
  const evaluateExpression = () => {
    if (!expression.trim()) {
      alert('式を入力してください。');
      return;
    }

    // 式の解析を実装する代わりに、ここではデモとして簡単な結果表示のみ
    alert(`式: ${expression} を評価しました。\n(実際の計算結果は実装中です)`);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">行列式入力</h2>
      
      {/* 式入力フォーム */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          式:
        </label>
        <div className="flex">
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
          <button
            onClick={evaluateExpression}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            式を評価
          </button>
        </div>
      </div>
      
      {/* 演算子ボタン */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2 dark:text-white">演算子</h3>
        <div className="grid grid-cols-4 gap-2">
          {reservedWords.map((op) => (
            <button
              key={op}
              onClick={() => insertOperator(op)}
              className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
            >
              {op}
            </button>
          ))}
        </div>
      </div>
      
      {/* テンプレート式 */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2 dark:text-white">テンプレート式</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => loadTemplate('A + B')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            行列加算
          </button>
          
          <button
            onClick={() => loadTemplate('A * B')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            行列乗算
          </button>
          
          <button
            onClick={() => loadTemplate('A^2')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            行列べき乗
          </button>
          
          <button
            onClick={() => loadTemplate('Det(A)')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            行列式
          </button>
          
          <button
            onClick={() => loadTemplate('Tr(A)')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            トレース
          </button>
          
          <button
            onClick={() => loadTemplate('A + B = C')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            行列等式
          </button>
        </div>
      </div>
      
      {/* 式の説明 */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        <p className="mb-1">式の例: A + B = C, Det(A), A^2, Tr(B)</p>
        <p>演算子優先順位: かっこ &gt; べき乗 &gt; 乗算 &gt; 加減算</p>
      </div>
    </div>
  );
};

export default ExpressionEditor;