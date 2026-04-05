export default function Input({ label, id, className = '', ...props }) {
  return (
    <div className={`form-field ${className}`}>
      {label && <label htmlFor={id} className="form-label">{label}</label>}
      <input id={id} className="form-input" {...props} />
    </div>
  );
}
