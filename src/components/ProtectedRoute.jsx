import React, { useCallback, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";

/**
 * Enhanced ProtectedRoute component with advanced security features
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if access is granted
 * @param {string|string[]} props.requiredRoles - Role(s) required to access the route
 * @param {string|string[]} props.requiredPermissions - Permission(s) required to access the route
 * @param {React.ReactNode} props.fallback - Component to render if access is denied
 * @param {string} props.redirectTo - Path to redirect to if access is denied (defaults to /login)
 * @param {boolean} props.requireAll - If true, user must have ALL required roles/permissions (default: true)
 * @param {string[]} props.allowRoles - Alternative to requiredRoles (more semantic)
 * @param {string[]} props.denyRoles - Roles that should be denied access
 * @param {React.ReactNode} props.fallbackElement - Alternative to fallback prop
 * @param {boolean} props.cacheChecks - Cache permission/role checks for performance (default: true)
 * @param {number} props.cacheTimeout - Cache timeout in milliseconds (default: 30000)
 */
const ProtectedRoute = ({
  children,
  // Existing props
  requiredRoles = [],
  requiredPermissions = [],
  fallback = null,
  redirectTo = '/login',
  requireAll = true,
  // New declarative aliases
  allowRoles,
  denyRoles,
  fallbackElement,
  // Performance props
  cacheChecks = true,
  cacheTimeout = 30000,
}) => {
  const { user, loading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Cache for permission/role checks
  const checkCache = useMemo(() => new Map(), []);

  /**
   * Cached role/permission checker with performance optimization
   */
  const checkAccess = useCallback((type, value) => {
    if (!cacheChecks) {
      return type === 'role' ? hasRole(value) : hasPermission(value);
    }

    const cacheKey = `${type}:${value}`;
    const cached = checkCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cacheTimeout) {
      return cached.result;
    }

    const result = type === 'role' ? hasRole(value) : hasPermission(value);

    checkCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    return result;
  }, [hasRole, hasPermission, cacheChecks, cacheTimeout, checkCache]);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 animate-pulse"></div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Verificando autenticação...
          </p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Prefer new alias allowRoles over requiredRoles
  const effectiveRequiredRoles = allowRoles ?? requiredRoles;

  // Convert to arrays for consistent handling
  const roles = Array.isArray(effectiveRequiredRoles) ? effectiveRequiredRoles : [effectiveRequiredRoles].filter(Boolean);
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions].filter(Boolean);

  // Check role requirements with caching
  const hasRequiredRoles = roles.length === 0 || (requireAll
    ? roles.every(role => checkAccess('role', role))
    : roles.some(role => checkAccess('role', role))
  );

  // Check permission requirements with caching
  const hasRequiredPermissions = permissions.length === 0 || (requireAll
    ? permissions.every(permission => checkAccess('permission', permission))
    : permissions.some(permission => checkAccess('permission', permission))
  );

  // Deny list check with caching
  const deny = Array.isArray(denyRoles) ? denyRoles : (denyRoles ? [denyRoles] : []).filter(Boolean);
  const isDenied = deny.length > 0 && deny.some(role => checkAccess('role', role));

  // Handle denied access
  if (isDenied) {
    return fallbackElement ?? fallback ?? (
      <Navigate to="/unauthorized" state={{ from: location, reason: 'denyRoles' }} replace />
    );
  }

  // Grant access if both role and permission checks pass
  if (hasRequiredRoles && hasRequiredPermissions) {
    return <>{children}</>;
  }

  // Render fallback component or redirect
  if (fallbackElement || fallback) {
    return <>{fallbackElement ?? fallback}</>;
  }

  // Default: redirect to unauthorized page with context
  return (
    <Navigate
      to="/unauthorized"
      state={{
        from: location,
        requiredRoles: roles,
        requiredPermissions: permissions,
        missingRoles: roles.filter(role => !checkAccess('role', role)),
        missingPermissions: permissions.filter(permission => !checkAccess('permission', permission))
      }}
      replace
    />
  );
};

export default ProtectedRoute;
