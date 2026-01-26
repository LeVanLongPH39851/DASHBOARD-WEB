const ErrorState = ({ message = 'Error loading data' }) => (
  <div className="error">{message}</div>
);

export default ErrorState;