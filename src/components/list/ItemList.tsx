import React from 'react';
import { useMatrixContext } from '@/store/MatrixContext';

const ItemList: React.FC = () => {
  const { state, dispatch } = useMatrixContext();

  // 行列を選択
  const handleMatrixSelect = (name: string) => {
    dispatch({
      type: 'SELECT_MATRIX',
      name
    });
  };

  // 行列を削除
  const handleMatrixDelete = (name: string) => {
    if (confirm(`行列 '${name}' を削除しますか？`)) {
      dispatch({
        type: 'DELETE_MATRIX',
        name
      });
    }
  };

  // 行列を複製
  const handleMatrixDuplicate = (name: string) => {
    if (!(name in state.matrices)) return;

    // 新しい行列名を生成
    let newName = name + '_copy';
    let counter = 1;
    while (newName in state.matrices) {
      counter++;
      newName = `${name}_copy${counter}`;
    }

    // 行列データをコピー
    const originalData = state.matrices[name];
    const newMatrix = {
      ...originalData,
      position: [originalData.position[0] + 1, originalData.position[1] + 1] // 少しずらす
    };

    dispatch({
      type: 'ADD_MATRIX',
      name: newName,
      matrix: newMatrix
    });
  };

  // 矢印を選択
  const handleArrowSelect = (index: number) => {
    dispatch({
      type: 'SELECT_ARROW',
      index
    });
  };

  // 矢印を削除
  const handleArrowDelete = (index: number) => {
    const arrow = state.arrows[index];
    if (!arrow) return;

    const source = `${arrow.source[0]}[${arrow.source[1]},${arrow.source[2]}]`;
    const target = `${arrow.target[0]}[${arrow.target[1]},${arrow.target[2]}]`;

    if (confirm(`矢印 ${source} → ${target} を削除しますか？`)) {
      dispatch({
        type: 'DELETE_ARROW',
        index
      });
    }
  };

  // 色付きセルを選択
  const handleColoredCellSelect = (index: number) => {
    dispatch({
      type: 'SELECT_COLORED_CELL',
      index
    });
  };

  // 色付きセルを削除
  const handleColoredCellDelete = (index: number) => {
    const cell = state.coloredCells[index];
    if (!cell) return;

    if (confirm(`色付き要素 ${cell.matrix}[${cell.row},${cell.col}] を削除しますか？`)) {
      dispatch({
        type: 'DELETE_COLORED_CELL',
        index
      });
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">定義済みリスト</h2>
      
      {/* 定義済み行列 */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2 dark:text-white">定義済み行列</h3>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-1 max-h-40 overflow-y-auto">
          {Object.entries(state.matrices).length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(state.matrices).map(([name, matrix]) => (
                <li 
                  key={name}
                  className={`p-2 flex justify-between items-center ${
                    state.selectedMatrix === name 
                      ? 'bg-blue-100 dark:bg-blue-900' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div 
                    onClick={() => handleMatrixSelect(name)}
                    className="flex-grow cursor-pointer"
                  >
                    <span className="dark:text-white">{name}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      ({matrix.rows}x{matrix.cols}) - 位置: ({matrix.position[0]}, {matrix.position[1]})
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleMatrixDuplicate(name)}
                      className="p-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                      title="複製"
                    >
                      複製
                    </button>
                    <button
                      onClick={() => handleMatrixDelete(name)}
                      className="p-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                      title="削除"
                    >
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-gray-500 dark:text-gray-400">定義済み行列はありません</div>
          )}
        </div>
      </div>
      
      {/* 定義済み矢印 */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2 dark:text-white">定義済み矢印</h3>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-1 max-h-32 overflow-y-auto">
          {state.arrows.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {state.arrows.map((arrow, index) => (
                <li 
                  key={index}
                  className={`p-2 flex justify-between items-center ${
                    state.selectedArrow === index 
                      ? 'bg-blue-100 dark:bg-blue-900' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div 
                    onClick={() => handleArrowSelect(index)}
                    className="flex-grow cursor-pointer"
                  >
                    <span className="dark:text-white">
                      {index + 1}: {arrow.source[0]}[{arrow.source[1]},{arrow.source[2]}] 
                      → {arrow.target[0]}[{arrow.target[1]},{arrow.target[2]}]
                    </span>
                    <span 
                      className="ml-2 inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: arrow.color }}
                    ></span>
                  </div>
                  <button
                    onClick={() => handleArrowDelete(index)}
                    className="p-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    title="削除"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-gray-500 dark:text-gray-400">定義済み矢印はありません</div>
          )}
        </div>
      </div>
      
      {/* 色付き要素 */}
      <div>
        <h3 className="text-md font-semibold mb-2 dark:text-white">色付き要素</h3>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-1 max-h-32 overflow-y-auto">
          {state.coloredCells.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {state.coloredCells.map((cell, index) => {
                // セルの値を取得
                let value = "?";
                if (cell.matrix in state.matrices) {
                  const matrix = state.matrices[cell.matrix];
                  if (cell.row < matrix.rows && cell.col < matrix.cols) {
                    value = matrix.values[cell.row][cell.col].toString();
                  }
                }
                
                return (
                  <li 
                    key={index}
                    className={`p-2 flex justify-between items-center ${
                      state.selectedColoredCell === index 
                        ? 'bg-blue-100 dark:bg-blue-900' 
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div 
                      onClick={() => handleColoredCellSelect(index)}
                      className="flex-grow cursor-pointer"
                    >
                      <span className="dark:text-white">
                        {index + 1}: {cell.matrix}[{cell.row},{cell.col}] = {value}
                      </span>
                      <span 
                        className="ml-2 inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: cell.color }}
                      ></span>
                    </div>
                    <button
                      onClick={() => handleColoredCellDelete(index)}
                      className="p-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                      title="削除"
                    >
                      削除
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-2 text-gray-500 dark:text-gray-400">色付き要素はありません</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemList;