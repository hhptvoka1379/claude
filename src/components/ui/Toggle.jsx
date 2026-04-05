import './Toggle.css';

export default function Toggle({ label, checked, onChange, id }) {
  return (
    <label className="toggle" htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="toggle-input"
      />
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
      {label && <span className="toggle-label">{label}</span>}
    </label>
  );
}
