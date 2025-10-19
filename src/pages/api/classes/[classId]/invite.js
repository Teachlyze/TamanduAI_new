// src/pages/api/classes/[classId]/invite.js
import { supabase } from '@/lib/supabaseClient';
import { redisCache } from '@/services/redisService';

export default async function handler(req, res) {
  const { classId } = req.query;

  if (!classId) {
    return res.status(400).json({ message: 'Class ID is required' });
  }

  if (req.method === 'POST') {
    return await handleCreateInvite(req, res, classId);
  } else if (req.method === 'GET') {
    return await handleGetInvites(req, res, classId);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleCreateInvite(req, res, classId) {
  try {
    const { inviteType, email, expiresIn = 7 } = req.body;

    if (!inviteType || !['link', 'email'].includes(inviteType)) {
      return res.status(400).json({ message: 'Invalid invite type' });
    }

    // Verify teacher has access to this class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, name, teacher_id')
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Generate unique invitation code
    const invitationCode = generateInvitationCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);

    // Create invite record
    const { data: invite, error: inviteError } = await supabase
      .from('class_invitations')
      .insert({
        class_id: classId,
        created_by: classData.teacher_id,
        invitation_code: invitationCode,
        invitation_type: inviteType,
        target_email: email || null,
        role: 'student',
        max_uses: inviteType === 'email' ? 1 : 10,
        current_uses: 0,
        expires_at: expiresAt.toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    let inviteUrl = null;
    let emailSent = false;

    if (inviteType === 'link') {
      // Generate invite URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      inviteUrl = `${baseUrl}/join/${invitationCode}`;

      // Cache the invite for quick lookup
      await redisCache.set(`invite:${invitationCode}`, {
        invitationId: invite.id,
        classId,
        email: invite.target_email,
        role: invite.role,
        expiresAt: expiresAt.toISOString(),
        status: 'active'
      }, expiresIn * 24 * 60 * 60); // Cache for the duration of the invite
    }

    if (inviteType === 'email' && email) {
      // Send email invite (we'll implement this with edge functions)
      emailSent = await sendInviteEmail(invite, classData);
    }

    res.status(201).json({
      success: true,
      invite: {
        id: invite.id,
        invitationCode,
        invitationType: inviteType,
        targetEmail: invite.target_email,
        role: invite.role,
        expiresAt: expiresAt.toISOString(),
        inviteUrl,
        emailSent
      }
    });

  } catch (error) {
    console.error('Create invite error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

async function handleGetInvites(req, res, classId) {
  try {
    const { data: invites, error } = await supabase
      .from('class_invitations')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ invites });
  } catch (error) {
    console.error('Get invites error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

function generateInvitationCode() {
  // Generate 8-character code (uppercase letters and numbers, excluding similar looking chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function sendInviteEmail(invite, classData) {
  try {
    // This will be implemented with Supabase Edge Functions + Resend
    // For now, we'll just log it
    console.log('Sending invite email:', {
      to: invite.target_email,
      className: classData.name,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/join/${invite.invitation_code}`
    });

    // TODO: Implement actual email sending with EmailTemplateService
    return true;
  } catch (error) {
    console.error('Send invite email error:', error);
    return false;
  }
}
