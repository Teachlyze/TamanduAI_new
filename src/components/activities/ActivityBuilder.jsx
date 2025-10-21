import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createActivity } from '@/services/apiSupabase';
import { saveDraft, deleteDraft } from '@/services/activityDraftService';
import { getCurrentUser } from '@/services/apiSupabase';

// Lexical imports
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';

// Lexical nodes
import { $getRoot } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';

import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiType, FiList, FiCheckSquare, FiAlignLeft } from 'react-icons/fi';

  const editorConfig = {
  theme: {
    paragraph: 'mb-2',
    heading: {
      h1: 'text-2xl font-bold',
      h2: 'text-xl font-semibold',
      h3: 'text-lg font-medium'
    },
    link: 'text-blue-600 hover:underline',
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline'
    }
  },
  nodes: [
    HeadingNode,
    QuoteNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    ListNode,
    ListItemNode,
    CodeNode,
    CodeHighlightNode,
    AutoLinkNode,
    LinkNode
  ],
  onError(error) {
    console.error(error);
  }
};

export function RichTextEditor({ onChange, placeholder = 'Digite aqui...' }) {
  
  const handleChange = useCallback((editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const text = root.getTextContent();
      onChange(text);
    });
  }, [onChange]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
      <RichTextPlugin
        contentEditable={
          <ContentEditable 
            className="min-h-[200px] p-4 focus:outline-none prose"
            placeholder={placeholder}
          />
        }
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <OnChangePlugin onChange={handleChange} />
      <AutoFocusPlugin />
      <LinkPlugin />
      <ListPlugin />
    </div>
  );
}

const questionTypes = [
  { 
    value: 'string', 
    label: 'Resposta Curta',
    icon: <FiType className="mr-2" />,
    description: 'Resposta curta de uma linha'
  },
  { 
    value: 'paragraph', 
    label: 'Parágrafo',
    icon: <FiAlignLeft className="mr-2" />,
    description: 'Resposta longa com formatação rica'
  },
  { 
    value: 'radio', 
    label: 'Múltipla Escolha',
    icon: <FiList className="mr-2" />,
    description: 'Selecione uma opção'
  },
  { 
    value: 'checkboxes',
    label: 'Caixas de Seleção',
    icon: <FiCheckSquare className="mr-2" />,
    description: 'Selecione uma ou mais opções'
  }
];

export default function ActivityBuilder({ draftId: initialDraftId, onActivityCreated }) {
  const [draftId, setDraftId] = useState(initialDraftId || null);
  const autosaveTimer = useRef(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    id: uuidv4(),
    type: 'string',
    question: '',
    description: '',
    required: false,
    points: 1,
    options: [{ id: uuidv4(), label: '' }],
  });

  // Adiciona uma nova pergunta
  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      alert('Por favor, insira o texto da pergunta');
      return;
    }

    if ((currentQuestion.type === 'radio' || currentQuestion.type === 'checkboxes') && 
        currentQuestion.options.some(opt => !opt.label.trim())) {
      alert('Por favor, preencha todas as opções da pergunta');
      return;
    }

    if (!Number.isFinite(currentQuestion.points) || currentQuestion.points <= 0) {
      alert('Defina os pontos da pergunta (mínimo 1)');
      return;
    }

    const newQuestion = {
      ...currentQuestion,
      id: uuidv4(),
      title: currentQuestion.question,
    };

    if (['radio', 'checkboxes'].includes(currentQuestion.type)) {
      newQuestion.enum = currentQuestion.options.map(opt => opt.label).filter(Boolean);
      newQuestion.enumNames = newQuestion.enum;
    }

    setQuestions([...questions, newQuestion]);
    resetQuestionForm();
  };

  // Reseta o formulário de pergunta
  const resetQuestionForm = () => {
    setCurrentQuestion({
      id: uuidv4(),
      type: 'string',
      question: '',
      description: '',
      required: false,
      options: [{ id: uuidv4(), label: '' }],
    });
  };

  // Adiciona uma nova opção à pergunta atual
  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { id: uuidv4(), label: '' }],
    });
  };

  // Atualiza uma opção existente
  const updateOption = (id, value) => {
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.map(opt =>
        opt.id === id ? { ...opt, label: value } : opt
      ),
    });
  };

  // Remove uma opção
  const removeOption = (id) => {
    if (currentQuestion.options.length > 1) {
      setCurrentQuestion({
        ...currentQuestion,
        options: currentQuestion.options.filter(opt => opt.id !== id),
      });
    }
  };

  // Remove uma pergunta
  const removeQuestion = (id) => {
    if (window.confirm('Tem certeza que deseja remover esta pergunta?')) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  // Move uma pergunta para cima na lista
  const moveQuestionUp = (index) => {
    if (index === 0) return;
    const newQuestions = [...questions];
    [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
    setQuestions(newQuestions);
  };

  // Move uma pergunta para baixo na lista
  const moveQuestionDown = (index) => {
    if (index === questions.length - 1) return;
    const newQuestions = [...questions];
    [newQuestions[index + 1], newQuestions[index]] = [newQuestions[index], newQuestions[index + 1]];
    setQuestions(newQuestions);
  };

  // Gera o schema da atividade
  const generateSchema = () => {
    const schema = {
      type: 'object',
      title: title,
      description: description,
      properties: {},
      required: [],
      scoring: { perQuestion: {} },
    };

    questions.forEach((q, index) => {
      const fieldName = `question_${index}`;
      schema.properties[fieldName] = {
        type: q.type === 'paragraph' ? 'string' : q.type === 'checkboxes' ? 'array' : 'string',
        title: q.title,
        description: q.description,
      };

      if (q.type === 'paragraph') {
        schema.properties[fieldName].format = 'textarea';
      }

      if (['radio', 'checkboxes'].includes(q.type) && q.enum) {
        schema.properties[fieldName].items = {
          type: 'string',
          enum: q.enum,
          enumNames: q.enumNames,
        };
        schema.properties[fieldName].uniqueItems = true;
      }

      if (q.required) {
        schema.required.push(fieldName);
      }

      // pontos por pergunta
      schema.scoring.perQuestion[fieldName] = Number(q.points) || 1;
    });

    return schema;
  };

  // Salva a atividade
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Por favor, insira um título para a atividade');
      return;
    }

    if (questions.length === 0) {
      alert('Adicione pelo menos uma pergunta à atividade');
      return;
    }

    setIsSaving(true);
    const schema = generateSchema();

    try {
      // criação de template (não exige classId). classId é opcional e pode ser usado depois ao publicar
      const activityData = await createActivity({
        title,
        description,
        schema,
      });

      if (onActivityCreated) {
        onActivityCreated(activityData.id);
      }
      alert('Atividade salva com sucesso!');
      // remoção do rascunho local se existir
      if (draftId) {
        try { await deleteDraft(draftId); } catch (e) { console.warn('Falha ao apagar rascunho após publicar:', e); }
        setDraftId(null);
      }
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      alert('Erro ao salvar atividade. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- DRAFTS ---
  const doAutosave = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;
      const payload = {
        title,
        description,
        questions,
        meta: { updatedAt: new Date().toISOString(), userId: user.id },
      };
      const result = await saveDraft({ draftId, data: payload });
      if (result?.draftId && !draftId) setDraftId(result.draftId);
    } catch (e) {
      console.warn('Falha no auto-save de rascunho:', e);
    }
  }, [title, description, questions, draftId]);

  // debounce simples de autosave
  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      doAutosave();
    }, 1000);
    if (loading) return <LoadingScreen />;

  return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [title, description, questions, doAutosave]);

  // save on unload
  useEffect(() => {
    window.addEventListener('beforeunload', doAutosave, []);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') doAutosave(, []);
    }, []);
    if (loading) return <LoadingScreen />;

  return () => {
      window.removeEventListener('beforeunload', doAutosave);
    };
  }, [doAutosave, title, description, questions.length]);

  const handleSaveDraftClick = async () => {
    await doAutosave();
    alert('Rascunho salvo');
  };


  // Renderiza o formulário de opções para perguntas de múltipla escolha
  const renderOptionsForm = () => (
    <div className="mt-4 space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Opções de resposta
      </label>
      <div className="space-y-2">
        {currentQuestion.options.map((option, index) => (
          <div key={option.id} className="flex items-center group">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full pl-8 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={option.label}
                onChange={(e) => updateOption(option.id, e.target.value)}
                placeholder={`Opção ${index + 1}`}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                {currentQuestion.type === 'radio' ? '○' : '□'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeOption(option.id)}
              className="ml-2 p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
              title="Remover opção"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addOption}
        className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
      >
        <FiPlus size={16} className="mr-1" /> Adicionar opção
      </button>
    </div>
  );

  // Renderiza o formulário de edição de pergunta
  const renderQuestionForm = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {questions.length > 0 ? 'Adicionar nova pergunta' : 'Criar sua primeira pergunta'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de pergunta
          </label>
          <div className="select-with-icon w-full max-w-full">
            <select
              value={currentQuestion.type}
              onChange={(e) => setCurrentQuestion({
                ...currentQuestion,
                type: e.target.value,
                options: ['radio', 'checkboxes'].includes(e.target.value) 
                  ? currentQuestion.options 
                  : [{ id: uuidv4(), label: '' }]
              })}
              className="w-full text-sm"
              aria-label="Tipo de pergunta"
            >
              {questionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
            <div className="icon right-0 pr-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {questionTypes.find(t => t.value === currentQuestion.type)?.description}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pergunta <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={currentQuestion.question}
            onChange={(e) => setCurrentQuestion({
              ...currentQuestion,
              question: e.target.value
            })}
            placeholder="Ex: Qual é a capital do Brasil?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição (opcional)
          </label>
          <textarea
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            value={currentQuestion.description}
            onChange={(e) => setCurrentQuestion({
              ...currentQuestion,
              description: e.target.value
            })}
            placeholder="Forneça instruções adicionais ou exemplos"
          />
        </div>

        {['radio', 'checkboxes'].includes(currentQuestion.type) && renderOptionsForm()}

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={currentQuestion.required}
              onChange={(e) => setCurrentQuestion({
                ...currentQuestion,
                required: e.target.checked
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Resposta obrigatória</span>
          </label>
          
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="mr-1" size={16} />
            {questions.length > 0 ? 'Adicionar pergunta' : 'Criar pergunta'}
          </button>
        </div>
      </div>
    </div>
  );

  // Renderiza a visualização de uma pergunta
  const renderQuestionPreview = (question, index) => (
    <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-base font-medium text-gray-900">
              {question.title} {question.required && <span className="text-red-500">*</span>}
            </h4>
            {question.description && (
              <p className="mt-1 text-sm text-gray-500">{question.description}</p>
            )}
            
            {['radio', 'checkboxes'].includes(question.type) && question.enum && (
              <div className="mt-3 space-y-2">
                {question.enum.map((option, i) => (
                  <div key={i} className="flex items-center">
                    <input
                      type={question.type === 'radio' ? 'radio' : 'checkbox'}
                      name={`preview-${question.id}`}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        question.type === 'radio' ? 'rounded-full' : 'rounded'
                      }`}
                      disabled
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}
            
            {question.type === 'string' && (
              <input
                type="text"
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Sua resposta"
                disabled
              />
            )}
            
            {question.type === 'paragraph' && (
              <textarea
                rows="3"
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Sua resposta"
                disabled
              />
            )}
          </div>
          
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => moveQuestionUp(index)}
              disabled={index === 0}
              className={`p-1.5 rounded-full ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Mover para cima"
            >
              <FiArrowUp size={18} />
            </button>
            <button
              type="button"
              onClick={() => moveQuestionDown(index)}
              disabled={index === questions.length - 1}
              className={`p-1.5 rounded-full ${index === questions.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Mover para baixo"
            >
              <FiArrowDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => removeQuestion(question.id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remover pergunta"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingScreen />;

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Criar Nova Atividade</h1>
          <p className="mt-1 text-sm text-gray-500">
            Crie uma nova atividade para seus alunos responderem
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Informações da Atividade</h2>
            <p className="mt-1 text-sm text-gray-500">
              Preencha os detalhes básicos da sua atividade
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título da Atividade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Questionário sobre Matemática Básica"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <RichTextEditor 
                initialValue={description}
                onChange={setDescription}
                placeholder="Forneça uma descrição detalhada da atividade..."
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab('questions')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'questions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Perguntas
                {questions.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {questions.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Visualização
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'questions' ? (
              <div className="space-y-6">
                {questions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Perguntas adicionadas</h3>
                    <div className="space-y-4">
                      {questions.map((q, index) => (
                        <div key={q.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {q.title} {q.required && <span className="text-red-500">*</span>}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {questionTypes.find(t => t.value === q.type)?.label}
                              </p>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <button
                                type="button"
                                onClick={() => moveQuestionUp(index)}
                                disabled={index === 0}
                                className={`p-1.5 rounded-full ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                                title="Mover para cima"
                              >
                                <FiArrowUp size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveQuestionDown(index)}
                                disabled={index === questions.length - 1}
                                className={`p-1.5 rounded-full ${index === questions.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                                title="Mover para baixo"
                              >
                                <FiArrowDown size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeQuestion(q.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                                title="Remover pergunta"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {questions.length > 0 ? 'Adicionar outra pergunta' : 'Adicionar primeira pergunta'}
                  </h3>
                  {renderQuestionForm()}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Visualização da Atividade
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title || 'Título da Atividade'}</h2>
                    {description && <div className="prose max-w-none text-gray-700">{description}</div>}
                  </div>

                  {questions.length > 0 ? (
                    <div className="space-y-6">
                      {questions.map((q, index) => renderQuestionPreview(q, index))}
                    </div key={q.id || q.key || Math.random()}>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500">Adicione perguntas para visualizar a prévia</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSaveDraftClick}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Salvar como rascunho
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || questions.length === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isSaving || questions.length === 0
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              'Publicar Atividade'
            )}
          </button>
        </div>
      </div>
    </LexicalComposer>
  );
}
