import React, { useState, useEffect } from 'react';
import { useMatrixContext, ColoredCell } from '@/store/MatrixContext';

const CellEditor: React.FC = () => {
  const { state, dispatch } = useMatrixContext();
  const [matrixName, setMatrixName] = useState('A');
  const [row, setRow] = useState(0);
  const [col, setCol] = useState(0);
  const [value, setValue] = useState('0');
  const [color, setColor] = useState('lightblue');
  const [rangeStartRow, setRangeStartRow] = useState(0);
  const [rangeStartCol, setRangeStartCol] = useState(0);
  const [rangeEndRow, setRangeEndRow] = useState(0);
  const [rangeEndCol, setRangeEndCol] = useState(0);
  const [rangeColor, setRangeColor] = useState('lightblue');

  // 選択された色付きセルが変更されたら、フォームの値を更新
  useEffect(() => {
    if (state.selectedColoredCell !== null && state.coloredCells[state.selectedColoredCell]) {
      const cell = state.coloredCells[state.selectedColoredCell];
      setMatrixName(cell.matrix);
      setRow(cell.row);
      setCol(cell.col);
      setColor(cell.color);
      
      // 値も更新
      if (cell.matrix in state.matrices) {
        const matrix = state.matrices[cell.matrix];
        if (cell.row < matrix.rows && cell.col < matrix.cols) {
          setValue(matrix.values[cell.row][cell.col].toString());
        }
      }
      
      // 範囲フォームも更新
      setRangeStartRow(cell.row);
      setRangeStartCol(cell.col);
      setRangeEndRow(cell.row);
      setRangeEndCol(cell.col);
      setRangeColor(cell.color);
    }
  }, [state.selectedColoredCell, state.coloredCells, state.matrices]);

  // 最後に選択されたセルが変更されたら、フォームの値を更新
  useEffect(() => {
    if (state.lastSelectedCell) {
      const [matrix, r, c] = state.lastSelectedCell;
      setMatrixName(matrix);
      setRow(r);
      setCol(c);
      
      // 値も更新
      if (matrix in state.matrices) {
        const matrixData = state.matrices[matrix];
        if (r < matrixData.rows && c < matrixData.cols) {
          setValue(matrixData.values[r][c].toString());
        }
      }
    }
  }, [state.lastSelectedCell, state.matrices]);

  // 色選択ダイアログを開く
  const handleColorClick = (setter: React.Dispatch<React.SetStateAction<string>>, currentColor: string) => {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = currentColor.startsWith('#') ? currentColor : '#ADD8E6'; // lighblueのデフォルト
    
    input.addEventListener('change', (e) => {
      setter((e.target as HTMLInputElement).value);
    });
    
    input.click();
  };

  // セルの値と色を更新
  const handleUpdateCell = () => {
    // 行列が存在するか確認
    if (!(matrixName in state.matrices)) {
      alert(`行列 '${matrixName}' が定義されていません。`);
      return;
    }

    // インデックスが有効か確認
    const matrix = state.matrices[matrixName];
    
    if (row < 0 || row >= matrix.rows || col < 0 || col >= matrix.cols) {
      alert(`要素の位置が範囲外です。行: 0-${matrix.rows - 1}, 列: 0-${matrix.cols - 1}`);
      return;
    }

    // 値を更新
    try {
      const newValue = value.includes('.') ? parseFloat(value) : parseInt(value);
      
      // 行列の値を更新
      const updatedMatrix = {
        ...matrix,
        values: matrix.values.map((rowValues, i) =>
          i === row
            ? rowValues.map((cellValue, j) => (j === col ? newValue : cellValue))
            : rowValues
        )
      };
      
      dispatch({
        type: 'UPDATE_MATRIX',
        name: matrixName,
        matrix: updatedMatrix
      });
      
      // 色を更新（noneの場合は削除）
      if (color.toLowerCase() !== 'none') {
        const newCell: ColoredCell = {
          matrix: matrixName,
          row,
          col,
          color
        };
        
        // 既存のセルを更新または新規追加
        dispatch({
          type: 'ADD_COLORED_CELL',
          cell: newCell
        });
      } else {
        // 既存の色付きセルを探す
        const existingCellIndex = state.coloredCells.findIndex(
          (cell) => cell.matrix === matrixName && cell.row === row && cell.col === col
        );
        
        if (existingCellIndex !== -1) {
          dispatch({
            type: 'DELETE_COLORED_CELL',
            index: existingCellIndex
          });
        }
      }
      
      // 色付きセルの選択を解除
      dispatch({
        type: 'SELECT_COLORED_CELL',
        index: null
      });
    } catch (error) {
      alert('値は数値である必要があります。');
    }
  };

  // 範囲に色を適用
  const handleApplyColorToRange = () => {
    // 行列が存在するか確認
    if (!(matrixName in state.matrices)) {
      alert(`行列 '${matrixName}' が定義されていません。`);
      return;
    }

    // 範囲の確認
    const matrix = state.matrices[matrixName];
    
    // 値が範囲内かチェック
    if (rangeStartRow < 0 || rangeStartRow >= matrix.rows ||
        rangeStartCol < 0 || rangeStartCol >= matrix.cols ||
        rangeEndRow < 0 || rangeEndRow >= matrix.rows ||
        rangeEndCol < 0 || rangeEndCol >= matrix.cols) {
      alert(`範囲が行列の境界外です。行: 0-${matrix.rows - 1}, 列: 0-${matrix.cols - 1}`);
      return;
    }

    // 始点 <= 終点になるように整理
    const startRow = Math.min(rangeStartRow, rangeEndRow);
    const endRow = Math.max(rangeStartRow, rangeEndRow);
    const startCol = Math.min(rangeStartCol, rangeEndCol);
    const endCol = Math.max(rangeStartCol, rangeEndCol);

    // 色を更新（noneの場合は削除）
    if (rangeColor.toLowerCase() !== 'none') {
      // 範囲内の各セルに色を適用
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const newCell: ColoredCell = {
            matrix: matrixName,
            row: r,
            col: c,
            color: rangeColor
          };
          
          dispatch({
            type: 'ADD_COLORED_CELL',
            cell: newCell
          });
        }
      }
    } else {
      // 範囲内の既存の色付きセルを削除
      state.coloredCells.forEach((cell, index) => {
        if (cell.matrix === matrixName &&
            cell.row >= startRow && cell.row <= endRow &&
            cell.col >= startCol && cell.col <= endCol) {
          dispatch({
            type: 'DELETE_COLORED_CELL',
            index
          });
        }
      });
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">要素設定</h2>
      
      {/* 要素設定フォーム */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            行列
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
            min="0"
            max="9"
            value={row}
            onChange={(e) => setRow(parseInt(e.target.value))}
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
            value={col}
            onChange={(e) => setCol(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            値
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>
        
        <div className="col-span-2">
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
              onClick={() => handleColorClick(setColor, color)}
              className="px-4 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              style={{ backgroundColor: color }}
            >
              <span className="sr-only">色選択</span>
            </button>
          </div>
        </div>
        
        <div className="col-span-3">
          <button
            onClick={handleUpdateCell}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            設定
          </button>
        </div>
      </div>
      
      {/* 範囲選択フォーム */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2 dark:text-white">範囲選択</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              始点行
            </label>
            <input
              type="number"
              min="0"
              max="9"
              value={rangeStartRow}
              onChange={(e) => setRangeStartRow(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              始点列
            </label>
            <input
              type="number"
              min="0"
              max="9"
              value={rangeStartCol}
              onChange={(e) => setRangeStartCol(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              終点行
            </label>
            <input
              type="number"
              min="0"
              max="9"
              value={rangeEndRow}
              onChange={(e) => setRangeEndRow(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              終点列
            </label>
            <input
              type="number"
              min="0"
              max="9"
              value={rangeEndCol}
              onChange={(e) => setRangeEndCol(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>
          
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              色
            </label>
            <div className="flex mt-1">
              <input
                type="text"
                value={rangeColor}
                onChange={(e) => setRangeColor(e.target.value)}
                className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
              <button
                onClick={() => handleColorClick(setRangeColor, rangeColor)}
                className="px-4 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                style={{ backgroundColor: rangeColor }}
              >
                <span className="sr-only">色選択</span>
              </button>
            </div>
          </div>
          
          <div className="col-span-1">
            <button
              onClick={handleApplyColorToRange}
              className="w-full h-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              範囲に適用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CellEditor;