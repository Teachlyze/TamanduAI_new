import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Edit2,
  Check,
  X,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import gradesService from '@/services/gradesService';
import toast from 'react-hot-toast';

const GradesTable = ({ students, activities, grades, onGradeUpdate }) => {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleStartEdit = (studentId, activityId, currentGrade) => {
    setEditingCell(`${studentId}-${activityId}`);
    setEditValue(currentGrade?.grade || '');
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleSaveEdit = async (studentId, activityId, activity) => {
    const gradeData = grades[studentId]?.[activityId];
    
    if (!gradeData?.submission_id) {
      toast.error('Nenhuma submissão encontrada');
      handleCancelEdit();
      return;
    }

    const newGrade = parseFloat(editValue);
    
    if (isNaN(newGrade) || newGrade < 0 || newGrade > activity.total_points) {
      toast.error(`Nota deve estar entre 0 e ${activity.total_points}`);
      return;
    }

    try {
      setSaving(true);
      await gradesService.updateGrade(gradeData.submission_id, newGrade);
      toast.success('Nota atualizada!');
      handleCancelEdit();
      onGradeUpdate();
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      toast.error('Erro ao atualizar nota');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e, studentId, activityId, activity) => {
    if (e.key === 'Enter') {
      handleSaveEdit(studentId, activityId, activity);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const getGradeColor = (percentage) => {
    if (!percentage) return '';
    if (percentage >= 70) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCellClassName = (gradeData) => {
    let classes = 'px-3 py-3 text-center border-r border-border relative group';
    
    if (!gradeData || !gradeData.submission_id) {
      return classes + ' bg-slate-50 dark:bg-slate-900/50';
    }

    if (gradeData.status === 'graded') {
      return classes + ' bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer';
    }

    if (gradeData.status === 'submitted' || gradeData.status === 'pending') {
      return classes + ' bg-orange-50 dark:bg-orange-900/20';
    }

    return classes;
  };

  if (students.length === 0 || activities.length === 0) {
    return (
      <PremiumCard variant="elevated">
        <div className="p-8 text-center text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum dado de notas disponível ainda.</p>
          <p className="text-sm">Adicione alunos e atividades para visualizar as notas.</p>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard variant="elevated">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 border-b-2 border-primary/20">
            <tr>
              <th className="px-4 py-4 text-left font-bold text-sm sticky left-0 bg-inherit z-10 border-r border-border">
                Aluno
              </th>
              {activities.map((activity) => (
                <th
                  key={activity.id}
                  className="px-3 py-4 text-center font-semibold text-xs border-r border-border min-w-[120px]"
                >
                  <div className="line-clamp-2">{activity.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {activity.total_points} pts
                  </div>
                </th>
              ))}
              <th className="px-4 py-4 text-center font-bold text-sm sticky right-0 bg-inherit z-10">
                Média
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => {
              const studentAverage = gradesService.calculateStudentAverage(student.id, grades);
              
              return (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  {/* Student Name */}
                  <td className="px-4 py-3 font-medium sticky left-0 bg-white dark:bg-slate-900 border-r border-border z-10">
                    {student.name}
                  </td>

                  {/* Grades */}
                  {activities.map((activity) => {
                    const gradeData = grades[student.id]?.[activity.id];
                    const cellId = `${student.id}-${activity.id}`;
                    const isEditing = editingCell === cellId;

                    return (
                      <td
                        key={activity.id}
                        className={getCellClassName(gradeData)}
                        onClick={() => {
                          if (gradeData?.status === 'graded' && !isEditing) {
                            handleStartEdit(student.id, activity.id, gradeData);
                          }
                        }}
                      >
                        {isEditing ? (
                          // Edit Mode
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyPress={(e) => handleKeyPress(e, student.id, activity.id, activity)}
                              onBlur={() => handleCancelEdit()}
                              autoFocus
                              min="0"
                              max={activity.total_points}
                              step="0.5"
                              disabled={saving}
                              className="w-16 px-2 py-1 text-sm text-center border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button
                              onClick={() => handleSaveEdit(student.id, activity.id, activity)}
                              disabled={saving}
                              className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              disabled={saving}
                              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          // View Mode
                          <div>
                            {!gradeData || !gradeData.submission_id ? (
                              <div className="text-muted-foreground">
                                <Minus className="w-4 h-4 mx-auto" />
                              </div>
                            ) : gradeData.status === 'graded' ? (
                              <div>
                                <div className={`font-semibold ${getGradeColor(gradeData.percentage)}`}>
                                  {gradeData.grade?.toFixed(1) || '-'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {gradeData.percentage?.toFixed(1)}%
                                </div>
                                {gradeData.is_late && (
                                  <AlertCircle className="w-3 h-3 mx-auto mt-1 text-orange-500" />
                                )}
                                {/* Edit icon on hover */}
                                <Edit2 className="w-3 h-3 mx-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                              </div>
                            ) : (
                              <div className="text-orange-600 dark:text-orange-400 text-xs font-medium">
                                <Clock className="w-4 h-4 mx-auto mb-1" />
                                Pendente
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Average */}
                  <td className="px-4 py-3 text-center font-bold sticky right-0 bg-white dark:bg-slate-900 border-l border-border z-10">
                    {studentAverage !== null ? (
                      <div>
                        <div className={`text-lg ${getGradeColor(studentAverage)}`}>
                          {studentAverage.toFixed(1)}%
                        </div>
                        {studentAverage >= 70 ? (
                          <TrendingUp className="w-4 h-4 mx-auto text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mx-auto text-red-600" />
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}

            {/* Activity Averages Row */}
            <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 border-t-2 border-primary/20 font-bold">
              <td className="px-4 py-3 sticky left-0 bg-inherit z-10 border-r border-border">
                Média da Atividade
              </td>
              {activities.map((activity) => {
                const activityAvg = gradesService.calculateActivityAverage(activity.id, grades);
                
                return (
                  <td key={activity.id} className="px-3 py-3 text-center border-r border-border">
                    {activityAvg !== null ? (
                      <div className={getGradeColor(activityAvg)}>
                        {activityAvg.toFixed(1)}%
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                );
              })}
              <td className="px-4 py-3 text-center sticky right-0 bg-inherit z-10"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white dark:bg-slate-900 border border-border"></div>
            <span>Corrigida (clique para editar)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-50 dark:bg-orange-900/20 border border-orange-200"></div>
            <span>Pendente de correção</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-50 dark:bg-slate-900/50 border border-border"></div>
            <span>Não entregue</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span>Entrega atrasada</span>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
};

export default GradesTable;
