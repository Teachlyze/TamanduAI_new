import { supabase } from '@/lib/supabaseClient';
import NotificationOrchestrator from '@/services/notificationOrchestrator';

// Winston AI API Configuration
const WINSTON_API_KEY = import.meta.env.VITE_WINSTON_API_KEY || '';
const WINSTON_API_URL = 'https://api.winston.ai/v1';

// Plagiarism severity thresholds
const PLAGIARISM_THRESHOLDS = {
  NONE: 0,
  LOW: 20,
  MEDIUM: 35,
  HIGH: 50,
  CRITICAL: 75
};

/**
 * Map Winston AI score to plagiarism severity
 */
const mapScoreToSeverity = (score) => {
  if (score >= PLAGIARISM_THRESHOLDS.CRITICAL) return 'critical';
  if (score >= PLAGIARISM_THRESHOLDS.HIGH) return 'high';
  if (score >= PLAGIARISM_THRESHOLDS.MEDIUM) return 'medium';
  if (score >= PLAGIARISM_THRESHOLDS.LOW) return 'low';
  return 'none';
};

/**
 * Check text for plagiarism using Winston AI API
 * @param {string} text - The text to check for plagiarism
 * @param {Object} options - Additional options for the plagiarism check
 * @returns {Promise<Object>} - The plagiarism check results
 */
export const checkTextForPlagiarism = async (text, options = {}) => {
  try {
    if (!WINSTON_API_KEY) {
      throw new Error('Winston AI API key not configured');
    }

    const response = await fetch(`${WINSTON_API_URL}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WINSTON_API_KEY}`,
        'X-API-Key': WINSTON_API_KEY,
      },
      body: JSON.stringify({
        text,
        language: options.language || 'pt',
        threshold: options.threshold || 0.1,
        ...options,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `Winston AI error: ${response.status}`);
    }

    const result = await response.json();

    return {
      score: result.score || 0,
      severity: mapScoreToSeverity(result.score || 0),
      aiDetected: result.ai_generated || false,
      sources: result.sources || [],
      rawResponse: result,
      confidence: result.confidence || 0,
    };
  } catch (error) {
    console.error('Error checking for plagiarism with Winston AI:', error);
    throw error;
  }
};

/**
 * Check submission for plagiarism using Winston AI
 * @param {string} submissionId - The submission ID
 * @param {string} text - The text content to check
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The plagiarism check results
 */
export const checkSubmissionForPlagiarism = async (submissionId, text, options = {}) => {
  try {
    // Get submission details
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        id,
        activity_id,
        user_id,
        activities (
          id,
          class_id,
          plagiarism_enabled
        )
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError) throw submissionError;

    if (!submission?.activities?.plagiarism_enabled) {
      return { message: 'Plagiarism check disabled for this activity' };
    }

    // Check if already checked recently (within 1 hour)
    const { data: existingCheck } = await supabase
      .from('plagiarism_checks_v2')
      .select('*')
      .eq('submission_id', submissionId)
      .gte('checked_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('checked_at', { ascending: false })
      .limit(1)
      .single();

    if (existingCheck) {
      return existingCheck;
    }

    // Perform plagiarism check
    const plagiarismResult = await checkTextForPlagiarism(text, options);

    // Store the result in the database
    const { data: checkResult, error: insertError } = await supabase
      .from('plagiarism_checks_v2')
      .insert([
        {
          submission_id: submissionId,
          content_hash: await generateContentHash(text),
          winston_score: plagiarismResult.score,
          plagiarism_severity: plagiarismResult.severity,
          ai_detected: plagiarismResult.aiDetected,
          similarity_sources: plagiarismResult.sources,
          raw_response: plagiarismResult.rawResponse,
          checked_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // Notify teacher if plagiarism detected
    if (plagiarismResult.severity !== 'none') {
      await notifyTeacherOfPlagiarism(submission, plagiarismResult);
    }

    return checkResult;

  } catch (error) {
    console.error('Error in checkSubmissionForPlagiarism:', error);
    throw error;
  }
};

/**
 * Get plagiarism check for a specific submission
 * @param {string} submissionId - The submission ID
 * @returns {Promise<Object|null>} - The plagiarism check result or null
 */
export const getPlagiarismCheckForSubmission = async (submissionId) => {
  try {
    const { data, error } = await supabase
      .from('plagiarism_checks_v2')
      .select('*')
      .eq('submission_id', submissionId)
      .order('checked_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error getting plagiarism check:', error);
    return null;
  }
};

/**
 * Get all plagiarism checks for an activity
 * @param {string} activityId - The activity ID
 * @returns {Promise<Array>} - Array of plagiarism checks
 */
export const getPlagiarismChecksForActivity = async (activityId) => {
  try {
    const { data, error } = await supabase
      .from('plagiarism_checks_v2')
      .select(`
        *,
        submissions (
          id,
          user_id,
          profiles (full_name)
        )
      `)
      .eq('submissions.activity_id', activityId)
      .order('checked_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting plagiarism checks for activity:', error);
    return [];
  }
};

/**
 * Get plagiarism notification settings for a class
 * @param {string} classId - The class ID
 * @returns {Promise<Object|null>} - The notification settings or null
 */
export const getPlagiarismNotificationSettings = async (classId) => {
  try {
    const { data, error } = await supabase
      .from('plagiarism_notification_settings')
      .select('*')
      .eq('class_id', classId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error getting plagiarism notification settings:', error);
    return null;
  }
};

/**
 * Update plagiarism notification settings for a class
 * @param {string} classId - The class ID
 * @param {Object} settings - The notification settings
 * @returns {Promise<Object>} - The updated settings
 */
export const updatePlagiarismNotificationSettings = async (classId, settings) => {
  try {
    const { data, error } = await supabase
      .from('plagiarism_notification_settings')
      .upsert([
        {
          class_id: classId,
          ...settings,
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating plagiarism notification settings:', error);
    throw error;
  }
};

/**
 * Generate a content hash for duplicate detection
 * @param {string} content - The content to hash
 * @returns {Promise<string>} - The content hash
 */
const generateContentHash = async (content) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Notify teacher of plagiarism detection
 * @param {Object} submission - The submission data
 * @param {Object} plagiarismResult - The plagiarism check result
 */
const notifyTeacherOfPlagiarism = async (submission, plagiarismResult) => {
  try {
    const { activities, user_id } = submission;

    if (!activities?.class_id) return;

    // Get class and teacher info
    const [{ data: classData }, { data: studentProfile }] = await Promise.all([
      supabase.from('classes').select('id, name, created_by').eq('id', activities.class_id).single(),
      supabase.from('profiles').select('full_name').eq('id', user_id).single()
    ]);

    if (!classData?.created_by) return;

    // Get notification settings
    const settings = await getPlagiarismNotificationSettings(activities.class_id);

    // Check if we should notify based on severity thresholds
    if (settings && !shouldNotifyForSeverity(plagiarismResult.severity, settings)) {
      return;
    }

    // Send notification
    await NotificationOrchestrator.send('plagiarismDetected', {
      userId: classData.created_by,
      variables: {
        studentName: studentProfile?.full_name || 'Aluno',
        activityName: activities.title || 'Atividade',
        severity: plagiarismResult.severity,
        score: Math.round(plagiarismResult.score),
      },
      channelOverride: settings?.notify_push !== false ? 'push' : undefined,
      email: settings?.notify_email !== false ? true : undefined,
      metadata: {
        submissionId: submission.id,
        activityId: activities.id,
        classId: activities.class_id,
        severity: plagiarismResult.severity,
        score: plagiarismResult.score,
      }
    });

  } catch (error) {
    console.error('Error notifying teacher of plagiarism:', error);
  }
};

/**
 * Check if we should notify for a given severity level
 * @param {string} severity - The plagiarism severity
 * @param {Object} settings - The notification settings
 * @returns {boolean} - Whether to notify
 */
const shouldNotifyForSeverity = (severity, settings) => {
  if (!settings?.notify_immediately) return false;

  switch (severity) {
    case 'critical':
      return true;
    case 'high':
      return settings.threshold_high <= PLAGIARISM_THRESHOLDS.HIGH;
    case 'medium':
      return settings.threshold_medium <= PLAGIARISM_THRESHOLDS.MEDIUM;
    case 'low':
      return settings.threshold_low <= PLAGIARISM_THRESHOLDS.LOW;
    default:
      return false;
  }
};

/**
 * Get plagiarism statistics for a class
 * @param {string} classId - The class ID
 * @returns {Promise<Object>} - Statistics object
 */
export const getPlagiarismStatsForClass = async (classId) => {
  try {
    const { data, error } = await supabase
      .from('plagiarism_checks_v2')
      .select(`
        plagiarism_severity,
        ai_detected,
        winston_score,
        checked_at,
        submissions (
          activity_id,
          user_id,
          profiles (full_name)
        )
      `)
      .in('submissions.activity_id',
        supabase.from('activities').select('id').eq('class_id', classId)
      );

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      bySeverity: {
        none: 0,
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      aiDetected: 0,
      averageScore: 0,
      recentChecks: data?.slice(0, 10) || [],
    };

    if (data && data.length > 0) {
      // Count by severity
      data.forEach(check => {
        stats.bySeverity[check.plagiarism_severity]++;
        if (check.ai_detected) stats.aiDetected++;
      });

      // Calculate average score
      const scores = data.map(check => check.winston_score || 0).filter(score => score > 0);
      stats.averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    }

    return stats;
  } catch (error) {
    console.error('Error getting plagiarism stats:', error);
    return {
      total: 0,
      bySeverity: { none: 0, low: 0, medium: 0, high: 0, critical: 0 },
      aiDetected: 0,
      averageScore: 0,
      recentChecks: [],
    };
  }
};

/**
 * Batch check multiple submissions for plagiarism
 * @param {Array} submissions - Array of submission objects with id and text
 * @returns {Promise<Array>} - Array of plagiarism check results
 */
export const batchCheckPlagiarism = async (submissions) => {
  const results = [];

  for (const submission of submissions) {
    try {
      const result = await checkSubmissionForPlagiarism(submission.id, submission.text);
      results.push({
        submissionId: submission.id,
        success: true,
        result,
      });
    } catch (error) {
      results.push({
        submissionId: submission.id,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * Invoke Edge Function to run Winston AI plagiarism check asynchronously
 * @param {Object} params - The parameters for the edge function
 * @returns {Promise<Object|null>} - The edge function result or null on error
 */
export const invokeEdgeCheck = async ({ submissionId, activityId, classId, text, recheck = false }) => {
  try {
    const { data, error } = await supabase.functions.invoke('plagiarism-check-v2', {
      body: { submission_id: submissionId, activity_id: activityId, class_id: classId, text, recheck },
    });

    if (error) throw error;
    return data;
  } catch (e) {
    console.warn('Edge function plagiarism check failed:', e);
    return null;
  }
};
