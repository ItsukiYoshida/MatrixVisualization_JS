import React, { useState, useEffect } from 'react';
import { useMatrixContext, Matrix } from '@/store/MatrixContext';

const MatrixEditor: React.FC = () => {
  const { state, dispatch } = useMatrixContext();
  const [matrixName, setMatrixName] = useState('A');
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [randomMin, setRandomMin] = useState(-10);
  const [randomMax, setRandomMax] = useState(10);

  // 選択された行列が変更されたら、フォームの値を更新
  useEffect(() => {
    if (state.selectedMatrix && state.matrices[state.selectedMatrix]) {
      const matrix = state.matrices[state.selectedMatrix];
      setMatrixName(state.selectedMatrix);
      setRows(matrix.rows);
      setCols(matrix.cols);
      setPosX(matrix.position[0]);
      setPosY(matrix.position[1]);
    }
  }, [state.selectedMatrix, state.matrices]);

  // 行列を追加または更新
  const handleAddMatrix = () => {
    // 名前が予約語でないことを確認
    const reservedWords = ['+', '-', '*', '^', 'Det', 'Tr', '='];
    if (reservedWords.includes(matrixName)) {
      alert(`'${matrixName}' は予約語のため、行列名として使用できません。`);
      return;
    }

    // 行列の値を1から順に設定
    const values: number[][] = [];
    let counter = 1;
    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < cols; j++) {
        row.push(counter++);
      }
      values.push(row);
    }

    const newMatrix: Matrix = {
      values,
      position: [posX, posY],
      rows,
      cols
    };

    // 同じ名前の行列が既に存在する場合は確認
    if (matrixName in state.matrices && matrixName !== state.selectedMatrix) {
      if (!confirm(`行列 '${matrixName}' は既に存在します。上書きしますか？`)) {
        return;
      }
    }

    // 更新または追加
    dispatch({
      type: 'ADD_MATRIX',
      name: matrixName,
      matrix: newMatrix
    });

    // 追加した行列を選択
    dispatch({
      type: 'SELECT_MATRIX',
      name: matrixName
    });
  };

  // ランダム行列を生成
  const generateRandomMatrix = () => {
    // 行列の値をランダムに設定
    const values: number[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < cols; j++) {
        row.push(Math.floor(Math.random() * (randomMax - randomMin + 1) + randomMin));
      }
      values.push(row);
    }

    const newMatrix: Matrix = {
      values,
      position: [posX, posY],
      rows,
      cols
    };

    // 同じ名前の行列が既に存在する場合は確認
    if (matrixName in state.matrices && matrixName !== state.selectedMatrix) {
      if (!confirm(`行列 '${matrixName}' は既に存在します。上書きしますか？`)) {
        return;
      }
    }

    // 更新または追加
    dispatch({
      type: 'ADD_MATRIX',
      name: matrixName,
      matrix: newMatrix
    });

    // 追加した行列を選択
    dispatch({
      type: 'SELECT_MATRIX',
      name: matrixName
    });
  };

  // 特殊行列を生成
  const generateSpecialMatrix = (type: 'identity' | 'zeros' | 'ones' | 'upper' | 'lower' | 'diagonal') => {
    // 単位行列、上三角行列、下三角行列、対角行列は正方行列である必要がある
    if (['identity', 'upper', 'lower', 'diagonal'].includes(type) && rows !== cols) {
      alert(`${type === 'identity' ? '単位' : type === 'upper' ? '上三角' : type === 'lower' ? '下三角' : '対角'}行列は正方行列である必要があります。`);
      return;
    }

    // 行列の値を設定
    const values: number[][] = Array(rows).fill(0).map(() => Array(cols).fill(0));
    
    if (type === 'identity') {
      // 単位行列
      for (let i = 0; i < rows; i++) {
        values[i][i] = 1;
      }
    } else if (type === 'zeros') {
      // 零行列（デフォルトで0埋め）
    } else if (type === 'ones') {
      // 1行列
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          values[i][j] = 1;
        }
      }
    } else if (type === 'upper') {
      // 上三角行列
      let counter = 1;
      for (let i = 0; i < rows; i++) {
        for (let j = i; j < cols; j++) {
          values[i][j] = counter++;
        }
      }
    } else if (type === 'lower') {
      // 下三角行列
      let counter = 1;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j <= i; j++) {
          values[i][j] = counter++;
        }
      }
    } else if (type === 'diagonal') {
      // 対角行列
      for (let i = 0; i < rows; i++) {
        values[i][i] = i + 1;
      }
    }

    const newMatrix: Matrix = {
      values,
      position: [posX, posY],
      rows,
      cols
    };

    // 同じ名前の行列が既に存在する場合は確認
    if (matrixName in state.matrices && matrixName !== state.selectedMatrix) {
      if (!confirm(`行列 '${matrixName}' は既に存在します。上書きしますか？`)) {
        return;
      }
    }

    // 更新または追加
    dispatch({
      type: 'ADD_MATRIX',
      name: matrixName,
      matrix: newMatrix
    });

    // 追加した行列を選択
    dispatch({
      type: 'SELECT_MATRIX',
      name: matrixName
    });
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">行列定義</h2>
      
      {/* 行列定義フォーム */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            行列名
          </label>
          <input
            type="text"
            value={matrixName}
            onChange={(e) => setMatrixName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            行
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            列
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={cols}
            onChange={(e) => setCols(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            位置 X
          </label>
          <input
            type="number"
            min="0"
            max="20"
            value={posX}
            onChange={(e) => setPosX(parseFloat(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            位置 Y
          </label>
          <input
            type="number"
            min="0"
            max="20"
            value={posY}
            onChange={(e) => setPosY(parseFloat(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>
        
        <div className="flex items-end">
          <button
            onClick={handleAddMatrix}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            行列を追加
          </button>
        </div>
      </div>
      
      {/* ランダム行列生成 */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2 dark:text-white">ランダム行列生成</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              最小値
            </label>
            <input
              type="number"
              min="-100"
              max="100"
              value={randomMin}
              onChange={(e) => setRandomMin(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              最大値
            </label>
            <input
              type="number"
              min="-100"
              max="100"
              value={randomMax}
              onChange={(e) => setRandomMax(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateRandomMatrix}
              className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              ランダム値で設定
            </button>
          </div>
        </div>
      </div>
      
      {/* 特殊行列生成 */}
      <div>
        <h3 className="text-md font-semibold mb-2 dark:text-white">特殊行列生成</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => generateSpecialMatrix('identity')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            単位行列
          </button>
          
          <button
            onClick={() => generateSpecialMatrix('zeros')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            零行列
          </button>
          
          <button
            onClick={() => generateSpecialMatrix('ones')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            1行列
          </button>
          
          <button
            onClick={() => generateSpecialMatrix('upper')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            上三角行列
          </button>
          
          <button
            onClick={() => generateSpecialMatrix('lower')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            下三角行列
          </button>
          
          <button
            onClick={() => generateSpecialMatrix('diagonal')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            対角行列
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatrixEditor;