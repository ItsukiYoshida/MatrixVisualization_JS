import React, { useState, useEffect } from 'react';
import { useMatrixContext, Arrow } from '@/store/MatrixContext';

const ArrowEditor: React.FC = () => {
  const { state, dispatch } = useMatrixContext();
  const [sourceMatrix, setSourceMatrix] = useState('A');
  const [sourceRow, setSourceRow] = useState(0);
  const [sourceCol, setSourceCol] = useState(0);
  const [targetMatrix, setTargetMatrix] = useState('B');
  const [targetRow, setTargetRow] = useState(0);
  const [targetCol, setTargetCol] = useState(0);
  const [color, setColor] = useState('red');
  const [style, setStyle] = useState('-|>');
  const [width, setWidth] = useState(2.0);
  const [label, setLabel] = useState('');

  // 矢印スタイルの選択肢
  const arrowStyles = [
    { value: '-|>', label: '通常矢印' },
    { value: '->>', label: '細矢印' },
    { value: '-[', label: '四角終端' },
    { value: '-|', label: '線終端' },
    { value: '<->', label: '双方向矢印' },
    { value: '<-|>', label: '双方向矢印（太）' }
  ];

  // 選択された矢印が変更されたら、フォームの値を更新
  useEffect(() => {
    if (state.selectedArrow !== null && state.arrows[state.selectedArrow]) {
      const arrow = state.arrows[state.selectedArrow];
      setSourceMatrix(arrow.source[0]);
      setSourceRow(arrow.source[1]);
      setSourceCol(arrow.source[2]);
      setTargetMatrix(arrow.target[0]);
      setTargetRow(arrow.target[1]);
      setTargetCol(arrow.target[2]);
      setColor(arrow.color);
      setStyle(arrow.style);
      setWidth(arrow.width);
      setLabel(arrow.label || '');
    }
  }, [state.selectedArrow, state.arrows]);

  // 色選択ダイアログを開く
  const handleColorClick = () => {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = color.startsWith('#') ? color : '#FF0000'; // 名前付き色の場合はデフォルト赤
    
    input.addEventListener('change', (e) => {
      setColor((e.target as HTMLInputElement).value);
    });
    
    input.click();
  };

  // 矢印を追加
  const handleAddArrow = () => {
    // 行列が存在するか確認
    if (!(sourceMatrix in state.matrices)) {
      alert(`始点行列 '${sourceMatrix}' が定義されていません。`);
      return;
    }

    if (!(targetMatrix in state.matrices)) {
      alert(`終点行列 '${targetMatrix}' が定義されていません。`);
      return;
    }

    // インデックスが有効か確認
    const sourceMatrixData = state.matrices[sourceMatrix];
    const targetMatrixData = state.matrices[targetMatrix];
    
    if (sourceRow < 0 || sourceRow >= sourceMatrixData.rows || 
        sourceCol < 0 || sourceCol >= sourceMatrixData.cols) {
      alert(`始点の位置が範囲外です。行: 0-${sourceMatrixData.rows - 1}, 列: 0-${sourceMatrixData.cols - 1}`);
      return;
    }

    if (targetRow < 0 || targetRow >= targetMatrixData.rows || 
        targetCol < 0 || targetCol >= targetMatrixData.cols) {
      alert(`終点の位置が範囲外です。行: 0-${targetMatrixData.rows - 1}, 列: 0-${targetMatrixData.cols - 1}`);
      return;
    }

    const newArrow: Arrow = {
      source: [sourceMatrix, sourceRow, sourceCol],
      target: [targetMatrix, targetRow, targetCol],
      color,
      style,
      width,
      ...(label && { label })
    };

    if (state.selectedArrow !== null) {
      // 既存の矢印を更新
      dispatch({
        type: 'UPDATE_ARROW',
        index: state.selectedArrow,
        arrow: newArrow
      });
    } else {
      // 新しい矢印を追加
      dispatch({
        type: 'ADD_ARROW',
        arrow: newArrow
      });
    }

    // 矢印の選択を解除
    dispatch({
      type: 'SELECT_ARROW',
      index: null
    });

    // フォームをリセット
    if (state.selectedArrow !== null) {
      setSourceMatrix('A');
      setSourceRow(0);
      setSourceCol(0);
      setTargetMatrix('B');
      setTargetRow(0);
      setTargetCol(0);
      setColor('red');
      setStyle('-|>');
      setWidth(2.0);
      setLabel('');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">矢印設定</h2>
      
      {/* 矢印定義フォーム */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            始点行列
          </label>
          <input
            type="text"
            value={sourceMatrix}
            onChange={(e) => setSourceMatrix(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            行
          </label>
          <input
            type="number"
            min="0"
            max="9"
            value={sourceRow}
            onChange={(e) => setSourceRow(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            列
          </label>
          <input
            type="number"
            min="0"
            max="9"
            value={sourceCol}
            onChange={(e) => setSourceCol(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            終点行列
          </label>
          <input
            type="text"
            value={targetMatrix}
            onChange={(e) => setTargetMatrix(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            行
          </label>
          <input
            type="number"
            min="0"
            max="9"
            value={targetRow}
            onChange={(e) => setTargetRow(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            列
          </label>
          <input
            type="number"
            min="0"
            max="9"
            value={targetCol}
            onChange={(e) => setTargetCol(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>
      </div>
      
      {/* 矢印スタイル設定 */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2 dark:text-white">矢印スタイル</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              色
            </label>
            <div className="flex mt-1">
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
              <button
                onClick={handleColorClick}
                className="px-4 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                style={{ backgroundColor: color }}
              >
                <span className="sr-only">色選択</span>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              スタイル
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            >
              {arrowStyles.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              太さ
            </label>
            <input
              type="number"
              min="0.5"
              max="5"
              step="0.5"
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>
          
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ラベル
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
      </div>
      
      {/* 追加ボタン */}
      <button
        onClick={handleAddArrow}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {state.selectedArrow !== null ? '矢印を更新' : '矢印を追加'}
      </button>
    </div>
  );
};

export default ArrowEditor;