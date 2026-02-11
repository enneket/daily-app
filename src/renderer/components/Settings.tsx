import { useState } from 'react';
import { GitHubConfig } from '../types';

interface SettingsProps {
  initialConfig: GitHubConfig | null;
  onSave: (config: GitHubConfig) => void;
  onCancel: () => void;
}

function Settings({ initialConfig, onSave, onCancel }: SettingsProps) {
  const [config, setConfig] = useState<GitHubConfig>(
    initialConfig || {
      githubToken: '',
      repoOwner: '',
      repoName: '',
      branch: 'main',
    }
  );
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (field: keyof GitHubConfig, value: string) => {
    setConfig({ ...config, [field]: value });
  };

  const handleTest = async () => {
    setTesting(true);
    setMessage(null);
    
    try {
      await window.electronAPI.saveConfig(config);
      const result = await window.electronAPI.testConnection();
      
      if (result.success) {
        setMessage({ type: 'success', text: '连接成功！' });
      } else {
        setMessage({ type: 'error', text: result.error || '连接失败' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '连接失败' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!config.githubToken || !config.repoOwner || !config.repoName) {
      setMessage({ type: 'error', text: '请填写所有必填项' });
      return;
    }

    setSaving(true);
    try {
      await window.electronAPI.saveConfig(config);
      onSave(config);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">GitHub 配置</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Token *
            </label>
            <input
              type="password"
              value={config.githubToken}
              onChange={(e) => handleChange('githubToken', e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              需要 repo 权限
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              仓库所有者 *
            </label>
            <input
              type="text"
              value={config.repoOwner}
              onChange={(e) => handleChange('repoOwner', e.target.value)}
              placeholder="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              仓库名称 *
            </label>
            <input
              type="text"
              value={config.repoName}
              onChange={(e) => handleChange('repoName', e.target.value)}
              placeholder="daily-reports"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分支名称
            </label>
            <input
              type="text"
              value={config.branch}
              onChange={(e) => handleChange('branch', e.target.value)}
              placeholder="main"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? '测试中...' : '测试连接'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>

        <button
          onClick={onCancel}
          disabled={!initialConfig}
          className="w-full mt-3 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          title={!initialConfig ? '请先保存配置' : ''}
        >
          ← 返回首页
        </button>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">如何获取 GitHub Token？</p>
          <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
            <li>访问 GitHub Settings → Developer settings</li>
            <li>选择 Personal access tokens → Tokens (classic)</li>
            <li>点击 Generate new token (classic)</li>
            <li>勾选 repo 权限</li>
            <li>生成并复制 token</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Settings;
