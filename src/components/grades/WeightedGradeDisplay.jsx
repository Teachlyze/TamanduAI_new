import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FiDownload } from 'react-icons/fi';
import { calculateWeightedGrade, calculateClassWeightedGrades } from '@/services/gradeCalculationService';
import { exportGradesToPDF, exportGradesToExcel } from '@/services/exportService';

const WeightedGradeDisplay = ({ studentId, classId, className, studentName, isTeacher = false }) => {
  const [gradeData, setGradeData] = useState(null);
  const [classGrades, setClassGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [studentId, classId, isTeacher]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (isTeacher) {
        const grades = await calculateClassWeightedGrades(classId);
        setClassGrades(grades);
      } else {
        const data = await calculateWeightedGrade(studentId, classId);
        setGradeData(data);
      }
    } catch (error) {
      console.error('Error loading grade data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!gradeData || !gradeData.details) return;
    
    const formattedGrades = gradeData.details.map(d => ({
      activityName: `Atividade ${d.activityId}`,
      finalGrade: d.grade,
      weight: d.weight,
      status: 'graded'
    }));

    exportGradesToPDF(studentName || 'Aluno', formattedGrades, className || 'Turma');
  };

  const handleExportExcel = () => {
    if (!gradeData || !gradeData.details) return;
    
    const formattedGrades = gradeData.details.map(d => ({
      activityName: `Atividade ${d.activityId}`,
      finalGrade: d.grade,
      weight: d.weight,
      status: 'graded'
    }));

    exportGradesToExcel(studentName || 'Aluno', formattedGrades, className || 'Turma');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isTeacher) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notas Ponderadas da Turma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {classGrades.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma nota disponível</p>
            ) : (
              <div className="space-y-2">
                {classGrades.map((student, idx) => (
                  <div key={student.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">#{idx + 1}</span>
                      <span className="text-sm font-medium">{student.studentName}</span>
                    </div>
                    <div className="text-right">
                      {student.weightedGrade !== null ? (
                        <>
                          <span className="text-lg font-bold text-gray-900">{student.weightedGrade}%</span>
                          <p className="text-xs text-gray-500">Média ponderada</p>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">Sem nota</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Média Ponderada</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExportPDF}>
              <FiDownload className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportExcel}>
              <FiDownload className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {gradeData && gradeData.weightedGrade !== null ? (
          <div className="space-y-4">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Sua Média Ponderada</p>
              <p className="text-5xl font-bold text-blue-600">{gradeData.weightedGrade}%</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Detalhamento:</p>
              {gradeData.details.map((detail, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Atividade {idx + 1}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium">{detail.grade}%</span>
                    <span className="text-xs text-gray-500 ml-2">(peso: {detail.weight})</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 pt-2 border-t">
              Peso total: {gradeData.totalWeight}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Nenhuma nota disponível ainda
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default WeightedGradeDisplay;
