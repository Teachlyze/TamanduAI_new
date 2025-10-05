import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const StatCard = ({ 
  icon, 
  label, 
  value, 
  description, 
  progress, 
  trend, 
  trendValue 
}) => {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        {trend && (
          <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
            trend === 'up' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {trendValue}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {progress !== undefined ? (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};
