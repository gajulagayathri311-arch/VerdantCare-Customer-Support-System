import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, role }) {

  const { user } = useAuth();


  // User is not logged in
  if (!user) {

    return <Navigate to="/login" />;

  }


  // User has wrong role
  if (role && user.role !== role) {

    return <Navigate to="/" />;

  }


  return children;
}

export default ProtectedRoute;