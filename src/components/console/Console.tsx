import React, { useState, useRef } from 'react';
import { useMatrixContext, Matrix, Arrow, ColoredCell } from '@/store/MatrixContext';

const Console: React.FC = () => {
  const { state, dispatch } = useMatrixContext();
  const [consoleInput, setConsoleInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const historyRef = useRef<HTMLDivElement>(null);

  // コンソールに入力されたコマンドを実行
  const executeCommands = () => {
    if (!consoleInput.trim()) return;

    // 履歴に追加
    const newHistory = [...history, `> ${consoleInput}`];
    
    // 各行をコマンドとして処理
    const commands = consoleInput.split('\n');
    let successCount = 0;
    let errorCount = 0;
    
    newHistory.push(`==== コマンド実行開始 (${commands.length}行) ====`);
    
    for (const command of commands) {
      const trimmedCommand = command.trim();
      if (!trimmedCommand || trimmedCommand.startsWith('#')) {
        // 空行やコメント行はスキップ
        continue;
      }
      
      try {
        const result = parseAndExecuteCommand(trimmedCommand);
        newHistory.push(`  結果: ${result || 'コマンド実行成功'}`);
        successCount++;
      } catch (error) {
        newHistory.push(`  エラー: ${(error as Error).message}`);
        errorCount++;
      }
    }
    
    newHistory.push(`==== 実行完了: 成功 ${successCount}, 失敗 ${errorCount} ====`);
    setHistory(newHistory);
    
    // 履歴を最下部にスクロール
    setTimeout(() => {
      if (historyRef.current) {
        historyRef.current.scrollTop = historyRef.current.scrollHeight;
      }
    }, 0);
    
    // 入力をクリア
    setConsoleInput('');
  };

  // サンプルコマンドを読み込む
  const loadSampleCommand = (command: string) => {
    setConsoleInput(command);
  };

  // 履歴をクリア
  const clearHistory = () => {
    setHistory([]);
  };

  // コマンドを解析して実行
  const parseAndExecuteCommand = (command: string): string => {
    // 行列定義: A := [3, 3] @ (0, 0)
    if (command.includes(':=') && command.includes('@')) {
      const parts = command.split(':=');
      const matrixName = parts[0].trim();
      
      // 予約語チェック
      const reservedWords = ['+', '-', '*', '^', 'Det', 'Tr', '='];
      if (reservedWords.includes(matrixName)) {
        throw new Error(`'${matrixName}' は予約語のため、行列名として使用できません。`);
      }
      
      // サイズと位置の抽出
      const sizePos = parts[1].trim();
      const sizePart = sizePos.split('@')[0].trim();
      const posPart = sizePos.split('@')[1].trim();
      
      // サイズの解析 [rows, cols]
      const sizeMatch = sizePart.match(/\[(\d+),\s*(\d+)\]/);
      if (!sizeMatch) {
        throw new Error('行列サイズの形式が正しくありません。例: [3, 3]');
      }
      
      const rows = parseInt(sizeMatch[1]);
      const cols = parseInt(sizeMatch[2]);
      
      // 位置の解析 (x, y)
      const posMatch = posPart.match(/\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)/);
      if (!posMatch) {
        throw new Error('位置の形式が正しくありません。例: (0, 0)');
      }
      
      const posX = parseFloat(posMatch[1]);
      const posY = parseFloat(posMatch[2]);
      
      // 行列の値を設定
      const values: number[][] = [];
      let counter = 1;
      for (let i = 0; i < rows; i++) {
        const row: number[] = [];
        for (let j = 0; j < cols; j++) {
          row.push(counter++);
        }
        values.push(row);
      }
      
      // 行列を追加
      const newMatrix: Matrix = {
        values,
        position: [posX, posY],
        rows,
        cols
      };
      
      dispatch({
        type: 'ADD_MATRIX',
        name: matrixName,
        matrix: newMatrix
      });
      
      return `行列 '${matrixName}' を作成しました (${rows}x${cols})`;
    }
    
    // 矢印定義: A[0][0] -> B[1][1] : red
    else if (command.includes('->') && command.includes('[') && command.includes(']')) {
      const parts = command.split('->');
      const sourcePart = parts[0].trim();
      const targetParts = parts[1].trim().split(':');
      const targetPart = targetParts[0].trim();
      
      // 色の抽出
      let color = 'red';  // デフォルト
      if (targetParts.length > 1) {
        color = targetParts[1].trim();
      }
      
      // 始点の解析 A[i][j]
      const sourceMatch = sourcePart.match(/([A-Za-z0-9_]+)\[(\d+)\]\[(\d+)\]/);
      if (!sourceMatch) {
        throw new Error('始点の形式が正しくありません。例: A[0][0]');
      }
      
      const sourceMatrix = sourceMatch[1];
      const sourceRow = parseInt(sourceMatch[2]);
      const sourceCol = parseInt(sourceMatch[3]);
      
      // 終点の解析 B[k][l]
      const targetMatch = targetPart.match(/([A-Za-z0-9_]+)\[(\d+)\]\[(\d+)\]/);
      if (!targetMatch) {
        throw new Error('終点の形式が正しくありません。例: B[1][1]');
      }
      
      const targetMatrix = targetMatch[1];
      const targetRow = parseInt(targetMatch[2]);
      const targetCol = parseInt(targetMatch[3]);
      
      // 行列の存在チェック
      if (!(sourceMatrix in state.matrices)) {
        throw new Error(`始点行列 '${sourceMatrix}' が定義されていません。`);
      }
      if (!(targetMatrix in state.matrices)) {
        throw new Error(`終点行列 '${targetMatrix}' が定義されていません。`);
      }
      
      // インデックスの範囲チェック
      const sourceMatrixData = state.matrices[sourceMatrix];
      const targetMatrixData = state.matrices[targetMatrix];
      
      if (sourceRow < 0 || sourceRow >= sourceMatrixData.rows || 
          sourceCol < 0 || sourceCol >= sourceMatrixData.cols) {
        throw new Error(`始点の位置が範囲外です。行: 0-${sourceMatrixData.rows - 1}, 列: 0-${sourceMatrixData.cols - 1}`);
      }
      if (targetRow < 0 || targetRow >= targetMatrixData.rows || 
          targetCol < 0 || targetCol >= targetMatrixData.cols) {
        throw new Error(`終点の位置が範囲外です。行: 0-${targetMatrixData.rows - 1}, 列: 0-${targetMatrixData.cols - 1}`);
      }
      
      // 矢印を追加
      const newArrow: Arrow = {
        source: [sourceMatrix, sourceRow, sourceCol],
        target: [targetMatrix, targetRow, targetCol],
        color,
        style: '-|>',  // デフォルトスタイル
        width: 2.0     // デフォルト太さ
      };
      
      dispatch({
        type: 'ADD_ARROW',
        arrow: newArrow
      });
      
      return `矢印 ${sourceMatrix}[${sourceRow}][${sourceCol}] → ${targetMatrix}[${targetRow}][${targetCol}] を追加しました`;
    }
    
    // 要素の色設定: A[0][0] : red
    else if (command.includes(':') && command.includes('[') && command.includes(']') && !command.includes('->')) {
      const parts = command.split(':');
      const cellPart = parts[0].trim();
      const color = parts[1].trim();
      
      // セルの解析 A[i][j]
      const cellMatch = cellPart.match(/([A-Za-z0-9_]+)\[(\d+)\]\[(\d+)\]/);
      if (!cellMatch) {
        throw new Error('要素の形式が正しくありません。例: A[0][0]');
      }
      
      const matrixName = cellMatch[1];
      const row = parseInt(cellMatch[2]);
      const col = parseInt(cellMatch[3]);
      
      // 行列の存在チェック
      if (!(matrixName in state.matrices)) {
        throw new Error(`行列 '${matrixName}' が定義されていません。`);
      }
      
      // インデックスの範囲チェック
      const matrix = state.matrices[matrixName];
      
      if (row < 0 || row >= matrix.rows || col < 0 || col >= matrix.cols) {
        throw new Error(`要素の位置が範囲外です。行: 0-${matrix.rows - 1}, 列: 0-${matrix.cols - 1}`);
      }
      
      // 色が "none" でなければ新しい色設定を追加
      if (color.toLowerCase() !== 'none') {
        const newCell: ColoredCell = {
          matrix: matrixName,
          row,
          col,
          color
        };
        
        dispatch({
          type: 'ADD_COLORED_CELL',
          cell: newCell
        });
        
        return `要素 ${matrixName}[${row}][${col}] の色を '${color}' に設定しました`;
      } else {
        // "none" の場合は既存の色設定を削除
        const existingCellIndex = state.coloredCells.findIndex(
          (cell) => cell.matrix === matrixName && cell.row === row && cell.col === col
        );
        
        if (existingCellIndex !== -1) {
          dispatch({
            type: 'DELETE_COLORED_CELL',
            index: existingCellIndex
          });
        }
        
        return `要素 ${matrixName}[${row}][${col}] の色を削除しました`;
      }
    }
    
    // 値設定: A[0][0] = 5
    else if (command.includes('=') && command.includes('[') && command.includes(']') && !command.includes('->')) {
      const parts = command.split('=');
      const cellPart = parts[0].trim();
      const valuePart = parts[1].trim();
      
      // セルの解析 A[i][j]
      const cellMatch = cellPart.match(/([A-Za-z0-9_]+)\[(\d+)\]\[(\d+)\]/);
      if (!cellMatch) {
        throw new Error('要素の形式が正しくありません。例: A[0][0]');
      }
      
      const matrixName = cellMatch[1];
      const row = parseInt(cellMatch[2]);
      const col = parseInt(cellMatch[3]);
      
      // 行列の存在チェック
      if (!(matrixName in state.matrices)) {
        throw new Error(`行列 '${matrixName}' が定義されていません。`);
      }
      
      // インデックスの範囲チェック
      const matrix = state.matrices[matrixName];
      
      if (row < 0 || row >= matrix.rows || col < 0 || col >= matrix.cols) {
        throw new Error(`要素の位置が範囲外です。行: 0-${matrix.rows - 1}, 列: 0-${matrix.cols - 1}`);
      }
      
      // 値を解析
      try {
        // 数値に変換
        const value = valuePart.includes('.')
          ? parseFloat(valuePart)
          : parseInt(valuePart);
        
        // 行列の値を更新
        const updatedMatrix = {
          ...matrix,
          values: matrix.values.map((rowValues, i) =>
            i === row
              ? rowValues.map((cellValue, j) => (j === col ? value : cellValue))
              : rowValues
          )
        };
        
        dispatch({
          type: 'UPDATE_MATRIX',
          name: matrixName,
          matrix: updatedMatrix
        });
        
        return `要素 ${matrixName}[${row}][${col}] の値を '${value}' に設定しました`;
      } catch (error) {
        throw new Error(`値 '${valuePart}' は有効な数値ではありません。`);
      }
    }
    
    else {
      throw new Error('認識できないコマンド形式です。例: A := [3, 3] @ (0, 0), A[0][0] -> B[1][1] : red, A[0][0] : blue');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">コマンドコンソール</h2>
      
      {/* コマンド入力エリア */}
      <div className="mb-4">
        <textarea
          value={consoleInput}
          onChange={(e) => setConsoleInput(e.target.value)}
          className="w-full h-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          placeholder="コマンドを入力してください..."
        />
        
        <div className="flex mt-2 space-x-2">
          <button
            onClick={executeCommands}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            実行
          </button>
          
          <button
            onClick={() => setConsoleInput('')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          >
            クリア
          </button>
        </div>
      </div>
      
      {/* サンプルコマンド */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2 dark:text-white">サンプルコマンド</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => loadSampleCommand('A := [3, 3] @ (0, 0)')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            行列定義
          </button>
          
          <button
            onClick={() => loadSampleCommand('A[0][0] -> B[1][1] : red')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            矢印追加
          </button>
          
          <button
            onClick={() => loadSampleCommand('A[0][0] : lightblue')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            要素の色
          </button>
          
          <button
            onClick={() => loadSampleCommand('A := [2, 2] @ (0, 0)\nB := [2, 2] @ (3, 0)\nA[0][0] -> B[0][0] : green')}
            className="py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            複数コマンド
          </button>
        </div>
      </div>
      
      {/* コマンド履歴 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-semibold dark:text-white">コマンド履歴</h3>
          <button
            onClick={clearHistory}
            className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          >
            履歴をクリア
          </button>
        </div>
        
        <div
          ref={historyRef}
          className="h-48 overflow-y-auto p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono text-sm"
        >
          {history.length > 0 ? (
            history.map((line, index) => (
              <div key={index} className={line.startsWith('  エラー:') ? 'text-red-500' : ''}>
                {line}
              </div>
            ))
          ) : (
            <div className="text-gray-500 dark:text-gray-400">履歴はありません</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Console;