import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Calendar, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';

const ClassActivitiesTab = ({ classId }) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadActivities();
  }, [classId]);

  const loadActivities = async () => {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });
    
    setActivities(data || []);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Atividades</h2>
        <PremiumButton
          onClick={() => navigate(`/dashboard/activities/create?classId=${classId}`)}
          className="whitespace-nowrap inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Atividade</span>
        </PremiumButton>
      </div>

      <div className="grid gap-4">
        {activities.map((activity) => (
          <PremiumCard key={activity.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{activity.title}</h3>
                <p className="text-muted-foreground mb-4">{activity.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(activity.due_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{activity.type}</span>
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>
        ))}
      </div>
    </div>
  );
};

export default ClassActivitiesTab;
