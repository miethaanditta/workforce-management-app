import { Navigate } from 'react-router-dom';
import { getUser } from './auth.storage';

type Props = {
  role: 'ADMIN' | 'USER';
  children: JSX.Element;
};

export const RequireRole = ({ role, children }: Props) => {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/403" replace />;
  }

  return children;
};
