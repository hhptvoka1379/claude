import './Card.css';

export default function Card({ children, colour, onClick, className = '', style = {} }) {
  const cardStyle = {
    ...style,
    ...(colour ? { borderLeftColor: colour } : {}),
  };

  return (
    <div
      className={`card ${onClick ? 'card--clickable' : ''} ${className}`}
      style={cardStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
