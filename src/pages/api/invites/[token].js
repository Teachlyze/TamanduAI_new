// src/pages/api/invites/[invitationCode].js
import { supabase } from '@/lib/supabaseClient';
import { redisCache } from '@/services/redisService';

export default async function handler(req, res) {
  const { invitationCode } = req.query;

  if (!invitationCode) {
    return res.status(400).json({ message: 'Invitation code is required' });
  }

  if (req.method === 'GET') {
    return await handleGetInvite(req, res, invitationCode);
  } else if (req.method === 'POST') {
    return await handleAcceptInvite(req, res, invitationCode);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGetInvite(req, res, invitationCode) {
  try {
    // Check cache first
    const cachedInvite = await redisCache.get(`invite:${invitationCode}`);

    if (cachedInvite) {
      return res.status(200).json({
        invite: {
          invitationCode,
          classId: cachedInvite.classId,
          email: cachedInvite.email,
          expiresAt: cachedInvite.expiresAt,
          status: cachedInvite.status
        }
      });
    }

    // Check database
    const { data: invite, error } = await supabase
      .from('class_invitations')
      .select(`
        *,
        class:classes (
          id,
          name,
          description,
          created_by,
          teacher:profiles!created_by (
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('invitation_code', invitationCode)
      .eq('status', 'active')
      .single();

    if (error || !invite) {
      return res.status(404).json({ message: 'Invite not found or expired' });
    }

    // Check if expired
    if (new Date() > new Date(invite.expires_at)) {
      // Update status to expired
      await supabase
        .from('class_invitations')
        .update({ status: 'expired' })
        .eq('id', invite.id);

      return res.status(410).json({ message: 'Invite has expired' });
    }

    // Cache the invite
    await redisCache.set(`invite:${invitationCode}`, {
      classId: invite.class_id,
      email: invite.target_email,
      expiresAt: invite.expires_at,
      status: invite.status
    }, Math.ceil((new Date(invite.expires_at) - new Date()) / 1000));

    res.status(200).json({
      invite: {
        invitationCode,
        classId: invite.class_id,
        className: invite.class?.name,
        description: invite.class?.description,
        teacherName: invite.class?.teacher?.full_name,
        teacherAvatar: invite.class?.teacher?.avatar_url,
        role: invite.role,
        expiresAt: invite.expires_at,
        status: invite.status
      }
    });

  } catch (error) {
    console.error('Get invite error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

async function handleAcceptInvite(req, res, invitationCode) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get invite info
    const inviteInfo = await redisCache.get(`invite:${invitationCode}`);

    if (!inviteInfo) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    // Check if user is already in the class
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('class_members')
      .select('id')
      .eq('class_id', inviteInfo.classId)
      .eq('user_id', userId)
      .maybeSingle();

    if (memberCheckError) {
      throw memberCheckError;
    }

    if (existingMember) {
      return res.status(409).json({ 
        message: 'Already a member of this class',
        alreadyMember: true,
        classId: inviteInfo.classId
      });
    }

    // Add user to class
    const { data: newMember, error: joinError } = await supabase
      .from('class_members')
      .insert({
        class_id: inviteInfo.classId,
        user_id: userId,
        role: inviteInfo.role || 'student'
      })
      .select()
      .single();

    if (joinError) throw joinError;

    // Increment invitation usage
    const { error: usageError } = await supabase
      .from('invitation_usages')
      .insert({
        invitation_id: inviteInfo.invitationId,
        user_id: userId
      });

    if (usageError) console.warn('Failed to record usage:', usageError);

    // Clear cache
    await redisCache.delete(`invite:${invitationCode}`);

    // Invalidate related caches
    await redisCache.invalidateUserCache(userId);
    await redisCache.invalidateClassCache(inviteInfo.classId);

    res.status(201).json({
      message: 'Successfully joined the class',
      success: true,
      classId: inviteInfo.classId,
      memberId: newMember.id
    });

  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
