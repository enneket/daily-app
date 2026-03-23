import { useState, useEffect } from 'react';
import MainEditor from './components/MainEditor';
import Settings from './components/Settings';
import { GitHubConfig } from './types';

interface CommitStatus {
  pendingCommits: number;
  lastPushTime: number;
  lastCommitTime: number;
  nextPushTime: number;
}

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<GitHubConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // 提升的状态
  const [todayReport, setTodayReport] = useState('');
  const [commitStatus, setCommitStatus] = useState<CommitStatus>({
    pendingCommits: 0,
    lastPushTime: 0,
    lastCommitTime: 0,
    nextPushTime: 0
  });
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  // 只在配置加载完成且数据未加载时加载数据
  useEffect(() => {
    if (config && !dataLoaded && !showSettings) {
      loadInitialData();
    }
  }, [config, dataLoaded, showSettings]);

  const loadConfig = async () => {
    try {
      const savedConfig = await window.electronAPI.getConfig();
      if (savedConfig) {
        setConfig(savedConfig);
      } else {
        setShowSettings(true);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadTodayReport(),
        loadCommitStatus()
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setDataLoaded(true);
    }
  };

  const loadTodayReport = async () => {
    try {
      // 跨日检查
      const now = new Date();
      const lastRefresh = localStorage.getItem('lastTodayReportRefresh');
      const lastRefreshDate = lastRefresh ? new Date(lastRefresh) : null;

      // 如果是新的一天，清空显示并重新加载
      if (!lastRefreshDate ||
        now.toDateString() !== lastRefreshDate.toDateString()) {
        setTodayReport('');
        localStorage.setItem('lastTodayReportRefresh', now.toISOString());
      }

      const result = await window.electronAPI.getTodayReport();
      if (result.success) {
        setTodayReport(result.content || '');
      } else {
        setTodayReport('');
      }
    } catch (error) {
      console.error('Failed to load today report:', error);
      setTodayReport('');
    }
  };

  const loadCommitStatus = async () => {
    try {
      const status = await window.electronAPI.getCommitStatus();
      setCommitStatus(status);
    } catch (error) {
      console.error('Failed to load commit status:', error);
    }
  };

  const handleSaveConfig = async (newConfig: GitHubConfig) => {
    setConfig(newConfig);
    setShowSettings(false);
    // 配置保存后重新加载数据
    setDataLoaded(false);
  };

  const handleDataUpdate = async () => {
    // 当数据需要更新时调用
    await Promise.all([
      loadTodayReport(),
      loadCommitStatus()
    ]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      {showSettings ? (
        <Settings
          initialConfig={config}
          onSave={handleSaveConfig}
          onCancel={() => setShowSettings(false)}
        />
      ) : (
        <MainEditor
          onOpenSettings={() => setShowSettings(true)}
          todayReport={todayReport}
          commitStatus={commitStatus}
          dataLoaded={dataLoaded}
          onDataUpdate={handleDataUpdate}
          onTodayReportUpdate={setTodayReport}
          onCommitStatusUpdate={setCommitStatus}
        />
      )}
    </div>
  );
}

export default App;
