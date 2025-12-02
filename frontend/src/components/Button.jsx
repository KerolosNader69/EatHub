import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  disabled = false, 
  onClick, 
  type = 'button',
  className = '',
  ...props 
}) => {
  return (
    <button
      type={type}
      className={`btn btn--${variant} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
