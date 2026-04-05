export default function Select({ label, id, options = [], className = '', ...props }) {
  return (
    <div className={`form-field ${className}`}>
      {label && <label htmlFor={id} className="form-label">{label}</label>}
      <select id={id} className="form-input form-select" {...props}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
