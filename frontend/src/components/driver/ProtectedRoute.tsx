import { Navigate } from 'react-router-dom';
import { sessionManager } from '../../utils/sessionManager';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!sessionManager.isDriverAuthenticated()) {
    return <Navigate to="/partner" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 