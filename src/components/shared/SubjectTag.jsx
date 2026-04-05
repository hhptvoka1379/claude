export default function SubjectTag({ name, colour }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '10px',
      fontSize: '0.75rem',
      fontWeight: 500,
      background: colour + '18',
      color: colour,
      border: `1px solid ${colour}40`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: colour, flexShrink: 0,
      }} />
      {name}
    </span>
  );
}
