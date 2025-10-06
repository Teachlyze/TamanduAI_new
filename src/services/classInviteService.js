import { supabase } from '@/lib/supabaseClient';
import NotificationOrchestrator from '@/services/notificationOrchestrator';
import EmailTemplateService from '@/services/emailTemplateService';

class ClassInviteService {
  // Generate a new invite for a class (v2: class_invitations with role)
  static async createInvite(classId, options = {}) {
    const { maxUses = 10, expiresInHours = 24 * 7, recipientEmail, role = 'student' } = options; // Default 1 week, student role
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Authorization (v2): owner or teacher member of the class
    const [{ data: cls }, { data: teacherMember }] = await Promise.all([
      supabase.from('classes').select('id, created_by, name').eq('id', classId).single(),
      supabase
        .from('class_members')
        .select('id')
        .eq('class_id', classId)
        .eq('user_id', user.id)
        .eq('role', 'teacher')
        .maybeSingle(),
    ]);

    if (!cls || (cls.created_by !== user.id && !teacherMember)) {
      throw new Error('Unauthorized: Only class owner/teacher can create invites');
    }

    // Generate expiration date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Create the invite (v2: class_invitations)
    const { data: invite, error } = await supabase
      .from('class_invitations')
      .insert([
        {
          class_id: classId,
          created_by: user.id,
          token: this.generateToken(),
          role,
          max_uses: maxUses,
          uses: 0,
          expires_at: expiresAt.toISOString(),
        }
      ])
      .select()
      .single();

    if (error) throw error;
    try {
      // Send email if recipientEmail is provided
      if (recipientEmail) {
        // Fetch class name and teacher info
        const { data: cls } = await supabase
          .from('classes')
          .select('name, created_by')
          .eq('id', classId)
          .single();

        const { data: teacher } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', cls?.created_by)
          .single();

        const acceptUrl = `${window?.location?.origin || ''}/join/${invite.token}`;

        // Use new email template system
        await EmailTemplateService.sendClassInvite({
          to: recipientEmail,
          className: cls?.name || 'Turma',
          teacherName: teacher?.full_name || 'Professor',
          acceptUrl,
          language: 'pt'
        });
      }
    } catch (e) {
      console.warn('Falha ao enviar email de convite:', e);
    }
    return invite;
  }

  // Get all invites for a class (v2)
  static async getInvitesByClass(classId) {
    const { data, error } = await supabase
      .from('class_invitations')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Revoke an invite (v2: soft revoke via revoked_at)
  static async revokeInvite(inviteId) {
    const { error } = await supabase
      .from('class_invitations')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', inviteId);

    if (error) throw error;
    return true;
  }

  // Accept an invite token to join a class (v2)
  static async acceptInvite(token, userId, reqMeta = {}) {
    // Get the invite
    const { data: invite, error: inviteError } = await supabase
      .from('class_invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (inviteError) throw new Error('Invalid or expired invite');

    // validity checks
    if (invite.revoked_at) throw new Error('Invite revoked');
    if (new Date(invite.expires_at) < new Date()) throw new Error('Invite has expired');
    if (invite.max_uses != null && invite.uses >= invite.max_uses) throw new Error('Invite has reached maximum uses');

    // Add user to class with role from invite
    const { error: enrollError } = await supabase
      .from('class_members')
      .insert([
        {
          class_id: invite.class_id,
          user_id: userId,
          role: invite.role || 'student',
          created_at: new Date().toISOString(),
        }
      ]);

    if (enrollError) {
      // If user is already in the class, just continue
      if (enrollError.code === '23505') {
        // still count usage
      } else {
        throw enrollError;
      }
    }

    // Record usage
    const { error: usageErr } = await supabase
      .from('invitation_usages')
      .insert([
        {
          invite_id: invite.id,
          user_id: userId,
          used_at: new Date().toISOString(),
          ip_address: reqMeta.ip_address || null,
          user_agent: reqMeta.user_agent || null,
        }
      ]);
    if (usageErr) console.warn('Failed to record invitation usage', usageErr);

    // Increment uses on invitation
    const { error: updateError } = await supabase
      .from('class_invitations')
      .update({ uses: (invite.uses || 0) + 1 })
      .eq('id', invite.id);
    if (updateError) console.warn('Failed to increment invitation uses', updateError);

    // Notify owner
    try {
      const { data: cls } = await supabase
        .from('classes')
        .select('id, name, created_by')
        .eq('id', invite.class_id)
        .single();

      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      const { data: teacherProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', cls?.created_by)
        .single();

      if (cls?.created_by && teacherProfile?.email) {
        // Send email to teacher
        await EmailTemplateService.sendClassInviteAccepted({
          to: teacherProfile.email,
          studentName: studentProfile?.full_name || 'Aluno',
          className: cls?.name || 'Turma',
          time: new Date().toLocaleString('pt-BR'),
          language: 'pt'
        });

        // Also send push notification
        await NotificationOrchestrator.send('classInviteAccepted', {
          userId: cls.created_by,
          variables: {
            studentName: studentProfile?.full_name || 'Aluno',
            className: cls?.name || 'Turma'
          },
          channelOverride: 'push',
          metadata: { classId: cls.id, inviteId: invite.id }
        });
      }
    } catch (e) {
      console.warn('Falha ao notificar convite aceito:', e);
    }

    return { success: true };
  }

  // Generate a random token
  static generateToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

export default ClassInviteService;
