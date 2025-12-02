import './Input.css';

const Input = ({ 
  label,
  error,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const inputId = id || name;

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`input ${error ? 'input--error' : ''}`}
        {...props}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;
