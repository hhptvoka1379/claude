import './Button.css';

export default function Button({
  children, onClick, variant = 'primary', size = 'md',
  type = 'button', disabled = false, className = '', ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
