import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, List, CheckSquare, Code, Image as ImageIcon, Trash2, GripVertical, Plus } from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'text', label: 'Resposta Curta', icon: FileText, placeholder: 'Digite sua resposta aqui...' },
  { value: 'paragraph', label: 'Parágrafo', icon: FileText, placeholder: 'Digite sua resposta detalhada aqui...' },
  { value: 'multiple_choice', label: 'Múltipla Escolha', icon: List, placeholder: 'Selecione uma opção' },
  { value: 'checkbox', label: 'Caixas de Seleção', icon: CheckSquare, placeholder: 'Selecione uma ou mais opções' },
  { value: 'dropdown', label: 'Lista Suspensa', icon: List, placeholder: 'Selecione uma opção' },
  { value: 'code', label: 'Código', icon: Code, placeholder: 'Digite seu código aqui...' },
  { value: 'image', label: 'Upload de Imagem', icon: ImageIcon, placeholder: 'Envie uma imagem como resposta' },
];

const QuestionBuilder = ({ question, index, onUpdate, onDelete, isDragging = false }) => {
  const [localQuestion, setLocalQuestion] = useState(question);

  const updateQuestion = (field, value) => {
    const updated = { ...localQuestion, [field]: value };
    setLocalQuestion(updated);
    onUpdate(index, updated);
  };

  const addOption = () => {
    const currentOptions = localQuestion.options || [];
    updateQuestion('options', [...currentOptions, `Opção ${currentOptions.length + 1}`]);
  };

  const updateOption = (optionIndex, value) => {
    const currentOptions = localQuestion.options || [];
    const updatedOptions = [...currentOptions];
    updatedOptions[optionIndex] = value;
    updateQuestion('options', updatedOptions);
  };

  const removeOption = (optionIndex) => {
    const currentOptions = localQuestion.options || [];
    const updatedOptions = currentOptions.filter((_, i) => i !== optionIndex);
    updateQuestion('options', updatedOptions);
  };

  const questionType = QUESTION_TYPES.find(type => type.value === localQuestion.type) || QUESTION_TYPES[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative group ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="cursor-move text-gray-400 hover:text-gray-600">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <questionType.icon className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-lg">Pergunta {index + 1}</CardTitle>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question Title */}
          <div className="space-y-2">
            <Label>Enunciado da Pergunta *</Label>
            <Input
              value={localQuestion.title || ''}
              onChange={(e) => updateQuestion('title', e.target.value)}
              placeholder="Digite o enunciado da pergunta..."
              className="font-medium"
            />
          </div>

          {/* Question Type */}
          <div className="space-y-2">
            <Label>Tipo de Resposta</Label>
            <Select
              value={localQuestion.type || 'text'}
              onValueChange={(value) => updateQuestion('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Help Text */}
          <div className="space-y-2">
            <Label>Texto de Ajuda (opcional)</Label>
            <Input
              value={localQuestion.helpText || ''}
              onChange={(e) => updateQuestion('helpText', e.target.value)}
              placeholder="Digite instruções adicionais para os alunos..."
            />
          </div>

          {/* Options for multiple choice questions */}
          {(localQuestion.type === 'multiple_choice' ||
            localQuestion.type === 'checkbox' ||
            localQuestion.type === 'dropdown') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Opções de Resposta</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Opção
                </Button>
              </div>
              <div className="space-y-2">
                {(localQuestion.options || []).map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(optionIndex, e.target.value)}
                      placeholder={`Opção ${optionIndex + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(optionIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`required-${index}`}
              checked={localQuestion.required !== false}
              onChange={(e) => updateQuestion('required', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor={`required-${index}`} className="text-sm font-normal">
              Pergunta obrigatória
            </Label>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuestionBuilder;
