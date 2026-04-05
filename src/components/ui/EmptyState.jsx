export default function EmptyState({ icon = '', title, description, action }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      color: 'var(--colour-text-muted)',
    }}>
      {icon && <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{icon}</div>}
      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--colour-text)', marginBottom: '6px' }}>{title}</h3>
      {description && <p style={{ fontSize: '0.9rem', maxWidth: '400px', marginBottom: '16px' }}>{description}</p>}
      {action}
    </div>
  );
}
