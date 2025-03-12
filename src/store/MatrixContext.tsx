import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// 型定義
export interface Matrix {
  values: number[][];
  position: [number, number];
  rows: number;
  cols: number;
}

export interface Arrow {
  source: [string, number, number]; // [行列名, 行, 列]
  target: [string, number, number]; // [行列名, 行, 列]
  color: string;
  style: string;
  width: number;
  label?: string;
}

export interface ColoredCell {
  matrix: string;
  row: number;
  col: number;
  color: string;
}

export interface MatrixState {
  matrices: Record<string, Matrix>;
  arrows: Arrow[];
  coloredCells: ColoredCell[];
  theme: 'light' | 'dark';
  selectedMatrix: string | null;
  selectedArrow: number | null;
  selectedColoredCell: number | null;
  lastSelectedCell: [string, number, number] | null; // [行列名, 行, 列]
}

// アクション型
type MatrixAction =
  | { type: 'ADD_MATRIX'; name: string; matrix: Matrix }
  | { type: 'UPDATE_MATRIX'; name: string; matrix: Matrix }
  | { type: 'RENAME_MATRIX'; oldName: string; newName: string }
  | { type: 'DELETE_MATRIX'; name: string }
  | { type: 'ADD_ARROW'; arrow: Arrow }
  | { type: 'UPDATE_ARROW'; index: number; arrow: Arrow }
  | { type: 'DELETE_ARROW'; index: number }
  | { type: 'ADD_COLORED_CELL'; cell: ColoredCell }
  | { type: 'UPDATE_COLORED_CELL'; index: number; cell: ColoredCell }
  | { type: 'DELETE_COLORED_CELL'; index: number }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SELECT_MATRIX'; name: string | null }
  | { type: 'SELECT_ARROW'; index: number | null }
  | { type: 'SELECT_COLORED_CELL'; index: number | null }
  | { type: 'SET_LAST_SELECTED_CELL'; cell: [string, number, number] | null }
  | { type: 'RESET_DATA' }
  | { type: 'IMPORT_DATA'; data: MatrixState };

// 初期状態
const initialMatrixA: Matrix = {
  values: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ],
  position: [0, 0],
  rows: 3,
  cols: 3
};

const initialMatrixB: Matrix = {
  values: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ],
  position: [5, 0],
  rows: 3,
  cols: 3
};

const initialState: MatrixState = {
  matrices: {
    'A': initialMatrixA,
    'B': initialMatrixB
  },
  arrows: [{
    source: ['A', 0, 0],
    target: ['B', 0, 0],
    color: 'red',
    style: '-|>',
    width: 2.0,
    label: '例'
  }],
  coloredCells: [{
    matrix: 'A',
    row: 1,
    col: 1,
    color: 'lightblue'
  }],
  theme: 'light',
  selectedMatrix: null,
  selectedArrow: null,
  selectedColoredCell: null,
  lastSelectedCell: null
};

// Reducer
function matrixReducer(state: MatrixState, action: MatrixAction): MatrixState {
  switch (action.type) {
    case 'ADD_MATRIX':
      return {
        ...state,
        matrices: {
          ...state.matrices,
          [action.name]: action.matrix
        }
      };
    
    case 'UPDATE_MATRIX':
      return {
        ...state,
        matrices: {
          ...state.matrices,
          [action.name]: action.matrix
        }
      };
    
    case 'RENAME_MATRIX': {
      const { [action.oldName]: oldMatrix, ...remainingMatrices } = state.matrices;
      if (!oldMatrix) return state;

      // 矢印と色付きセルのリファレンスも更新
      const updatedArrows = state.arrows.map(arrow => {
        let source = [...arrow.source] as [string, number, number];
        let target = [...arrow.target] as [string, number, number];
        
        if (source[0] === action.oldName) {
          source[0] = action.newName;
        }
        if (target[0] === action.oldName) {
          target[0] = action.newName;
        }
        
        return { ...arrow, source, target };
      });
      
      const updatedColoredCells = state.coloredCells.map(cell => {
        if (cell.matrix === action.oldName) {
          return { ...cell, matrix: action.newName };
        }
        return cell;
      });
      
      return {
        ...state,
        matrices: {
          ...remainingMatrices,
          [action.newName]: oldMatrix
        },
        arrows: updatedArrows,
        coloredCells: updatedColoredCells
      };
    }
    
    case 'DELETE_MATRIX': {
      const { [action.name]: _, ...remainingMatrices } = state.matrices;
      
      // 関連する矢印と色付きセルも削除
      const updatedArrows = state.arrows.filter(arrow => 
        arrow.source[0] !== action.name && arrow.target[0] !== action.name
      );
      
      const updatedColoredCells = state.coloredCells.filter(cell => 
        cell.matrix !== action.name
      );
      
      return {
        ...state,
        matrices: remainingMatrices,
        arrows: updatedArrows,
        coloredCells: updatedColoredCells
      };
    }
    
    case 'ADD_ARROW':
      return {
        ...state,
        arrows: [...state.arrows, action.arrow]
      };
    
    case 'UPDATE_ARROW': {
      const updatedArrows = [...state.arrows];
      updatedArrows[action.index] = action.arrow;
      return {
        ...state,
        arrows: updatedArrows
      };
    }
    
    case 'DELETE_ARROW': {
      const updatedArrows = state.arrows.filter((_, index) => index !== action.index);
      return {
        ...state,
        arrows: updatedArrows
      };
    }
    
    case 'ADD_COLORED_CELL': {
      // 同じセルに対する既存の色設定を削除
      const filteredCells = state.coloredCells.filter(cell => 
        !(cell.matrix === action.cell.matrix && 
          cell.row === action.cell.row && 
          cell.col === action.cell.col)
      );
      
      return {
        ...state,
        coloredCells: [...filteredCells, action.cell]
      };
    }
    
    case 'UPDATE_COLORED_CELL': {
      const updatedCells = [...state.coloredCells];
      updatedCells[action.index] = action.cell;
      return {
        ...state,
        coloredCells: updatedCells
      };
    }
    
    case 'DELETE_COLORED_CELL': {
      const updatedCells = state.coloredCells.filter((_, index) => index !== action.index);
      return {
        ...state,
        coloredCells: updatedCells
      };
    }
    
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };
    
    case 'SELECT_MATRIX':
      return {
        ...state,
        selectedMatrix: action.name
      };
    
    case 'SELECT_ARROW':
      return {
        ...state,
        selectedArrow: action.index
      };
    
    case 'SELECT_COLORED_CELL':
      return {
        ...state,
        selectedColoredCell: action.index
      };
      
    case 'SET_LAST_SELECTED_CELL':
      return {
        ...state,
        lastSelectedCell: action.cell
      };
    
    case 'RESET_DATA':
      return initialState;
    
    case 'IMPORT_DATA':
      return {
        ...action.data,
        theme: state.theme // テーマは現在の設定を維持
      };
    
    default:
      return state;
  }
}

// Context
type MatrixContextType = {
  state: MatrixState;
  dispatch: React.Dispatch<MatrixAction>;
};

const MatrixContext = createContext<MatrixContextType | undefined>(undefined);

// Provider
export function MatrixProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(matrixReducer, initialState);
  
  return (
    <MatrixContext.Provider value={{ state, dispatch }}>
      {children}
    </MatrixContext.Provider>
  );
}

// カスタムフック
export function useMatrixContext() {
  const context = useContext(MatrixContext);
  if (context === undefined) {
    throw new Error('useMatrixContext must be used within a MatrixProvider');
  }
  return context;
}