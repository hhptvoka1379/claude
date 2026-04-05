import './TopBar.css';

export default function TopBar({ onMenuClick }) {
  return (
    <header className="topbar">
      <button className="topbar-menu" onClick={onMenuClick} aria-label="Open menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <span className="topbar-title">Maturit&agrave; 2026</span>
    </header>
  );
}
