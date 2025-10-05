// src/lib/authUtils.js
// Authentication utilities for role management and token refresh

import { supabase } from './supabaseClient';
import { Logger } from '../services/logger';

/**
 * Assign a role to a user (admin only)
 * @param {string} userId - The user ID to assign the role to
 * @param {string} role - The role to assign ('admin', 'teacher', 'student')
 * @returns {Promise<Object>} - Result of the operation
 */
export const assignUserRole = async (userId, role) => {
  try {
    const { data, error } = await supabase.rpc('assign_user_role', {
      target_user_id: userId,
      role_name: role
    });

    if (error) {
      Logger.error('Failed to assign user role:', error);
      throw error;
    }

    Logger.info('User role assigned successfully', { userId, role });
    return { success: true, data };
  } catch (error) {
    Logger.error('Error assigning user role:', error);
    throw error;
  }
};

/**
 * Remove a role from a user (admin only)
 * @param {string} userId - The user ID to remove the role from
 * @param {string} role - The role to remove
 * @returns {Promise<Object>} - Result of the operation
 */
export const removeUserRole = async (userId, role) => {
  try {
    const { data, error } = await supabase.rpc('remove_user_role', {
      target_user_id: userId,
      role_name: role
    });

    if (error) {
      Logger.error('Failed to remove user role:', error);
      throw error;
    }

    Logger.info('User role removed successfully', { userId, role });
    return { success: true, data };
  } catch (error) {
    Logger.error('Error removing user role:', error);
    throw error;
  }
};

/**
 * Assign a specific permission to a user (admin only)
 * @param {string} userId - The user ID to assign the permission to
 * @param {string} permission - The permission to assign
 * @param {string} resource - Optional resource the permission applies to
 * @returns {Promise<Object>} - Result of the operation
 */
export const assignUserPermission = async (userId, permission, resource = null) => {
  try {
    const { data, error } = await supabase.rpc('assign_user_permission', {
      target_user_id: userId,
      permission_name: permission,
      resource_name: resource
    });

    if (error) {
      Logger.error('Failed to assign user permission:', error);
      throw error;
    }

    Logger.info('User permission assigned successfully', { userId, permission, resource });
    return { success: true, data };
  } catch (error) {
    Logger.error('Error assigning user permission:', error);
    throw error;
  }
};

/**
 * Remove a specific permission from a user (admin only)
 * @param {string} userId - The user ID to remove the permission from
 * @param {string} permission - The permission to remove
 * @param {string} resource - Optional resource the permission applies to
 * @returns {Promise<Object>} - Result of the operation
 */
export const removeUserPermission = async (userId, permission, resource = null) => {
  try {
    const { data, error } = await supabase.rpc('remove_user_permission', {
      target_user_id: userId,
      permission_name: permission,
      resource_name: resource
    });

    if (error) {
      Logger.error('Failed to remove user permission:', error);
      throw error;
    }

    Logger.info('User permission removed successfully', { userId, permission, resource });
    return { success: true, data };
  } catch (error) {
    Logger.error('Error removing user permission:', error);
    throw error;
  }
};

/**
 * Refresh the current user's JWT token to get updated roles/permissions
 * @returns {Promise<Object>} - The refreshed session
 */
export const refreshUserToken = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      Logger.error('Failed to refresh user token:', error);
      throw error;
    }

    Logger.info('User token refreshed successfully');
    return data;
  } catch (error) {
    Logger.error('Error refreshing user token:', error);
    throw error;
  }
};

/**
 * Get all users with their roles and permissions (admin only)
 * @returns {Promise<Array>} - Array of users with their roles and permissions
 */
export const getUsersWithRoles = async () => {
  try {
    const { data, error } = await supabase
      .from('user_roles_view')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      Logger.error('Failed to fetch users with roles:', error);
      throw error;
    }

    Logger.info('Users with roles fetched successfully');
    return data;
  } catch (error) {
    Logger.error('Error fetching users with roles:', error);
    throw error;
  }
};

/**
 * Check if the current user has admin privileges
 * @returns {boolean} - True if the user is an admin
 */
export const isCurrentUserAdmin = () => {
  const user = supabase.auth.getUser();
  const roles = user?.app_metadata?.roles || [];
  return roles.includes('admin');
};

/**
 * Get current user's roles from JWT
 * @returns {string[]} - Array of user roles
 */
export const getCurrentUserRoles = () => {
  const user = supabase.auth.getUser();
  return user?.app_metadata?.roles || [];
};

/**
 * Get current user's permissions from JWT
 * @returns {string[]} - Array of user permissions
 */
export const getCurrentUserPermissions = () => {
  const user = supabase.auth.getUser();
  return user?.app_metadata?.permissions || [];
};
