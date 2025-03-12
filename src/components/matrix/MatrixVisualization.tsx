import React, { useRef, useEffect, useState } from 'react';
import { useMatrixContext } from '@/store/MatrixContext';

// 色変換ユーティリティ
interface RGB {
  r: number;
  g: number;
  b: number;
}

const hexToRgb = (hex: string): RGB | null => {
  // 名前付き色をHEXに変換する辞書（一部のみ）
  const namedColors: Record<string, string> = {
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
    yellow: '#FFFF00',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    black: '#000000',
    white: '#FFFFFF',
    gray: '#808080',
    grey: '#808080',
    lightblue: '#ADD8E6',
    lightcyan: '#E0FFFF',
    lightgreen: '#90EE90',
    lightgrey: '#D3D3D3',
    lightpink: '#FFB6C1',
    lightyellow: '#FFFFE0',
    orange: '#FFA500',
    pink: '#FFC0CB',
    purple: '#800080',
    violet: '#EE82EE',
    brown: '#A52A2A',
  };

  let hexColor = hex.toLowerCase();
  if (namedColors[hexColor]) {
    hexColor = namedColors[hexColor];
  }

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

interface CanvasMousePosition {
  x: number;
  y: number;
  dataX: number;
  dataY: number;
}

const MatrixVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { state, dispatch } = useMatrixContext();
  const [mousePosition, setMousePosition] = useState<CanvasMousePosition | null>(null);
  const [scale, setScale] = useState(40); // ピクセル/単位
  const [offset, setOffset] = useState({ x: 50, y: 50 }); // キャンバスオフセット
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 座標変換関数
  const canvasToData = (x: number, y: number): [number, number] => {
    const dataX = (x - offset.x) / scale;
    const dataY = (y - offset.y) / scale;
    return [dataX, -dataY]; // Y軸は反転
  };

  const dataToCanvas = (x: number, y: number): [number, number] => {
    const canvasX = x * scale + offset.x;
    const canvasY = -y * scale + offset.y;
    return [canvasX, canvasY];
  };

  // マウス移動ハンドラ
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const [dataX, dataY] = canvasToData(x, y);

    setMousePosition({ x, y, dataX, dataY });

    // ドラッグ中の処理
    if (isDragging) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x, y });
      return;
    }

    // セルの位置を特定
    for (const [name, matrix] of Object.entries(state.matrices)) {
      const posX = matrix.position[0];
      const posY = matrix.position[1];
      const rows = matrix.rows;
      const cols = matrix.cols;

      // マウスがこの行列の範囲内にあるか確認
      if (
        posX <= dataX && dataX < posX + cols &&
        posY <= -dataY && -dataY < posY + rows
      ) {
        // インデックスを計算
        const i = Math.floor(-dataY - posY);
        const j = Math.floor(dataX - posX);

        if (i >= 0 && i < rows && j >= 0 && j < cols) {
          // 選択したセルを記録
          dispatch({
            type: 'SET_LAST_SELECTED_CELL',
            cell: [name, i, j]
          });
          return;
        }
      }
    }

    // 行列外の場合
    dispatch({
      type: 'SET_LAST_SELECTED_CELL',
      cell: null
    });
  };

  // マウスダウンハンドラ
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 右クリックの場合はドラッグ開始
    if (e.button === 2) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasRef.current!.getBoundingClientRect().left, y: e.clientY - canvasRef.current!.getBoundingClientRect().top });
    }
  };

  // マウスアップハンドラ
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ズーム処理
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale(prev => Math.min(prev * 1.1, 100));
    } else {
      setScale(prev => Math.max(prev / 1.1, 10));
    }
  };

  // ダブルクリックで行列を選択
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mousePosition) return;

    for (const [name, matrix] of Object.entries(state.matrices)) {
      const posX = matrix.position[0];
      const posY = matrix.position[1];
      const rows = matrix.rows;
      const cols = matrix.cols;

      // マウスがこの行列の範囲内にあるか確認
      if (
        posX <= mousePosition.dataX && mousePosition.dataX < posX + cols &&
        posY <= -mousePosition.dataY && -mousePosition.dataY < posY + rows
      ) {
        dispatch({ type: 'SELECT_MATRIX', name });
        return;
      }
    }
  };

  // 右クリックメニューを無効化
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // 描画ロジック
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスのサイズを設定
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // 高解像度ディスプレイ対応
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // キャンバスをクリア
    ctx.fillStyle = state.theme === 'light' ? '#f0f0f0' : '#2d2d2d';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // グリッド描画
    drawGrid(ctx, rect.width, rect.height);

    // 行列を描画
    drawMatrices(ctx);

    // 色付きセルを描画
    drawColoredCells(ctx);

    // 矢印を描画
    drawArrows(ctx);

    // 選択された要素をハイライト
    highlightSelectedElements(ctx);

    // カーソル上のセル情報表示
    if (state.lastSelectedCell) {
      drawCellInfo(ctx);
    }
  }, [state.matrices, state.arrows, state.coloredCells, state.theme, 
      state.selectedMatrix, state.selectedArrow, state.selectedColoredCell, 
      state.lastSelectedCell, scale, offset]);

  // リサイズ対応
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初期化時にも実行

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // グリッド描画
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.beginPath();
    ctx.strokeStyle = state.theme === 'light' ? '#ddd' : '#444';
    ctx.lineWidth = 1;

    // 横線
    for (let y = offset.y % scale; y < height; y += scale) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    // 縦線
    for (let x = offset.x % scale; x < width; x += scale) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    ctx.stroke();
  };

  // 行列の描画
  const drawMatrices = (ctx: CanvasRenderingContext2D) => {
    for (const [name, matrix] of Object.entries(state.matrices)) {
      const { position, values, rows, cols } = matrix;
      const [posX, posY] = position;

      // 行列の背景
      ctx.fillStyle = state.theme === 'light' ? '#f8f8f8' : '#2a2a2a';
      ctx.strokeStyle = state.theme === 'light' ? '#000' : '#888';
      ctx.lineWidth = 1;

      const [startX, startY] = dataToCanvas(posX, -posY);
      const [endX, endY] = dataToCanvas(posX + cols, -(posY + rows));
      const width = endX - startX;
      const height = endY - startY;
      
      ctx.fillRect(startX - 5, startY - 5, width + 10, height + 10);
      ctx.strokeRect(startX - 5, startY - 5, width + 10, height + 10);

      // 行列のセルを描画
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const [cellX, cellY] = dataToCanvas(posX + j, -(posY + i));
          
          // セルの背景
          ctx.fillStyle = state.theme === 'light' ? '#fff' : '#3a3a3a';
          ctx.fillRect(cellX, cellY, scale, scale);
          
          // セルの枠
          ctx.strokeStyle = state.theme === 'light' ? '#000' : '#555';
          ctx.strokeRect(cellX, cellY, scale, scale);
          
          // セルの値
          const value = values[i][j];
          ctx.fillStyle = state.theme === 'light' ? '#000' : '#fff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            value.toString(), 
            cellX + scale / 2, 
            cellY + scale / 2
          );
        }
      }

      // 行列名を表示
      ctx.fillStyle = state.theme === 'light' ? '#000' : '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(name, startX - 10, startY - 10);
    }
  };

  // 色付きセルの描画
  const drawColoredCells = (ctx: CanvasRenderingContext2D) => {
    for (const cell of state.coloredCells) {
      const { matrix: matrixName, row, col, color } = cell;
      const matrix = state.matrices[matrixName];
      
      if (!matrix) continue;
      
      const [posX, posY] = matrix.position;
      const [cellX, cellY] = dataToCanvas(posX + col, -(posY + row));
      
      // 色付きセルの背景
      ctx.fillStyle = color;
      ctx.fillRect(cellX, cellY, scale, scale);
      
      // セルの枠
      ctx.strokeStyle = state.theme === 'light' ? '#000' : '#555';
      ctx.lineWidth = 1;
      ctx.strokeRect(cellX, cellY, scale, scale);
      
      // セルの値
      const value = matrix.values[row][col];
      
      // 色の輝度に基づいてテキスト色を選択
      const rgb = hexToRgb(color);
      const brightness = rgb 
        ? (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
        : 128;
      
      ctx.fillStyle = brightness > 128 ? '#000' : '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        value.toString(), 
        cellX + scale / 2, 
        cellY + scale / 2
      );
    }
  };

  // 矢印の描画
  const drawArrows = (ctx: CanvasRenderingContext2D) => {
    for (const arrow of state.arrows) {
      const { source, target, color, style, width, label } = arrow;
      const [sourceName, sourceRow, sourceCol] = source;
      const [targetName, targetRow, targetCol] = target;
      
      const sourceMatrix = state.matrices[sourceName];
      const targetMatrix = state.matrices[targetName];
      
      if (!sourceMatrix || !targetMatrix) continue;
      
      const [sourcePosX, sourcePosY] = sourceMatrix.position;
      const [targetPosX, targetPosY] = targetMatrix.position;
      
      // 始点と終点の座標を計算
      const [startX, startY] = dataToCanvas(
        sourcePosX + sourceCol + 0.5, 
        -(sourcePosY + sourceRow + 0.5)
      );
      
      const [endX, endY] = dataToCanvas(
        targetPosX + targetCol + 0.5, 
        -(targetPosY + targetRow + 0.5)
      );
      
      // 矢印を描画
      drawArrow(ctx, startX, startY, endX, endY, color, width, style);
      
      // ラベルがあれば表示
      if (label) {
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const offsetX = (endY - startY) * 0.1;
        const offsetY = (startX - endX) * 0.1;
        
        ctx.fillStyle = state.theme === 'light' ? '#fff' : '#2a2a2a';
        ctx.beginPath();
        ctx.ellipse(midX + offsetX, midY + offsetY, 
                   ctx.measureText(label).width / 2 + 5, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = color;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, midX + offsetX, midY + offsetY);
      }
    }
  };

  // 矢印描画ヘルパー
  const drawArrow = (
    ctx: CanvasRenderingContext2D, 
    fromX: number, fromY: number, 
    toX: number, toY: number, 
    color: string, lineWidth: number, 
    style: string
  ) => {
    const headLength = 10; // 矢印の頭の長さ
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    // 矢印の軸を描画
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    
    // 曲線の場合
    if (style.includes('arc')) {
      const cp1x = fromX + (toX - fromX) * 0.25;
      const cp1y = fromY;
      const cp2x = toX - (toX - fromX) * 0.25;
      const cp2y = toY;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toX, toY);
    } else {
      // 直線の場合
      ctx.lineTo(toX, toY);
    }
    ctx.stroke();
    
    // 矢印の頭を描画
    if (style.includes('>')) {
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 7),
        toY - headLength * Math.sin(angle - Math.PI / 7)
      );
      ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 7),
        toY - headLength * Math.sin(angle + Math.PI / 7)
      );
      ctx.lineTo(toX, toY);
      ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 7),
        toY - headLength * Math.sin(angle - Math.PI / 7)
      );
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
    }
    
    // 両方向矢印
    if (style.includes('<-')) {
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(
        fromX + headLength * Math.cos(angle - Math.PI / 7),
        fromY + headLength * Math.sin(angle - Math.PI / 7)
      );
      ctx.lineTo(
        fromX + headLength * Math.cos(angle + Math.PI / 7),
        fromY + headLength * Math.sin(angle + Math.PI / 7)
      );
      ctx.lineTo(fromX, fromY);
      ctx.lineTo(
        fromX + headLength * Math.cos(angle - Math.PI / 7),
        fromY + headLength * Math.sin(angle - Math.PI / 7)
      );
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
    }
    
    // 終端のスタイル
    if (style.includes('|')) {
      // "|" 終端
      const perpAngle = angle + Math.PI / 2;
      const perpLength = 5;
      
      ctx.beginPath();
      ctx.moveTo(
        toX - 5 * Math.cos(angle) + perpLength * Math.cos(perpAngle),
        toY - 5 * Math.sin(angle) + perpLength * Math.sin(perpAngle)
      );
      ctx.lineTo(
        toX - 5 * Math.cos(angle) - perpLength * Math.cos(perpAngle),
        toY - 5 * Math.sin(angle) - perpLength * Math.sin(perpAngle)
      );
      ctx.stroke();
    }
    
    ctx.restore();
  };

  // 選択された要素のハイライト
  const highlightSelectedElements = (ctx: CanvasRenderingContext2D) => {
    // 選択された行列をハイライト
    if (state.selectedMatrix && state.matrices[state.selectedMatrix]) {
      const matrix = state.matrices[state.selectedMatrix];
      const [posX, posY] = matrix.position;
      const [startX, startY] = dataToCanvas(posX, -posY);
      const [endX, endY] = dataToCanvas(posX + matrix.cols, -(posY + matrix.rows));
      
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(startX - 10, startY - 10, endX - startX + 20, endY - startY + 20);
      ctx.setLineDash([]);
    }
    
    // 選択された矢印をハイライト
    if (state.selectedArrow !== null && state.arrows[state.selectedArrow]) {
      const arrow = state.arrows[state.selectedArrow];
      const [sourceName, sourceRow, sourceCol] = arrow.source;
      const [targetName, targetRow, targetCol] = arrow.target;
      
      const sourceMatrix = state.matrices[sourceName];
      const targetMatrix = state.matrices[targetName];
      
      if (sourceMatrix && targetMatrix) {
        const [sourcePosX, sourcePosY] = sourceMatrix.position;
        const [targetPosX, targetPosY] = targetMatrix.position;
        
        const [startX, startY] = dataToCanvas(
          sourcePosX + sourceCol, 
          -(sourcePosY + sourceRow)
        );
        
        const [endX, endY] = dataToCanvas(
          targetPosX + targetCol, 
          -(targetPosY + targetRow)
        );
        
        // 始点と終点のセルをハイライト
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, scale, scale);
        
        ctx.strokeStyle = 'red';
        ctx.strokeRect(endX, endY, scale, scale);
      }
    }
    
    // 選択された色付きセルをハイライト
    if (state.selectedColoredCell !== null && state.coloredCells[state.selectedColoredCell]) {
      const cell = state.coloredCells[state.selectedColoredCell];
      const matrix = state.matrices[cell.matrix];
      
      if (matrix) {
        const [posX, posY] = matrix.position;
        const [cellX, cellY] = dataToCanvas(posX + cell.col, -(posY + cell.row));
        
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 3;
        ctx.strokeRect(cellX, cellY, scale, scale);
      }
    }
  };

  // カーソル上のセル情報表示
  const drawCellInfo = (ctx: CanvasRenderingContext2D) => {
    if (!state.lastSelectedCell) return;
    
    const [matrixName, row, col] = state.lastSelectedCell;
    const matrix = state.matrices[matrixName];
    
    if (!matrix) return;
    
    const value = matrix.values[row][col];
    
    // 情報テキストを描画
    ctx.fillStyle = state.theme === 'light' ? '#fff' : '#333';
    ctx.strokeStyle = state.theme === 'light' ? '#000' : '#999';
    ctx.lineWidth = 1;
    
    const text = `行列: ${matrixName}, 行: ${row}, 列: ${col}, 値: ${value}`;
    ctx.font = '12px Arial';
    
    const textWidth = ctx.measureText(text).width;
    const textHeight = 20;
    const padding = 5;
    
    const rectX = 10;
    const rectY = 10;
    
    // 背景と枠を描画
    ctx.fillRect(rectX, rectY, textWidth + 2 * padding, textHeight + 2 * padding);
    ctx.strokeRect(rectX, rectY, textWidth + 2 * padding, textHeight + 2 * padding);
    
    // テキストを描画
    ctx.fillStyle = state.theme === 'light' ? '#000' : '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, rectX + padding, rectY + padding + textHeight / 2);
  };

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full bg-gray-100 dark:bg-gray-800"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    />
  );
};

export default MatrixVisualization;