import { supabase } from '@/lib/supabaseClient';

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

/**
 * Notification Types
 * @readonly
 * @enum {string}
 */
export const NotificationType = Object.freeze({
  EVENT: 'event',
  ASSIGNMENT: 'assignment',
  ANNOUNCEMENT: 'announcement',
  SYSTEM: 'system',
  FEEDBACK: 'feedback',
  REMINDER: 'reminder',
  /**
   * Notification Priority Levels
   * @readonly
   * @enum {string}
   */
  export const NotificationPriority = Object.freeze({
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
  });

  /**
   * Notification Categories
   * Common categories for organizing notifications
   */
  export const NotificationCategory = Object.freeze({
    // General
    SYSTEM_UPDATE: 'system_update',
    ACCOUNT: 'account',

    // Academic
    COURSE: 'course',
    ASSIGNMENT: 'assignment',
    EXAM: 'exam',
    GRADE: 'grade',

    // Social
    MENTION: 'mention',
    COMMENT: 'comment',
    MESSAGE: 'message',

    // Administrative
    ANNOUNCEMENT: 'announcement',
    REMINDER: 'reminder',
    ALERT: 'alert'
  });

  /**
   * Notification Status
   * @readonly
   * @enum {string}
   */
  export const NotificationStatus = Object.freeze({
    UNREAD: 'unread',
    READ: 'read',
    ARCHIVED: 'archived'
  });

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Sleep utility for retry delays
   */
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Retry wrapper for Supabase operations
   */
  const withRetry = async (operation, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === retries - 1) throw error;
        if (typeof userId !== 'string' || !userId.trim()) {
          throw new Error('Invalid user ID format');
        }
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'Notifications marked as unread successfully',
        affected: data?.length || 0,
        data,
        error: null
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error in markAsUnread:', errorMessage, error);
      return {
        success: false,
        message: errorMessage,
        affected: 0,
        data: null,
        error: error instanceof Error ? error : new Error(errorMessage)
      };
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<boolean>} - True if successful
   */
  async markAllAsRead() {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('is_read', false);

    if (error) {
      throw error;
    }

    return true;
  },

  /**
   * Delete one or more notifications
   * @param {string|string[]} notificationIds - Single ID or array of notification IDs to delete
   * @param {Object} [options] - Additional options
   * @param {string} [options.userId] - Optional user ID for additional security check
   * @returns {Promise<{success: boolean, message: string, deleted: number}>} - Result of the operation
   */
  async deleteNotification(notificationIds, { userId } = {}) {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
  
  const { data, error } = await supabase.rpc('bulk_delete_notifications', {
    p_notification_ids: ids,
    p_user_id: userId || undefined
  });
  
  if (error) throw error;
  return data;
  },
  
  /**
   * Get notification statistics for the current user
   * @returns {Promise<{
   *   total: number,
   *   unread: number,
   *   read: number,
   *   types: Object<string, {total: number, unread: number, read: number}>,
   *   lastNotificationAt: string|null
   * }>} - Notification statistics
   */
  async getNotificationStats() {
    const { data, error } = await supabase.rpc('get_user_notification_stats', {
      p_user_id: supabase.auth.user()?.id
    });
    
    if (error) throw error;
    
    // Parse the JSONB response
    const stats = typeof data === 'string' ? JSON.parse(data) : data;
    
    return {
      total: stats.total || 0,
      unread: stats.unread || 0,
      read: stats.read || 0,
      types: stats.types || {},
      lastNotificationAt: stats.last_notification_at || null
    };
  },
  
  /**
   * Get the count of unread notifications
   * @returns {Promise<number>} - Count of unread notifications
   */
  async getUnreadCount() {
    const stats = await this.getNotificationStats();
    return stats.unread || 0;
  },

  /**
   * Delete all notifications
   * @param {Object} options - Delete options
   * @param {boolean} [options.readOnly=false] - Delete only read notifications
   * @param {string} [options.type] - Delete only notifications of this type
   * @returns {Promise<boolean>} - True if successful
   */
  async deleteAllNotifications({ readOnly = false, type } = {}) {
    let query = supabase.from('notifications').delete();
    
    if (readOnly) {
      query = query.eq('is_read', true);
    }
    
    if (type) {
      query = query.eq('type', type);
    }

    const { error } = await query;

    if (error) {
      throw error;
    }

    return true;
  },

  /**
   * Get the user's notification preferences
   * @returns {Promise<Object>} - The user's notification preferences
   */
  async getNotificationPreferences() {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .single();

    // If no preferences exist, create default ones
    if (error && error.code === 'PGRST116') {
      return this.createDefaultPreferences();
    }
    
    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Update the user's notification preferences
   * @param {Object} updates - The updates to apply
   * @returns {Promise<Object>} - The updated preferences
   */
  async updateNotificationPreferences(updates) {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert(updates, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Create default notification preferences for the current user
   * @private
   */
  async createDefaultPreferences() {
    const defaultPrefs = {
      email_notifications: true,
      push_notifications: true,
      in_app_notifications: true,
      email_frequency: 'immediate'
    };

    const { data, error } = await supabase
      .from('notification_preferences')
      .insert(defaultPrefs)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Subscribe to real-time notifications
   * @param {Function} callback - Function to call when a new notification is received
   * @returns {Function} - Function to unsubscribe
   */
  async subscribeToNotifications(callback) {
    // Get the current user ID
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (!userId) {
      return () => {};
    }

    // Create the subscription
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (typeof callback === 'function') {
            callback(payload.new);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(subscription);
    };
  },

  /**
   * Schedule a notification
   * @param {Object} notification - The notification to schedule
   * @param {string} notification.title - Notification title
   * @param {string} notification.message - Notification message
   * @param {string} notification.type - Notification type (from NotificationType)
   * @param {string} [notification.category] - Notification category (from NotificationCategory)
   * @param {string} [notification.priority='normal'] - Priority level (from NotificationPriority)
   * @param {string} [notification.referenceId] - ID of the referenced item
   * @param {string} [notification.referenceType] - Type of the referenced item
   * @param {string} [notification.actionUrl] - URL to navigate to when clicked
   * @param {Object} [notification.metadata] - Additional metadata for the notification
   * @param {string|Date} [scheduledFor] - When to schedule the notification for (Date object or ISO string)
   * @param {string} [userId] - Optional user ID (defaults to current user)
   * @returns {Promise<Object>} - The scheduled notification
   */
  async scheduleNotification(notification, scheduledFor = null, userId = null) {
    const {
      title,
      message,
      type,
      category,
      priority = NotificationPriority.NORMAL,
      referenceId,
      referenceType,
      actionUrl,
      metadata = {}
    } = notification;

    // Validate type
    if (!Object.values(NotificationType).includes(type)) {
      throw new Error(`Invalid notification type: ${type}`);
    }

    // Validate priority
    if (priority && !Object.values(NotificationPriority).includes(priority)) {
      throw new Error(`Invalid priority: ${priority}`);
    }

    const notificationData = {
      title,
      message,
      type,
      category: category || null,
      priority,
      reference_id: referenceId || null,
      reference_type: referenceType || null,
      action_url: actionUrl || null,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
      scheduled_for: scheduledFor
        ? (scheduledFor instanceof Date ? scheduledFor.toISOString() : scheduledFor)
        : null,
      user_id: userId || supabase.auth.user()?.id
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Create and send a notification immediately
   * @param {Object} notification - The notification to send
   * @param {string} notification.title - Notification title
   * @param {string} notification.message - Notification message
   * @param {string} notification.type - Notification type (from NotificationType)
   * @param {string} [notification.category] - Notification category (from NotificationCategory)
   * @param {string} [notification.priority='normal'] - Priority level (from NotificationPriority)
   * @param {string} [notification.referenceId] - ID of the referenced item
   * @param {string} [notification.referenceType] - Type of the referenced item
   * @param {string} [notification.actionUrl] - URL to navigate to when clicked
   * @param {Object} [notification.metadata] - Additional metadata for the notification
   * @param {string} [userId] - Optional user ID (defaults to current user)
   * @returns {Promise<Object>} - The created notification
   */
  async sendNotification(notification, userId = null) {
    return this.scheduleNotification(notification, null, userId);
  },

  /**
   * Create and send multiple notifications at once
   * @param {Array} notifications - Array of notification objects
   * @param {string} [userId] - Optional user ID (defaults to current user)
   * @returns {Promise<Array>} - Array of created notifications
   */
  async sendBatchNotifications(notifications, userId = null) {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return [];
    }

    const targetUserId = userId || supabase.auth.user()?.id;
    const timestamp = new Date().toISOString();

    // Prepare notifications for batch insert
    const notificationData = notifications.map(notification => ({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      category: notification.category || null,
      priority: notification.priority || NotificationPriority.NORMAL,
      reference_id: notification.referenceId || null,
      reference_type: notification.referenceType || null,
      action_url: notification.actionUrl || null,
      metadata: notification.metadata || null,
      user_id: targetUserId,
      created_at: timestamp,
      updated_at: timestamp
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select();

    if (error) throw error;

    return data || [];
  },

  /**
   * Schedule a reminder notification for an event or meeting
   * @param {Object} options - Reminder options
   * @param {string} options.type - The type of event (e.g., 'meeting', 'event', 'assignment')
   * @param {string} options.eventId - The ID of the event
   * @param {string|Date} options.dueAt - When the event is scheduled for
   * @param {Object} options.notification - The notification to send
   * @param {number} [options.remindBeforeMinutes=15] - How many minutes before the event to send the reminder
   * @param {string} [options.userId] - Optional user ID (defaults to current user)
   * @returns {Promise<Object>} - The scheduled notification
   */
  async scheduleReminder({
    type,
    eventId,
    dueAt,
    notification,
    remindBeforeMinutes = 15,
    userId = null
  }) {
    // Get the current user if no userId is provided
    if (!userId) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      userId = userData.user?.id;
      if (!userId) throw new Error('No user is currently signed in');
    }

    // Calculate when to send the reminder
    const dueDate = typeof dueAt === 'string' ? new Date(dueAt) : dueAt;
    const remindAt = new Date(dueDate.getTime() - (remindBeforeMinutes * 60 * 1000));
    
    // If the reminder time is in the past, don't schedule it
    if (remindAt < new Date()) {
      return null;
    }

    // Add metadata to identify this as a reminder
    const reminderNotification = {
      ...notification,
      metadata: {
        ...notification.metadata,
        isReminder: true,
        eventType: type,
        eventId,
        originalDueAt: dueDate.toISOString(),
        remindBeforeMinutes
      }
    };

    // Schedule the notification
    return await this.scheduleNotification(reminderNotification, remindAt, userId);
  },

  /**
   * Mark one or more notifications as read
   * @param {string|string[]} notificationIds - Single ID or array of notification IDs
   * @param {Object} [options] - Additional options
   * @param {string} [options.userId] - Optional user ID for security check
   * @returns {Promise<{success: boolean, message: string, affected: number, data: any, error: Error|null}>} - Result with data and error if any
   */
  async markAsRead(notificationIds, { userId } = {}) {
    // Input validation
    if (!notificationIds) {
      console.error('markAsRead error: Notification IDs are required');
      return {
        success: false,
        message: 'Notification IDs are required',
        affected: 0,
        data: null,
        error: new Error('Notification IDs are required')
      };
    }
    
    // Convert single ID to array for consistent handling
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
    
    // Validate IDs format
    if (ids.some(id => typeof id !== 'string' || !id.trim())) {
      const error = new Error('Invalid notification ID format');
      console.error('markAsRead error:', error.message);
      return {
        success: false,
        message: error.message,
        affected: 0,
        data: null,
        error
      };
    }
    
    try {
      // Build the update data
      const updates = {
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // First try to use the RPC function if it exists
      try {
        const { data, error } = await supabase.rpc('bulk_update_notifications', {
          p_notification_ids: ids,
          p_is_read: true,
          p_user_id: userId || undefined
        });
        
        if (!error) {
          return {
            success: true,
            message: 'Notifications marked as read successfully',
            affected: data?.length || 0,
            data,
            error: null
          };
        }
        // If RPC fails, fall through to the direct update
        console.warn('bulk_update_notifications RPC failed, falling back to direct update:', error);
      } catch (rpcError) {
        console.warn('Error calling bulk_update_notifications RPC, falling back to direct update:', rpcError);
      }
      
      // Start building the query
      let query = supabase
        .from('notifications')
        .update(updates)
        .in('id', ids);
      
      // Add user ID check if provided
      if (userId) {
        if (typeof userId !== 'string' || !userId.trim()) {
          throw new Error('Invalid user ID format');
        }
        query = query.eq('user_id', userId);
      }
      
      // Execute the query
      const { data, error, count } = await query;
      
      // Handle potential errors
      if (error) {
        console.error('Database error marking notifications as read:', error);
        throw new Error(`Failed to update notifications: ${error.message}`);
      }
      
      // Log success
      console.log(`Successfully marked ${count || 0} notification(s) as read`);
      
      return { 
        success: true, 
        count: count || 0,
        data,
        error: null 
      };
      
    } catch (error) {
      console.error('Error in markAsRead:', error);
      
      // Return a consistent error response
      return { 
        success: false, 
        count: 0,
        data: null, 
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  },

  /**
   * Get all scheduled notifications for the current user
{{ ... }}
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) throw error;
    return true;
  } catch (error) {
    throw error;
  }
},

/**
 * Get all scheduled notifications for the current user
 * @param {Object} [options] - Query options
 * @param {boolean} [options.includeExecuted=false] - Include already executed notifications
 * @param {string} [options.referenceId] - Filter by reference ID
 * @param {string} [options.referenceType] - Filter by reference type
 * @param {number} [options.limit=50] - Limit the number of notifications to return
 * @param {number} [options.offset=0] - Offset for pagination
 * @returns {Promise<Array>} - Array of scheduled notifications
 */
async getScheduledNotifications({ includeExecuted = false, referenceId, referenceType, limit = 50, offset = 0 } = {}) {
  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) throw new Error('No user is currently signed in');
  
  // Sanitize pagination
  const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
  const pageOffset = Math.max(parseInt(offset, 10) || 0, 0);

  // Build the query
  let query = supabase
    .from('scheduled_notifications')
    .select('id, title, message, type, category, priority, reference_id, reference_type, action_url, metadata, scheduled_for, created_at, executed_at, user_id')
    .eq('user_id', userId)
    .order('scheduled_for', { ascending: true })
    .range(pageOffset, pageOffset + pageLimit - 1);
    
  if (!includeExecuted) {
    query = query.is('executed_at', null);
  }
  
  if (referenceId) {
    query = query.eq('reference_id', referenceId);
  }
  
  if (referenceType) {
    query = query.eq('reference_type', referenceType);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return data.map(notification => ({
    ...notification,
    scheduled_for: new Date(notification.scheduled_for),
    created_at: new Date(notification.created_at),
    executed_at: notification.executed_at ? new Date(notification.executed_at) : null
  }));
  },

  /**
   * Process due notifications that need to be sent
   * This should be called by a scheduled job/cron
   * @returns {Promise<{sent: number, failed: number}>} - Count of sent and failed notifications
   */
  async processDueNotifications() {
    // Single timestamp reuse for performance
    const nowISO = new Date().toISOString();
    
    // Get all notifications that are due and not yet executed
    const { data: dueNotifications, error } = await supabase
      .from('scheduled_notifications')
      .select('id, title, message, type, category, priority, reference_id, reference_type, action_url, metadata, user_id')
      .lte('scheduled_for', nowISO)
      .is('executed_at', null);
    
    if (error) throw error;
    
    if (!dueNotifications || dueNotifications.length === 0) {
      return { sent: 0, failed: 0, total: 0 };
    }
    
    let sent = 0;
    let failed = 0;
    
    // Process each notification
    for (const notification of dueNotifications) {
      try {
        // Send the notification
        await this.sendNotification({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          category: notification.category,
          priority: notification.priority,
          referenceId: notification.reference_id,
          referenceType: notification.reference_type,
          actionUrl: notification.action_url,
          metadata: notification.metadata
        }, notification.user_id);
        
        // Mark as executed
        const { error: updateError } = await supabase
          .from('scheduled_notifications')
          .update({ 
            executed_at: nowISO,
            updated_at: nowISO
          })
          .eq('id', notification.id);
        
        if (updateError) throw updateError;
        
        sent++;
      } catch (err) {
        failed++;

        // Update error count and last error
        await supabase
          .from('scheduled_notifications')
          .update({ 
            error_count: (notification.error_count || 0) + 1,
            last_error: err.message,
            updated_at: nowISO
          })
          .eq('id', notification.id);
      }
    }
    
    return { sent, failed, total: dueNotifications.length };
  },

  /**
   * Clean up old executed notifications
   * @param {Object} [options] - Cleanup options
   * @param {number} [options.daysToKeep=30] - Number of days to keep executed notifications
   * @returns {Promise<{deleted: number}>} - Number of notifications deleted
   */
  async cleanupOldNotifications({ daysToKeep = 30 } = {}) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const { count, error } = await supabase
      .from('scheduled_notifications')
      .delete()
      .not('executed_at', 'is', null)
      .lte('executed_at', cutoffDate.toISOString());
    
    if (error) throw error;
    
    return { deleted: count || 0 };
  }
};

export default NotificationService;
