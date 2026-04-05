export default function Badge({ children, colour, variant = 'filled', className = '' }) {
  const style = variant === 'filled'
    ? { background: colour || 'var(--colour-accent)', color: 'white' }
    : { background: 'transparent', color: colour || 'var(--colour-accent)', border: `1px solid ${colour || 'var(--colour-accent)'}` };

  return (
    <span
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '0.75rem',
        fontWeight: 500,
        fontFamily: 'var(--font-body)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
