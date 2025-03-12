import React, { useState, useEffect } from 'react';
import { useMatrixContext } from '@/store/MatrixContext';

const StatusBar: React.FC = () => {
  const { state } = useMatrixContext();
  const [statusMessage, setStatusMessage] = useState<string>("準備完了");
  
  // 選択された要素に基づいてステータスメッセージを更新
  useEffect(() => {
    if (state.lastSelectedCell) {
      const [matrixName, row, col] = state.lastSelectedCell;
      const matrix = state.matrices[matrixName];
      
      if (matrix && row < matrix.rows && col < matrix.cols) {
        const value = matrix.values[row][col];
        setStatusMessage(`行列: ${matrixName}, 行: ${row}, 列: ${col}, 値: ${value}`);
      }
    } else if (state.selectedMatrix) {
      const matrix = state.matrices[state.selectedMatrix];
      setStatusMessage(`行列 '${state.selectedMatrix}' を選択しました (${matrix.rows}x${matrix.cols})`);
    } else if (state.selectedArrow !== null) {
      const arrow = state.arrows[state.selectedArrow];
      const source = `${arrow.source[0]}[${arrow.source[1]},${arrow.source[2]}]`;
      const target = `${arrow.target[0]}[${arrow.target[1]},${arrow.target[2]}]`;
      setStatusMessage(`矢印 ${source} → ${target} を選択しました`);
    } else if (state.selectedColoredCell !== null) {
      const cell = state.coloredCells[state.selectedColoredCell];
      setStatusMessage(`色付き要素 ${cell.matrix}[${cell.row},${cell.col}] を選択しました`);
    } else {
      setStatusMessage("準備完了");
    }
  }, [state.lastSelectedCell, state.selectedMatrix, state.selectedArrow, state.selectedColoredCell, state.matrices, state.arrows, state.coloredCells]);
  
  return (
    <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-300 dark:border-gray-600">
      {statusMessage}
    </div>
  );
};

export default StatusBar;