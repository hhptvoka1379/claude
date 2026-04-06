import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', icon: '\u{1F4CA}', label: 'Dashboard' },
  { to: '/calendar', icon: '\u{1F4C5}', label: 'Calendar' },
  { to: '/subjects', icon: '\u{1F4DA}', label: 'Subjects' },
  { to: '/essays', icon: '\u{270F}\u{FE0F}', label: 'Essays' },
  { to: '/exercises', icon: '\u{1F3C3}', label: 'Exercises' },
  { to: '/sessions', icon: '\u{23F1}\u{FE0F}', label: 'Sessions' },
  { to: '/gamification', icon: '\u{1F3AE}', label: 'Gamification' },
  { to: '/pcto', icon: '\u{1F4CB}', label: 'PCTO' },
  { to: '/journal', icon: '\u{1F4D4}', label: 'Journal' },
  { to: '/prompts', icon: '\u{1F916}', label: 'Prompt Library' },
  { to: '/settings', icon: '\u{2699}\u{FE0F}', label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Maturit&agrave; 2026</h2>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
