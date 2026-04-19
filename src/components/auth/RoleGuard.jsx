import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * RoleGuard component ensures that only users with specific roles can access its children.
 * If a user does not have the required role, they are redirected.
 * 
 * @param {Array<string>} allowedRoles - Array of roles that are permitted (e.g. ['admin', 'editor'])
 * @param {string} redirectTo - Route to redirect to if unauthorized (default: '/dashboard')
 * @param {boolean} hideInsteadOfRedirect - If true, the component will return null instead of redirecting (useful for hiding UI elements)
 */
const RoleGuard = ({ children, allowedRoles = [], redirectTo = '/dashboard', hideInsteadOfRedirect = false }) => {
  const { user } = useAuth();

  if (!user) {
    return hideInsteadOfRedirect ? null : <Navigate to="/login" replace />;
  }

  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(user.role);

  if (!hasAccess) {
    return hideInsteadOfRedirect ? null : <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleGuard;
