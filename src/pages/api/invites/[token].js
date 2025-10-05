// src/pages/api/invites/[token].js
import { supabase } from '@/lib/supabaseClient';
import { redisCache } from '@/services/redisService';

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Invite token is required' });
  }

  if (req.method === 'GET') {
    return await handleGetInvite(req, res, token);
  } else if (req.method === 'POST') {
    return await handleAcceptInvite(req, res, token);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGetInvite(req, res, token) {
  try {
    // Check cache first
    const cachedInvite = await redisCache.get(`invite:${token}`);

    if (cachedInvite) {
      return res.status(200).json({
        invite: {
          token,
          classId: cachedInvite.classId,
          email: cachedInvite.email,
          expiresAt: cachedInvite.expiresAt,
          status: cachedInvite.status
        }
      });
    }

    // Check database
    const { data: invite, error } = await supabase
      .from('class_invites')
      .select(`
        *,
        classes (
          id,
          name,
          subject,
          teacher_id,
          profiles!classes_teacher_id_fkey (
            id,
            username,
            full_name
          )
        )
      `)
      .eq('token', token)
      .eq('status', 'active')
      .single();

    if (error || !invite) {
      return res.status(404).json({ message: 'Invite not found or expired' });
    }

    // Check if expired
    if (new Date() > new Date(invite.expires_at)) {
      // Update status to expired
      await supabase
        .from('class_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id);

      return res.status(410).json({ message: 'Invite has expired' });
    }

    // Cache the invite
    await redisCache.set(`invite:${token}`, {
      classId: invite.class_id,
      email: invite.email,
      expiresAt: invite.expires_at,
      status: invite.status
    }, Math.ceil((new Date(invite.expires_at) - new Date()) / 1000));

    res.status(200).json({
      invite: {
        token,
        classId: invite.class_id,
        className: invite.classes?.name,
        subject: invite.classes?.subject,
        teacherName: invite.classes?.profiles?.full_name,
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

async function handleAcceptInvite(req, res, token) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get invite info
    const inviteInfo = await redisCache.get(`invite:${token}`);

    if (!inviteInfo) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    // Check if user is already in the class
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('class_students')
      .select('id, status')
      .eq('class_id', inviteInfo.classId)
      .eq('student_id', userId)
      .single();

    if (memberCheckError && memberCheckError.code !== 'PGRST116') {
      throw memberCheckError;
    }

    if (existingMember) {
      if (existingMember.status === 'active') {
        return res.status(409).json({ message: 'Already a member of this class' });
      } else {
        // Reactivate membership
        const { error: reactivateError } = await supabase
          .from('class_students')
          .update({ status: 'active', enrolled_at: new Date().toISOString() })
          .eq('id', existingMember.id);

        if (reactivateError) throw reactivateError;

        // Update invite status
        await supabase
          .from('class_invites')
          .update({ status: 'used' })
          .eq('token', token);

        // Clear cache
        await redisCache.delete(`invite:${token}`);

        return res.status(200).json({
          message: 'Successfully rejoined the class',
          classId: inviteInfo.classId
        });
      }
    }

    // Add user to class
    const { data: newMember, error: joinError } = await supabase
      .from('class_students')
      .insert({
        class_id: inviteInfo.classId,
        student_id: userId,
        status: 'active',
        enrolled_at: new Date().toISOString()
      })
      .select()
      .single();

    if (joinError) throw joinError;

    // Update invite status
    await supabase
      .from('class_invites')
      .update({ status: 'used' })
      .eq('token', token);

    // Clear cache
    await redisCache.delete(`invite:${token}`);

    // Invalidate related caches
    await redisCache.invalidateUserCache(userId);
    await redisCache.invalidateClassCache(inviteInfo.classId);

    res.status(201).json({
      message: 'Successfully joined the class',
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
