import { useState, useEffect } from 'react';

interface MainEditorProps {
  onOpenSettings: () => void;
}

function MainEditor({ onOpenSettings }: MainEditorProps) {
  const [content, setContent] = useState('');
  const [todayReport, setTodayReport] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadTodayReport();
  }, []);

  const loadTodayReport = async () => {
    try {
      const result = await window.electronAPI.getTodayReport();
      if (result.success && result.content) {
        setTodayReport(result.content);
      }
    } catch (error) {
      console.error('Failed to load today report:', error);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      showMessage('error', '请输入日报内容');
      return;
    }

    setSubmitting(true);
    try {
      const result = await window.electronAPI.submitReport(content);
      if (result.success) {
        showMessage('success', '提交成功！');
        setContent('');
        await loadTodayReport();
      } else {
        showMessage('error', result.error || '提交失败');
      }
    } catch (error: any) {
      showMessage('error', error.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <h1 className="text-xl font-semibold text-gray-800">日报助手</h1>
        <button
          onClick={onOpenSettings}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ⚙️ 设置
        </button>
      </div>

      {/* Today's Report Preview */}
      {todayReport && (
        <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800 font-medium mb-2">今日已提交内容：</div>
          <div className="text-sm text-blue-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
            {todayReport}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入今天的思考、想法等等...&#10;&#10;支持 Markdown 格式&#10;快捷键：Cmd/Ctrl + Enter 提交"
          className="flex-1 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {content.length > 0 && `${content.length} 字符`}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? '提交中...' : '提交'}
          </button>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg animate-fade-in font-medium ${
            message.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

export default MainEditor;
