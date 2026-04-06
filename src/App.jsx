import { useState, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const navigate = useNavigate();

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useKeyboardShortcuts([
    { key: '?', handler: () => setShowShortcuts(prev => !prev) },
    { key: 'Escape', handler: () => setShowShortcuts(false) },
    { key: 'k', ctrl: true, handler: () => navigate('/') },
    { key: 'j', ctrl: true, handler: () => navigate('/journal') },
    { key: '1', ctrl: true, handler: () => navigate('/subjects') },
    { key: '2', ctrl: true, handler: () => navigate('/calendar') },
    { key: ',', ctrl: true, handler: () => navigate('/settings') },
  ]);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <TopBar onMenuClick={() => setSidebarOpen(true)} />
      <main className="app-main">
        <Outlet />
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card-hover)',
          },
        }}
      />
      {showShortcuts && (
        <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="shortcuts-content" onClick={e => e.stopPropagation()}>
            <h3>Keyboard Shortcuts</h3>
            <div className="shortcuts-list">
              {[
                ['Ctrl + K', 'Dashboard'],
                ['Ctrl + J', 'New journal entry'],
                ['Ctrl + 1', 'Subjects'],
                ['Ctrl + 2', 'Calendar'],
                ['Ctrl + ,', 'Settings'],
                ['?', 'Show this help'],
                ['Esc', 'Close modal / overlay'],
              ].map(([key, desc]) => (
                <div className="shortcut-row" key={key}>
                  <span>{desc}</span>
                  <span className="shortcut-key">{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
