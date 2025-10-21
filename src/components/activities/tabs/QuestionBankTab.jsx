// src/components/activities/tabs/QuestionBankTab.jsx
import {
  Box,
  Button,
  Typography,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Grid,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ShortText as ShortTextIcon,
  Subject as SubjectIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';

const QuestionBankTab = ({ formik, tabValue, onTabChange }) => {
  if (tabValue !== 'questions' || formik.values.type !== 'quiz') return null;

  const [questions, setQuestions] = useState(formik.values.questions || []);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const questionTypes = [
    { value: 'multiple_choice', label: 'Múltipla escolha', icon: <RadioButtonUncheckedIcon /> },
    { value: 'true_false', label: 'Verdadeiro/Falso', icon: <CheckCircleIcon /> },
    { value: 'short_answer', label: 'Resposta curta', icon: <ShortTextIcon /> },
    { value: 'essay', label: 'Dissertação', icon: <SubjectIcon /> },
    { value: 'matching', label: 'Correspondência', icon: <ContentCopyIcon /> },
    { value: 'fill_blank', label: 'Preencher lacunas', icon: <ShortTextIcon /> },
    { value: 'numerical', label: 'Numérica', icon: <span>123</span> },
  ];

  const handleAddQuestion = (type) => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      type,
      question: '',
      points: 1,
      options: type === 'multiple_choice' || type === 'true_false' 
        ? [
            { id: `opt_${Date.now()}_1`, text: '', isCorrect: false },
            { id: `opt_${Date.now()}_2`, text: '', isCorrect: false },
          ]
        : [],
      correctAnswer: type === 'true_false' ? true : '',
      explanation: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentQuestion(newQuestion);
    setQuestionDialogOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion.question.trim()) {
      return;
    }

    const updatedQuestions = [...questions];
    const questionIndex = updatedQuestions.findIndex(q => q.id === currentQuestion.id);

    if (questionIndex >= 0) {
      updatedQuestions[questionIndex] = {
        ...currentQuestion,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updatedQuestions.push(currentQuestion);
    }

    setQuestions(updatedQuestions);
    formik.setFieldValue('questions', updatedQuestions);
    setQuestionDialogOpen(false);
    setCurrentQuestion(null);
  };

  const handleEditQuestion = (question) => {
    setCurrentQuestion(JSON.parse(JSON.stringify(question)));
    setQuestionDialogOpen(true);
  };

  const handleDeleteClick = (question, event) => {
    event.stopPropagation();
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    const updatedQuestions = questions.filter(q => q.id !== questionToDelete.id);
    setQuestions(updatedQuestions);
    formik.setFieldValue('questions', updatedQuestions);
    setDeleteDialogOpen(false);
    setQuestionToDelete(null);
  };

  const handleDuplicateQuestion = (question, event) => {
    event.stopPropagation();
    const newQuestion = {
      ...JSON.parse(JSON.stringify(question)),
      id: `q_${Date.now()}`,
      question: `${question.question} (cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    formik.setFieldValue('questions', updatedQuestions);
  };

  const handleMenuClick = (event, question) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setCurrentQuestion(question);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredQuestions = sortedQuestions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || question.type === filterType;
    return matchesSearch && matchesType;
  });

  const getQuestionTypeLabel = (type) => {
    const typeInfo = questionTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.label : type;
  };

  const renderQuestionForm = () => {
    if (!currentQuestion) return null;

    return (
      <Dialog
        open={questionDialogOpen}
        onClose={() => setQuestionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentQuestion.id ? 'Editar Questão' : 'Nova Questão'}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Pergunta"
              value={currentQuestion.question}
              onChange={(e) => setCurrentQuestion({
                ...currentQuestion,
                question: e.target.value,
              })}
              multiline
              rows={3}
              variant="outlined"
            />
          </Box>

          <Box mt={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Questão</InputLabel>
                  <Select
                    value={currentQuestion.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const updatedQuestion = { ...currentQuestion, type: newType };
                      
                      // Reset options when changing question type
                      if (newType === 'multiple_choice' || newType === 'true_false') {
                        updatedQuestion.options = [
                          { id: `opt_${Date.now()}_1`, text: '', isCorrect: false },
                          { id: `opt_${Date.now()}_2`, text: '', isCorrect: false },
                        ];
                        if (newType === 'true_false') {
                          updatedQuestion.correctAnswer = true;
                        }
                      } else {
                        updatedQuestion.options = [];
                        updatedQuestion.correctAnswer = '';
                      }
                      
                      setCurrentQuestion(updatedQuestion);
                    }}
                    label="Tipo de Questão"
                  >
                    {questionTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box display="flex" alignItems="center">
                          <Box mr={1}>{type.icon}</Box>
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pontos"
                  type="number"
                  value={currentQuestion.points}
                  onChange={(e) => setCurrentQuestion({
                    ...currentQuestion,
                    points: parseFloat(e.target.value) || 0,
                  })}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      step: 0.5,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Opções para questões de múltipla escolha e verdadeiro/falso */}
          {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') && (
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Opções de Resposta
              </Typography>
              
              {currentQuestion.type === 'true_false' ? (
                <RadioGroup
                  value={currentQuestion.correctAnswer.toString()}
                  onChange={(e) => setCurrentQuestion({
                    ...currentQuestion,
                    correctAnswer: e.target.value === 'true',
                  })}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="Verdadeiro"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="Falso"
                  />
                </RadioGroup>
              ) : (
                <List>
                  {currentQuestion.options.map((option, index) => (
                    <ListItem key={option.id} disableGutters>
                      <Radio
                        checked={option.isCorrect}
                        onChange={() => {
                          const updatedOptions = currentQuestion.options.map(opt => ({
                            ...opt,
                            isCorrect: opt.id === option.id,
                          }));
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: updatedOptions,
                            correctAnswer: option.id,
                          });
                        }}
                        value={option.id}
                        name="correct-option"
                      />
                      <TextField
                        fullWidth
                        value={option.text}
                        onChange={(e) => {
                          const updatedOptions = [...currentQuestion.options];
                          updatedOptions[index].text = e.target.value;
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: updatedOptions,
                          });
                        }}
                        placeholder={`Opção ${index + 1}`}
                        variant="standard"
                      />
                      <IconButton
                        onClick={() => {
                          const updatedOptions = currentQuestion.options.filter(
                            (_, i) => i !== index
                          );
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: updatedOptions,
                          });
                        }}
                        disabled={currentQuestion.options.length <= 2}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                  
                  <Box mt={1} ml={6}>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => {
                        const newOption = {
                          id: `opt_${Date.now()}_${currentQuestion.options.length + 1}`,
                          text: '',
                          isCorrect: false,
                        };
                        setCurrentQuestion({
                          ...currentQuestion,
                          options: [...currentQuestion.options, newOption],
                        });
                      }}
                      disabled={currentQuestion.options.length >= 10}
                    >
                      Adicionar Opção
                    </Button>
                  </Box>
                </List>
              )}
            </Box>
          )}

          {/* Campo para resposta correta em outros tipos de questão */}
          {!['multiple_choice', 'true_false'].includes(currentQuestion.type) && (
            <Box mt={3}>
              <TextField
                fullWidth
                label="Resposta Correta"
                value={currentQuestion.correctAnswer || ''}
                onChange={(e) => setCurrentQuestion({
                  ...currentQuestion,
                  correctAnswer: e.target.value,
                })}
                multiline
                rows={currentQuestion.type === 'essay' ? 4 : 1}
                variant="outlined"
                placeholder={
                  currentQuestion.type === 'short_answer' ? 'Digite a resposta curta esperada' :
                  currentQuestion.type === 'essay' ? 'Forneça um exemplo de resposta ou critérios de avaliação' :
                  currentQuestion.type === 'numerical' ? 'Digite o valor numérico esperado (use . para decimais)' :
                  'Digite a resposta correta'
                }
              />
            </Box>
          )}

          {/* Explicação da resposta */}
          <Box mt={3}>
            <TextField
              fullWidth
              label="Explicação (opcional)"
              value={currentQuestion.explanation || ''}
              onChange={(e) => setCurrentQuestion({
                ...currentQuestion,
                explanation: e.target.value,
              })}
              multiline
              rows={2}
              variant="outlined"
              placeholder="Forneça uma explicação ou feedback que será mostrado após a submissão"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveQuestion}
            variant="contained"
            color="primary"
            disabled={!currentQuestion.question.trim()}
          >
            Salvar Questão
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Banco de Questões</Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setQuestionDialogOpen(true)}
            >
              Adicionar Questão
            </Button>
          </Box>
        </Box>

        <Box mb={3} display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar questões..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ width: 250 }}
          />

          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="filter-type-label">Filtrar por tipo</InputLabel>
            <Select
              labelId="filter-type-label"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Filtrar por tipo"
            >
              <MenuItem value="all">Todos os tipos</MenuItem>
              {questionTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box ml="auto" display="flex" alignItems="center">
            <Tooltip title="Ordenar por data">
              <IconButton
                onClick={() => handleSort('createdAt')}
                color={sortConfig.key === 'createdAt' ? 'primary' : 'default'}
              >
                {sortConfig.key === 'createdAt' && sortConfig.direction === 'asc' ? (
                  <ArrowUpwardIcon />
                ) : (
                  <ArrowDownwardIcon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Ordenar por pontos">
              <IconButton
                onClick={() => handleSort('points')}
                color={sortConfig.key === 'points' ? 'primary' : 'default'}
              >
                {sortConfig.key === 'points' && sortConfig.direction === 'asc' ? (
                  <ArrowUpwardIcon />
                ) : (
                  <ArrowDownwardIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {filteredQuestions.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p={4}
            textAlign="center"
          >
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Nenhuma questão encontrada
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {searchTerm || filterType !== 'all'
                ? 'Tente ajustar sua busca ou filtro'
                : 'Adicione sua primeira questão clicando no botão acima'}
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredQuestions.map((question, index) => (
              <Accordion key={question.id} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box
                    display="flex"
                    alignItems="center"
                    width="100%"
                    pr={2}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      width={40}
                      flexShrink={0}
                      mr={2}
                    >
                      {question.type === 'multiple_choice' && <RadioButtonUncheckedIcon color="action" />}
                      {question.type === 'true_false' && <CheckCircleIcon color="action" />}
                      {question.type === 'short_answer' && <ShortTextIcon color="action" />}
                      {question.type === 'essay' && <SubjectIcon color="action" />}
                      {question.type === 'matching' && <ContentCopyIcon color="action" />}
                      {question.type === 'fill_blank' && <ShortTextIcon color="action" />}
                      {question.type === 'numerical' && <span style={{ width: 24, textAlign: 'center' }}>123</span>}
                    </Box>
                    
                    <Box flexGrow={1} minWidth={0}>
                      <Typography
                        noWrap
                        variant="subtitle1"
                        title={question.question}
                      >
                        {question.question || 'Pergunta sem título'}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <Chip
                          label={getQuestionTypeLabel(question.type)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {question.points} ponto{question.points !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box ml="auto" display="flex" alignItems="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateQuestion(question, e);
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick(e, question);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <Box width="100%">
                    <Typography variant="body1" paragraph>
                      {question.question}
                    </Typography>
                    
                    {question.type === 'multiple_choice' && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Opções:
                        </Typography>
                        <List dense>
                          {question.options.map((option, idx) => (
                            <ListItem key={option.id || idx} dense>
                              <ListItemIcon>
                                {option.isCorrect ? (
                                  <CheckCircleIcon color="primary" />
                                ) : (
                                  <RadioButtonUncheckedIcon color="action" />
                                )}
                              </ListItemIcon>
                              <ListItemText primary={option.text} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    {question.type === 'true_false' && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Resposta correta:
                        </Typography>
                        <Typography>
                          {question.correctAnswer ? 'Verdadeiro' : 'Falso'}
                        </Typography>
                      </Box>
                    )}
                    
                    {['short_answer', 'essay', 'numerical', 'fill_blank'].includes(question.type) && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Resposta correta:
                        </Typography>
                        <Typography
                          component="div"
                          sx={{
                            p: 2,
                            bgcolor: 'action.hover',
                            borderRadius: 1,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {question.correctAnswer || 'Nenhuma resposta fornecida'}
                        </Typography>
                      </Box>
                    )}
                    
                    {question.explanation && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Explicação:
                        </Typography>
                        <Typography
                          component="div"
                          sx={{
                            p: 2,
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            borderLeft: '3px solid',
                            borderColor: 'primary.main',
                          }}
                        >
                          {question.explanation}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box mt={3} display="flex" justifyContent="flex-end">
                      <Button
                        startIcon={<EditIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditQuestion(question);
                        }}
                      >
                        Editar
                      </Button>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </List>
        )}
      </Paper>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza de que deseja excluir esta questão? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu de contexto para questões */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={(e) => {
            handleEditQuestion(currentQuestion);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        
        <MenuItem
          onClick={(e) => {
            handleDuplicateQuestion(currentQuestion, e);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicar</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem
          onClick={(e) => {
            handleDeleteClick(currentQuestion, e);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>

      {/* Formulário de edição/criação de questão */}
      {renderQuestionForm()}
    </Box>
  );
};

export default QuestionBankTab;
