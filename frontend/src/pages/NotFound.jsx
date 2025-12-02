import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-message">
          Oops! The page you're looking for doesn't exist.
        </p>
        <button 
          className="btn-home"
          onClick={() => navigate('/menu')}
        >
          Go to Menu
        </button>
      </div>
    </div>
  );
};

export default NotFound;
