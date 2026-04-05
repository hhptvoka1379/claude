import './ProgressBar.css';

export default function ProgressBar({ value = 0, max = 100, height = 12, colour, showLabel = false, className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`progress-bar ${className}`} style={{ height }}>
      <div
        className="progress-bar__fill"
        style={{
          width: `${pct}%`,
          background: colour || 'var(--colour-accent)',
        }}
      />
      {showLabel && (
        <span className="progress-bar__label mono">{Math.round(pct)}%</span>
      )}
    </div>
  );
}
