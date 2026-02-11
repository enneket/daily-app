import { useState, useEffect } from 'react';
import MainEditor from './components/MainEditor';
import Settings from './components/Settings';
import { GitHubConfig } from './types';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<GitHubConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

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

  const handleSaveConfig = async (newConfig: GitHubConfig) => {
    setConfig(newConfig);
    setShowSettings(false);
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
          onCancel={() => config && setShowSettings(false)}
        />
      ) : (
        <MainEditor onOpenSettings={() => setShowSettings(true)} />
      )}
    </div>
  );
}

export default App;
