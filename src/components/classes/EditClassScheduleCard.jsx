import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClassService } from '@/services/classService';
import { toast } from '@/components/ui/use-toast';
import { Calendar, X, Plus, Save, AlertTriangle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

  const EditClassScheduleCard = ({ classId, initialData }) => {
  const [vacationStart, setVacationStart] = useState('');
  const [vacationEnd, setVacationEnd] = useState('');
  const [cancelledDates, setCancelledDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (initialData) {
      setVacationStart(initialData.vacation_start || '');
      setVacationEnd(initialData.vacation_end || '');
      setCancelledDates(initialData.cancelled_dates || []);
    }
  }, [initialData]);

  const addCancelledDate = () => {
    if (!selectedDate) {
      toast({
        variant: 'destructive',
        title: 'Data não selecionada',
        description: 'Selecione uma data para cancelar.'
      });
      return;
    }

    if (cancelledDates.includes(selectedDate)) {
      toast({
        variant: 'destructive',
        title: 'Data já cancelada',
        description: 'Esta data já está na lista de cancelamentos.'
      });
      return;
    }

    setCancelledDates([...cancelledDates, selectedDate].sort());
    setSelectedDate('');
    setHasChanges(true);
  };

  const removeCancelledDate = (date) => {
    setCancelledDates(cancelledDates.filter(d => d !== date));
    setHasChanges(true);
  };

  const clearVacation = () => {
    setVacationStart('');
    setVacationEnd('');
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      // Validate vacation period
      if (vacationStart && vacationEnd) {
        const start = new Date(vacationStart);
        const end = new Date(vacationEnd);
        if (end < start) {
          toast({
            variant: 'destructive',
            title: 'Período inválido',
            description: 'A data de fim deve ser posterior à data de início.'
          });
          return;
        }
      }

      const scheduleData = {
        vacation_start: vacationStart || null,
        vacation_end: vacationEnd || null,
        cancelled_dates: cancelledDates.length > 0 ? cancelledDates : null
      };

      await ClassService.updateClassSchedule(classId, scheduleData);

      toast({
        title: '✅ Horários atualizados!',
        description: 'As alterações de férias e cancelamentos foram salvas.'
      });

      setHasChanges(false);
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível atualizar os horários.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getVacationDuration = () => {
    if (!vacationStart || !vacationEnd) return null;
    const start = new Date(vacationStart);
    const end = new Date(vacationEnd);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  if (loading) return <LoadingScreen />;

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white hover:opacity-90">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          Cancelamentos e Férias
        </CardTitle>
        <CardDescription>
          Gerencie quando a turma não terá aula
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Vacation Period */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Período de Férias</Label>
            {(vacationStart || vacationEnd) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearVacation}
                className="whitespace-nowrap inline-flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" />
                <span className="text-xs">Limpar</span>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vacation-start" className="text-sm">Data de Início</Label>
              <Input
                id="vacation-start"
                type="date"
                value={vacationStart}
                onChange={(e) => {
                  setVacationStart(e.target.value);
                  setHasChanges(true);
                }}
                className="mt-1 bg-white dark:bg-slate-900"
              />
            </div>
            
            <div>
              <Label htmlFor="vacation-end" className="text-sm">Data de Término</Label>
              <Input
                id="vacation-end"
                type="date"
                value={vacationEnd}
                onChange={(e) => {
                  setVacationEnd(e.target.value);
                  setHasChanges(true);
                }}
                min={vacationStart}
                className="mt-1 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {vacationStart && vacationEnd && (
            <Alert className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-sm">
                <span className="font-semibold">Férias programadas:</span> {getVacationDuration()} dias
                ({formatDate(vacationStart)} a {formatDate(vacationEnd)}).
                As aulas não aparecerão para os alunos durante este período.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="border-t pt-6" />

        {/* Cancelled Dates */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Cancelar Aulas em Datas Específicas</Label>
          <p className="text-sm text-muted-foreground">
            Selecione dias específicos em que a aula não acontecerá (ex: feriados)
          </p>
          
          <div className="flex gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-900"
              placeholder="Selecione uma data"
            />
            <Button
              onClick={addCancelledDate}
              disabled={!selectedDate}
              className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </Button>
          </div>

          {/* List of cancelled dates */}
          <div className="min-h-[60px] p-3 border rounded-lg bg-slate-50 dark:bg-slate-900">
            <AnimatePresence mode="popLayout">
              {cancelledDates.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-muted-foreground text-center py-2"
                >
                  Nenhuma data cancelada
                </motion.p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {cancelledDates.map((date, index) => (
                    <motion.div
                      key={date}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Badge
                        variant="secondary"
                        className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-3 py-1 hover:bg-red-100 dark:hover:bg-red-950 transition-colors"
                      >
                        <span>{formatDate(date)}</span>
                        <X
                          className="w-3 h-3 cursor-pointer text-red-600 hover:text-red-700"
                          onClick={() => removeCancelledDate(date)}
                        />
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {cancelledDates.length > 0 && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {cancelledDates.length} {cancelledDates.length === 1 ? 'aula cancelada' : 'aulas canceladas'}.
                Os alunos não verão essas datas na agenda.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSubmitting}
            className="w-full whitespace-nowrap inline-flex items-center gap-2 min-w-fit bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50 hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditClassScheduleCard;
