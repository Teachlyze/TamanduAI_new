import React from 'react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { BarChart3, TrendingUp, Users, Award } from 'lucide-react';

const ClassAnalyticsTab = ({ classData }) => {
  const stats = [
    { label: 'Média Geral', value: '7.8', icon: BarChart3, color: 'blue' },
    { label: 'Taxa de Entrega', value: '85%', icon: TrendingUp, color: 'green' },
    { label: 'Alunos Ativos', value: classData.students_count || 0, icon: Users, color: 'purple' },
    { label: 'Taxa de Sucesso', value: '78%', icon: Award, color: 'orange' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <PremiumCard key={stat.label} className="p-6">
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </PremiumCard>
        ))}
      </div>

      <PremiumCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Desempenho ao Longo do Tempo</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Gráfico será implementado com dados reais
        </div>
      </PremiumCard>
    </div>
  );
};

export default ClassAnalyticsTab;
