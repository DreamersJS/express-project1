import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../AppContext.jsx';

export const Authenticated = ({ children }) => {
  const { user } = useContext(AppContext);
  const location = useLocation();

  if (!user) {
    return <Navigate replace to="/login" state={{ from: location }} />
  }

  return (
    <>
      {children}
    </>
  )
}

