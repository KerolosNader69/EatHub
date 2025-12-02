import './Card.css';

const Card = ({ 
  children, 
  onClick, 
  className = '',
  hoverable = true,
  ...props 
}) => {
  return (
    <div
      className={`card ${hoverable ? 'card--hoverable' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
