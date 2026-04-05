export default function Textarea({ label, id, className = '', rows = 4, ...props }) {
  return (
    <div className={`form-field ${className}`}>
      {label && <label htmlFor={id} className="form-label">{label}</label>}
      <textarea id={id} className="form-input form-textarea" rows={rows} {...props} />
    </div>
  );
}
