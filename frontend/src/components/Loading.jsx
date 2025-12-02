import './Loading.css';

const Loading = ({ 
  size = 'medium', 
  fullScreen = false,
  text = ''
}) => {
  const LoadingSpinner = () => (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div className="loading-spinner-circle"></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <LoadingSpinner />
      </div>
    );
  }

  return <LoadingSpinner />;
};

export default Loading;
