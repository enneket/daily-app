import { useState, useEffect } from 'react';

interface MainEditorProps {
  onOpenSettings: () => void;
  todayReport: string;
  commitStatus: CommitStatus;
  dataLoaded: boolean;
  onDataUpdate: () => Promise<void>;
  onTodayReportUpdate: (report: string) => void;
  onCommitStatusUpdate: (status: CommitStatus) => void;
}

interface CommitStatus {
  pendingCommits: number;
  lastPushTime: number;
  nextPushTime: number;
}

function MainEditor({ 
  onOpenSettings, 
  todayReport, 
  commitStatus, 
  dataLoaded, 
  onDataUpdate,
  onTodayReportUpdate,
  onCommitStatusUpdate 
}: MainEditorProps) {
  // 立即执行的测试日志
  console.log('🎯 [TEST] MainEditor 组件已加载 - 时间:', new Date().toISOString());
  console.log('🎯 [TEST] 这是一个测试日志，如果你看到这个，说明前端代码正常');
  
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const debugLine = `[${timestamp}] ${info}`;
    console.log(debugLine);
    setDebugInfo(prev => [...prev.slice(-9), debugLine]); // 保留最近10条
  };

  useEffect(() => {
    addDebugInfo('🎯 MainEditor 组件已挂载');
    
    // 只保留定时检查，不在组件挂载时加载数据
    
    // 每分钟更新一次提交状态
    const statusInterval = setInterval(async () => {
      try {
        const status = await window.electronAPI.getCommitStatus();
        onCommitStatusUpdate(status);
      } catch (error) {
        console.error('Failed to load commit status:', error);
      }
    }, 60000);
    
    // 每小时检查一次是否需要跨日刷新
    const refreshInterval = setInterval(async () => {
      const now = new Date();
      const lastRefresh = localStorage.getItem('lastTodayReportRefresh');
      const lastRefreshDate = lastRefresh ? new Date(lastRefresh) : null;
      
      // 如果是新的一天，刷新今日内容
      if (!lastRefreshDate || 
          now.toDateString() !== lastRefreshDate.toDateString()) {
        console.log('定时检测到新的一天，刷新今日内容');
        onTodayReportUpdate(''); // 先清空显示
        
        try {
          const result = await window.electronAPI.getTodayReport();
          if (result.success) {
            onTodayReportUpdate(result.content || '');
          } else {
            onTodayReportUpdate('');
          }
          localStorage.setItem('lastTodayReportRefresh', now.toISOString());
        } catch (error) {
          console.error('Failed to load today report:', error);
          onTodayReportUpdate('');
        }
      }
    }, 60 * 60 * 1000); // 每小时检查一次
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(refreshInterval);
    };
  }, [onTodayReportUpdate, onCommitStatusUpdate]);

  const handleSubmit = async () => {
    addDebugInfo('🖱️ handleSubmit 被调用');
    addDebugInfo(`📝 内容长度: ${content.trim().length}`);
    
    if (!content.trim()) {
      addDebugInfo('⚠️ 内容为空，显示错误消息');
      showMessage('error', '请输入日报内容');
      return;
    }

    // 防止重复提交
    if (submitting) {
      addDebugInfo('⚠️ 正在提交中，忽略重复请求');
      return;
    }

    addDebugInfo('🚀 开始提交流程');
    setSubmitting(true);
    try {
      addDebugInfo('📤 调用 window.electronAPI.submitReport');
      const result = await window.electronAPI.submitReport(content);
      addDebugInfo(`📥 收到提交结果: ${JSON.stringify(result)}`);
      
      if (result.success) {
        addDebugInfo('✅ 提交成功');
        showMessage('success', '已保存到本地');
        setContent('');
        addDebugInfo('🔄 开始更新数据');
        await onDataUpdate(); // 使用父组件的更新方法
        addDebugInfo('✅ 数据更新完成');
      } else {
        addDebugInfo(`❌ 提交失败: ${result.error}`);
        showMessage('error', result.error || '提交失败');
      }
    } catch (error: any) {
      addDebugInfo(`💥 提交过程中发生异常: ${error.message}`);
      showMessage('error', error.message || '提交失败');
    } finally {
      addDebugInfo('🏁 提交流程结束');
      setSubmitting(false);
    }
  };

  const handleManualPush = async () => {
    if (commitStatus.pendingCommits === 0) {
      showMessage('error', '没有待提交的内容');
      return;
    }

    setPushing(true);
    try {
      const result = await window.electronAPI.manualPush();
      if (result.success) {
        showMessage('success', `已提交 ${result.pushed} 个更新到 GitHub`);
        // 手动推送后更新提交状态
        try {
          const status = await window.electronAPI.getCommitStatus();
          onCommitStatusUpdate(status);
        } catch (error) {
          console.error('Failed to load commit status:', error);
        }
      } else {
        showMessage('error', result.message || '提交失败');
      }
    } catch (error: any) {
      showMessage('error', error.message || '提交失败');
    } finally {
      setPushing(false);
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

  const formatTimeRemaining = () => {
    if (commitStatus.pendingCommits === 0) return '';
    
    const now = Date.now();
    const remaining = commitStatus.nextPushTime - now;
    
    if (remaining <= 0) return '即将自动提交';
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours} 小时 ${minutes} 分钟后自动提交`;
    }
    return `${minutes} 分钟后自动提交`;
  };

  return (
    <div className="flex flex-col h-full">
      {!dataLoaded ? (
        // 数据未加载时显示加载状态
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-gray-600">加载中...</div>
          </div>
        </div>
      ) : (
        <>
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

          {/* Commit Status */}
          {commitStatus.pendingCommits > 0 && (
            <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-yellow-800 font-medium">
                    📦 待提交：{commitStatus.pendingCommits} 个更新
                  </div>
                  <div className="text-xs text-yellow-700 mt-1">
                    {formatTimeRemaining()}
                  </div>
                </div>
                <button
                  onClick={handleManualPush}
                  disabled={pushing}
                  className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {pushing ? '提交中...' : '立即提交'}
                </button>
              </div>
            </div>
          )}

          {/* Debug Info */}
          {debugInfo.length > 0 && (
            <div className="mx-6 mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-800 font-medium mb-2">调试信息：</div>
              <div className="text-xs text-gray-600 font-mono max-h-32 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index}>{info}</div>
                ))}
              </div>
            </div>
          )}

          {/* Today's Report Preview */}
          <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800 font-medium mb-2">今日已提交内容：</div>
            {todayReport ? (
              <div className="text-sm text-blue-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {todayReport}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                今天还没有提交内容
              </div>
            )}
          </div>

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
        </>
      )}
    </div>
  );
}

export default MainEditor;
