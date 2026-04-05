import Sparkline from '../ui/Sparkline';

export default function MetricCard({ label, value, unit = '', arrow, good, sparkData, colour }) {
  const arrowColour = good === true ? 'var(--colour-success)'
    : good === false ? 'var(--colour-error)'
    : 'var(--colour-text-muted)';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 14px',
      background: 'white',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ flex: 1 }}>
        <div className="text-xs text-muted" style={{ marginBottom: '2px' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span className="mono" style={{ fontSize: '1.25rem', fontWeight: 500 }}>{value}</span>
          {unit && <span className="text-xs text-muted">{unit}</span>}
          {arrow && <span style={{ color: arrowColour, fontSize: '0.9rem' }}>
            {arrow} {good !== undefined && <span className="text-xs">({good ? 'good' : 'bad'})</span>}
          </span>}
        </div>
      </div>
      {sparkData && <Sparkline data={sparkData} colour={colour} />}
    </div>
  );
}
