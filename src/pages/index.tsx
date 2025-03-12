import type { NextPage } from 'next';
import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import StatusBar from '@/components/layout/StatusBar';
import MatrixEditor from '@/components/matrix/MatrixEditor';
import ArrowEditor from '@/components/arrow/ArrowEditor';
import CellEditor from '@/components/cell/CellEditor';
import ExpressionEditor from '@/components/matrix/ExpressionEditor';
import Console from '@/components/console/Console';
import ItemList from '@/components/list/ItemList';
import MatrixVisualization from '@/components/matrix/MatrixVisualization';
import { MatrixProvider } from '@/store/MatrixContext';

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState('matrix');
  
  // タブ切り替え処理
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // タブの定義
  const tabs = [
    { id: 'matrix', label: '行列定義', component: <MatrixEditor /> },
    { id: 'arrow', label: '矢印設定', component: <ArrowEditor /> },
    { id: 'cell', label: '要素設定', component: <CellEditor /> },
    { id: 'expression', label: '行列式', component: <ExpressionEditor /> },
    { id: 'console', label: 'コンソール', component: <Console /> },
    { id: 'list', label: '定義済みリスト', component: <ItemList /> },
  ];
  
  return (
    <MatrixProvider>
      <div>
        <Head>
          <title>行列演算可視化ツール</title>
          <meta name="description" content="行列演算を視覚的に表現するためのウェブツール" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        <Layout>
          {/* Control Panel */}
          <div className="flex flex-col h-full">
            {/* タブナビゲーション */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`py-2 px-4 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* アクティブなタブコンテンツ */}
            <div className="flex-grow overflow-y-auto mt-4">
              {tabs.find(tab => tab.id === activeTab)?.component}
            </div>
          </div>
          
          {/* Visualization Panel */}
          <div className="flex flex-col h-full">
            <div className="flex-grow bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <MatrixVisualization />
            </div>
            <StatusBar />
          </div>
        </Layout>
      </div>
    </MatrixProvider>
  );
};

export default Home;