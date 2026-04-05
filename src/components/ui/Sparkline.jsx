const BLOCKS = ['\u2581', '\u2582', '\u2583', '\u2584', '\u2585', '\u2586', '\u2587', '\u2588'];

export default function Sparkline({ data = [], colour = 'var(--colour-accent)' }) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return (
    <span className="mono" style={{ color: colour, fontSize: '0.85rem', letterSpacing: '1px' }}>
      {data.map((v, i) => {
        const idx = Math.round(((v - min) / range) * (BLOCKS.length - 1));
        return <span key={i}>{BLOCKS[idx]}</span>;
      })}
    </span>
  );
}
