// src/Components/DebugPanel/DebugPanel.jsx
import React, { useState, useEffect } from 'react';
import { logger } from '../../config/config';

/**
 * 🐛 Debug Panel - Production-ready debugging tool
 * เปิดด้วย Ctrl + Shift + D
 */
const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL');

  // Keyboard shortcut: Ctrl + Shift + D
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Auto-refresh logs
  useEffect(() => {
    if (!isOpen) return;

    const refreshLogs = () => {
      const allLogs = logger.getLogs();
      setLogs(allLogs);
    };

    refreshLogs();
    const interval = setInterval(refreshLogs, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.level === filter;
  });

  // Get color for log level
  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'SUCCESS':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'INFO':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          title="เปิด Debug Panel (Ctrl + Shift + D)"
        >
          <span>🐛</span>
          <span className="text-sm font-medium">Debug</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={() => setIsOpen(false)}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl h-3/4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-800">🐛 Debug Panel</h2>
            <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
              {filteredLogs.length} logs
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 p-4 border-b bg-gray-50">
          {['ALL', 'INFO', 'SUCCESS', 'WARNING', 'ERROR'].map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {level}
            </button>
          ))}

          <div className="flex-1" />

          <button
            onClick={() => logger.exportLogs()}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
          >
            <span>📥</span>
            <span>Export</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('ต้องการลบ logs ทั้งหมดหรือไม่?')) {
                logger.clearLogs();
                setLogs([]);
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
          >
            <span>🗑️</span>
            <span>Clear</span>
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            ✕ Close
          </button>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">📭</div>
              <div>ไม่มี logs ที่ตรงกับเงื่อนไข</div>
            </div>
          ) : (
            [...filteredLogs].reverse().map((log, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getLevelColor(log.level)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs px-2 py-0.5 bg-white bg-opacity-70 rounded">
                        {log.level}
                      </span>
                      <span className="text-xs opacity-75">
                        {new Date(log.timestamp).toLocaleString('th-TH')}
                      </span>
                    </div>
                    <div className="font-medium mb-2">{log.message}</div>
                    {log.data && (
                      <pre className="text-xs bg-white bg-opacity-50 p-2 rounded overflow-x-auto border border-gray-200">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-100 text-xs text-gray-600 flex items-center gap-2">
          <span>💡 Tip: กด</span>
          <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">Shift</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">D</kbd>
          <span>เพื่อเปิด/ปิด panel หรือพิมพ์</span>
          <code className="px-2 py-1 bg-white rounded border border-gray-300 font-mono text-xs">
            window.sigmaLogger.printLogs()
          </code>
          <span>ใน console</span>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;