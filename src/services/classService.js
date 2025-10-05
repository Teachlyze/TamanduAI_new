import { supabase } from '@/lib/supabaseClient';
import NotificationOrchestrator from '@/services/notificationOrchestrator';

/**
 * Class Service
 * Handles all class-related operations with Supabase
 */

export const ClassService = {
  /**
   * Fetch all classes
   * @param {Object} options - Query options
   * @param {string} [options.teacherId] - Filter by teacher ID
   * @param {string} [options.studentId] - Filter by student ID
   * @param {boolean} [options.activeOnly=true] - Only return active classes
   * @returns {Promise<Array>} - Array of classes
   */
  async getClasses({ teacherId, studentId, activeOnly = true } = {}) {
    let query = supabase
      .from('classes')
      .select(`
        *,
        members:class_members(*, user:profiles(*)),
        meetings:meetings(*)
      `)
      .order('name', { ascending: true });

    // Apply filters if provided
    if (teacherId) {
      // v2.0: classes.created_by replaces teacher_id
      query = query.eq('created_by', teacherId);
    }

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }

    // If filtering by student, filter by class_members relationship in-memory
    if (studentId) {
      return data.filter(
        (classItem) => 
          classItem.members?.some(member => member.user_id === studentId && member.role === 'student')
      );
    }

    return data;
  },

  /**
   * Get a single class by ID with all related data
   * @param {string} classId - The ID of the class to fetch
   * @returns {Promise<Object>} - The class with all related data
   */
  async getClassById(classId) {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        members:class_members(*, user:profiles(*)),
        meetings:meetings(*, 
          participants:meeting_participants(*, user:profiles(*))
        )
      `)
      .eq('id', classId)
      .single();

    if (error) {
      console.error(`Error fetching class ${classId}:`, error);
      throw error;
    }

    return data;
  },

  /**
   * Create a new class
   * @param {Object} classData - The class data
   * @param {string} classData.name - Class name
   * @param {string} [classData.description] - Class description
   * @param {string} classData.teacherId - ID of the teacher
   * @param {string} [classData.schedule] - Class schedule
   * @param {Array<string>} [studentIds=[]] - Array of student IDs to enroll
   * @returns {Promise<Object>} - The created class
   */
  async createClass(classData, studentIds = []) {
    const { 
      name, 
      description, 
      teacher_id,
      subject,
      course,
      period,
      grade_level,
      academic_year,
      color,
      student_capacity,
      chatbot_enabled,
      school_id,
      is_school_managed
    } = classData;

    // First, ensure the teacher has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', teacher_id)
      .single();

    // If no profile exists, create one with minimal required fields
    if (!profile) {
      // Ensure there is an authenticated user; ignore return here
      await supabase.auth.getUser();
      
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: teacher_id,
            // Only include fields that exist in the profiles table
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (createProfileError) {
        console.error('Error creating teacher profile:', createProfileError);
        throw createProfileError;
      }
    }

    // Create the class (v2.0: use created_by instead of teacher_id)
    const { data: newClass, error: classError } = await supabase
      .from('classes')
      .insert([
        {
          name,
          description,
          created_by: teacher_id,
          subject,
          course: course ?? null,
          period: period ?? null,
          grade_level,
          academic_year,
          color: color ?? null,
          student_capacity: typeof student_capacity === 'number' ? student_capacity : null,
          chatbot_enabled: !!chatbot_enabled,
          school_id: school_id ?? null,
          is_school_managed: !!is_school_managed,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (classError) {
      console.error('Error creating class:', classError);
      throw classError;
    }

    // Notificar professor: nova turma criada
    try {
      await NotificationOrchestrator.send('classCreated', {
        userId: teacher_id,
        variables: { className: name },
        channelOverride: 'push',
        metadata: { classId: newClass.id }
      });
    } catch (e) {
      console.warn('Falha ao notificar criação de turma:', e);
    }

    // Add students if any
    if (studentIds && studentIds.length > 0) {
      await this.addStudentsToClass(newClass.id, studentIds);
    }

    return this.getClassById(newClass.id);
  },

  /**
   * Update an existing class
   * @param {string} classId - The ID of the class to update
   * @param {Object} updates - The updates to apply
   * @param {Array<string>} [studentUpdates] - Updated list of student IDs
   * @returns {Promise<Object>} - The updated class
   */
  async updateClass(classId, updates, studentUpdates) {
    // Update class details
    const { error: updateError } = await supabase
      .from('classes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', classId)
      ;

    if (updateError) {
      console.error(`Error updating class ${classId}:`, updateError);
      throw updateError;
    }

    // Update students if provided (via class_members)
    if (Array.isArray(studentUpdates)) {
      // Get current students
      const { data: currentMembers } = await supabase
        .from('class_members')
        .select('user_id')
        .eq('class_id', classId)
        .eq('role', 'student');
      const currentStudentIds = (currentMembers || []).map(s => s.user_id);
      
      // Find students to add and remove
      const studentsToAdd = studentUpdates.filter(id => !currentStudentIds.includes(id));
      const studentsToRemove = currentStudentIds.filter(id => !studentUpdates.includes(id));
      
      // Perform updates in parallel
      await Promise.all([
        this.addStudentsToClass(classId, studentsToAdd),
        this.removeStudentsFromClass(classId, studentsToRemove)
      ]);
    }

    return this.getClassById(classId);
  },

  /**
   * Delete a class (soft delete)
   * @param {string} classId - The ID of the class to delete
   * @returns {Promise<boolean>} - True if successful
   */
  async deleteClass(classId) {
    const { error } = await supabase
      .from('classes')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString() 
      })
      .eq('id', classId);

    if (error) {
      console.error(`Error deleting class ${classId}:`, error);
      throw error;
    }
    return true;
  },

  /**
   * Add students to a class
   * @param {string} classId - The ID of the class
   * @param {Array<string>} studentIds - Array of student IDs to add
   * @returns {Promise<Array>} - Array of created relationships
   */
  async addStudentsToClass(classId, studentIds) {
    if (!studentIds || studentIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('class_members')
      .insert(
        studentIds.map(studentId => ({
          class_id: classId,
          user_id: studentId,
          role: 'student',
          created_at: new Date().toISOString()
        }))
      )
      .select();

    if (error) {
      console.error(`Error adding students to class ${classId}:`, error);
      throw error;
    }

    // Notificar professor: aluno adicionado
    try {
      const [{ data: cls }, { data: profiles }] = await Promise.all([
        supabase.from('classes').select('id, name, created_by').eq('id', classId).single(),
        supabase.from('profiles').select('id, full_name').in('id', studentIds)
      ]);

      if (cls?.created_by && profiles?.length) {
        for (const p of profiles) {
          await NotificationOrchestrator.send('studentAddedToClass', {
            userId: cls.created_by,
            variables: { studentName: p.full_name || 'Aluno', className: cls.name || 'Turma' },
            channelOverride: 'push',
            metadata: { classId: classId, studentId: p.id }
          });
        }
      }
    } catch (e) {
      console.warn('Falha ao notificar alunos adicionados:', e);
    }

    return data;
  },

  /**
   * Remove students from a class
   * @param {string} classId - The ID of the class
   * @param {Array<string>} studentIds - Array of student IDs to remove
   * @returns {Promise<boolean>} - True if successful
   */
  async removeStudentsFromClass(classId, studentIds) {
    if (!studentIds || studentIds.length === 0) return true;
    
    const { error } = await supabase
      .from('class_members')
      .delete()
      .eq('class_id', classId)
      .in('user_id', studentIds)
      .eq('role', 'student');

    if (error) {
      console.error(`Error removing students from class ${classId}:`, error);
      throw error;
    }

    // Notificar alunos removidos (email + push)
    try {
      const [{ data: cls }, { data: profiles }] = await Promise.all([
        supabase.from('classes').select('id, name').eq('id', classId).single(),
        supabase.from('profiles').select('id, full_name').in('id', studentIds)
      ]);

      for (const p of profiles || []) {
        await NotificationOrchestrator.send('studentRemovedFromClass', {
          userId: p.id,
          email: undefined,
          variables: { className: cls?.name || 'Turma' },
          metadata: { classId }
        });
      }
    } catch (e) {
      console.warn('Falha ao notificar alunos removidos:', e);
    }

    return true;
  },

  /**
   * Search for classes by name or description
   * @param {string} query - The search query
   * @param {Object} [options] - Additional options
   * @param {boolean} [options.onlyActive=true] - Only return active classes
   * @returns {Promise<Array>} - Array of matching classes
   */
  async searchClasses(query, { onlyActive = true } = {}) {
    let queryBuilder = supabase
      .from('classes')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    
    if (onlyActive) {
      queryBuilder = queryBuilder.eq('is_active', true);
    }

    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Error searching classes:', error);
      throw error;
    }

    return data;
  },

  /**
   * Subscribe to real-time class updates
   * @param {Function} callback - Function to call when classes change
   * @returns {Function} - Function to unsubscribe
   */
  subscribeToClasses(callback) {
    const subscription = supabase
      .channel('classes_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'classes' 
        }, 
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(subscription);
    };
  }
};

export default ClassService;
