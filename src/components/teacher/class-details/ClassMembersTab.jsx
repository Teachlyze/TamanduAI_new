import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, MoreVertical } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard } from '@/components/ui/PremiumCard';

const ClassMembersTab = ({ classId }) => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    loadMembers();
  }, [classId]);

  const loadMembers = async () => {
    const { data } = await supabase
      .from('class_members')
      .select('*, user:profiles(*)')
      .eq('class_id', classId)
      .eq('role', 'student');
    
    setMembers(data || []);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Alunos ({members.length})</h2>
      </div>

      <div className="grid gap-4">
        {members.map((member) => (
          <PremiumCard key={member.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {member.user?.full_name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="font-semibold">{member.user?.full_name || 'Aluno'}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {member.user?.email}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </PremiumCard>
        ))}
      </div>
    </div>
  );
};

export default ClassMembersTab;
