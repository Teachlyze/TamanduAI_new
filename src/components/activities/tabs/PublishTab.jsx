import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  AlertTitle,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Card,
  CardContent,
  CardHeader,
  CardActionArea,
  CardActions,
  Avatar,
  Badge,
  InputAdornment,
  Menu,
  MenuItem as MuiMenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import {
  Publish as PublishIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  Link as LinkIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Public as PublicIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Book as BookIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  CloudQueue as CloudQueueIcon,
  CloudSync as CloudSyncIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  HelpOutline as HelpOutlineIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  GetApp as GetAppIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon2,
  InsertDriveFile as InsertDriveFileIcon,
  Image as ImageIcon,
  VideoLibrary as VideoLibraryIcon,
  AudioFile as AudioFileIcon,
  YouTube as YouTubeIcon,
  Article as ArticleIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TableChart as TableChartIcon,
  Code as CodeIcon,
  Archive as ArchiveIcon,
  TextFields as TextFieldsIcon,
  Movie as MovieIcon,
  MusicNote as MusicNoteIcon,
  InsertPhoto as InsertPhotoIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Apps as AppsIcon,
  ViewModule as ViewModuleIcon,
  SortByAlpha as SortByAlphaIcon,
  TrendingUp as TrendingUpIcon,
  Folder as FolderIcon,
  CreateNewFolder as CreateNewFolderIcon,
  FolderOpen as FolderOpenIcon,
  DriveFolderUpload as DriveFolderUploadIcon,
  Cloud as CloudIcon,
  Google as GoogleIcon,
  OndemandVideo as OndemandVideoIcon,
  CloudDone as CloudDoneIcon2,
  CloudOff as CloudOffIcon2,
  CloudQueue as CloudQueueIcon2,
  Cloud as CloudIcon2,
  CloudCircle as CloudCircleIcon,
  CloudQueue as CloudQueueIcon3,
  CloudDone as CloudDoneIcon3,
  CloudOff as CloudOffIcon3,
  Cloud as CloudIcon3,
  CloudCircle as CloudCircleIcon2,
  CloudQueue as CloudQueueIcon4,
  CloudDone as CloudDoneIcon4,
  CloudOff as CloudOffIcon4,
  Cloud as CloudIcon4,
  CloudCircle as CloudCircleIcon3,
} from '@mui/icons-material';
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PublishTab = ({ formik, tabValue, onTabChange, onPublish, isPublishing }) => {
  const theme = useTheme();
  
  // Estados para o diálogo de confirmação
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const [publishOption, setPublishOption] = useState('publish_now');
  const [scheduledDate, setScheduledDate] = useState(() => {
    // Definir a data padrão para 1 hora a partir de agora
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    now.setSeconds(0);
    return now;
  });
  
  // Estados para o menu de opções de publicação
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  
  // Verificar se a aba atual está ativa
  if (tabValue !== 'publish') return null;
  
  // Verificar se há erros de validação
  const hasValidationErrors = Object.keys(formik.errors).length > 0;
  
  // Verificar se todos os campos obrigatórios foram preenchidos
  const isFormValid = formik.isValid && formik.dirty && !hasValidationErrors;
  
  // Função para formatar a data
  const formatDate = (date) => {
    if (!date) return 'Não definido';
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };
  
  // Função para obter o status de publicação
  const getPublishStatus = () => {
    if (formik.values.status === 'draft') {
      return {
        text: 'Rascunho',
        color: 'default',
        icon: <DescriptionIcon color="action" />,
      };
    } else if (formik.values.status === 'scheduled') {
      return {
        text: 'Agendado',
        color: 'info',
        icon: <ScheduleIcon color="info" />,
      };
    } else if (formik.values.status === 'published') {
      return {
        text: 'Publicado',
        color: 'success',
        icon: <CheckCircleIcon color="success" />,
      };
    } else if (formik.values.status === 'unpublished') {
      return {
        text: 'Não publicado',
        color: 'default',
        icon: <VisibilityOffIcon color="action" />,
      };
    } else {
      return {
        text: 'Desconhecido',
        color: 'default',
        icon: <HelpOutlineIcon color="action" />,
      };
    }
  };
  
  // Função para abrir o diálogo de publicação
  const handleOpenPublishDialog = () => {
    setOpenPublishDialog(true);
  };
  
  // Função para fechar o diálogo de publicação
  const handleClosePublishDialog = () => {
    setOpenPublishDialog(false);
    setPublishOption('publish_now');
    setScheduledDate(() => {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
      now.setSeconds(0);
      return now;
    });
  };
  
  // Função para confirmar a publicação
  const handleConfirmPublish = () => {
    if (publishOption === 'publish_now') {
      // Publicar agora
      onPublish('published');
    } else if (publishOption === 'schedule') {
      // Agendar publicação
      onPublish('scheduled', scheduledDate);
    } else if (publishOption === 'save_draft') {
      // Salvar como rascunho
      onPublish('draft');
    } else if (publishOption === 'unpublish') {
      // Despublicar
      onPublish('unpublished');
    }
    handleClosePublishDialog();
  };
  
  // Função para abrir o menu de opções
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Função para fechar o menu de opções
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  // Função para copiar o link da atividade
  const handleCopyLink = () => {
    // Implementar lógica para copiar o link da atividade
    console.log('Copiando link da atividade...');
    handleCloseMenu();
  };
  
  // Função para visualizar a atividade
  const handlePreview = () => {
    // Implementar lógica para visualizar a atividade
    console.log('Visualizando atividade...');
    handleCloseMenu();
  };
  
  // Função para duplicar a atividade
  const handleDuplicate = () => {
    // Implementar lógica para duplicar a atividade
    console.log('Duplicando atividade...');
    handleCloseMenu();
  };
  
  // Verificar se a data agendada é válida (pelo menos 5 minutos no futuro)
  const isScheduledDateValid = scheduledDate && isAfter(scheduledDate, new Date());
  
  // Verificar se o botão de publicação deve estar desabilitado
  const isPublishButtonDisabled = 
    isPublishing || 
    (publishOption === 'schedule' && !isScheduledDateValid);
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Publicar Atividade
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Revise as configurações da atividade e publique quando estiver pronto.
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>
      
      <Grid container spacing={4}>
        {/* Resumo da Atividade */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Resumo da Atividade
              </Typography>
              <Chip
                label={getPublishStatus().text}
                color={getPublishStatus().color}
                size="small"
                icon={getPublishStatus().icon}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Título
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formik.values.title || 'Sem título'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Tipo de Atividade
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {formik.values.type === 'assignment' && (
                    <>
                      <AssignmentIcon color="primary" />
                      <Typography>Atividade</Typography>
                    </>
                  )}
                  {formik.values.type === 'quiz' && (
                    <>
                      <QuizIcon color="secondary" />
                      <Typography>Questionário</Typography>
                    </>
                  )}
                  {formik.values.type === 'material' && (
                    <>
                      <BookIcon color="info" />
                      <Typography>Material</Typography>
                    </>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Data de Início
                </Typography>
                <Typography variant="body1">
                  {formik.values.availableFrom 
                    ? formatDate(formik.values.availableFrom) 
                    : 'Imediatamente após a publicação'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Data de Término
                </Typography>
                <Typography variant="body1">
                  {formik.values.dueDate 
                    ? formatDate(formik.values.dueDate) 
                    : 'Sem data de término'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Visibilidade
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formik.values.isVisible 
                    ? 'Visível para os alunos' 
                    : 'Oculto dos alunos'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Anexos
                </Typography>
                <Typography variant="body1">
                  {formik.values.attachments?.length > 0 
                    ? `${formik.values.attachments.length} arquivo(s) anexado(s)`
                    : 'Nenhum arquivo anexado'}
                </Typography>
              </Grid>
              
              {formik.values.type === 'quiz' && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Número de Questões
                    </Typography>
                    <Typography variant="body1">
                      {formik.values.questions?.length || 0} questões
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Pontuação Total
                    </Typography>
                    <Typography variant="body1">
                      {formik.values.points || 0} pontos
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
          
          {/* Verificação de Conclusão */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Verificação de Conclusão
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  {formik.values.title ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="Título da Atividade"
                  secondary={formik.values.title ? 'Preenchido' : 'Obrigatório'}
                />
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemIcon>
                  {formik.values.description ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="Descrição"
                  secondary={formik.values.description ? 'Preenchida' : 'Recomendado'}
                />
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemIcon>
                  {formik.values.type === 'quiz' && formik.values.questions?.length > 0 ? (
                    <CheckCircleIcon color="success" />
                  ) : formik.values.type === 'quiz' ? (
                    <ErrorIcon color="error" />
                  ) : (
                    <CheckCircleIcon color="success" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={formik.values.type === 'quiz' ? 'Questões' : 'Conteúdo'}
                  secondary={
                    formik.values.type === 'quiz' 
                      ? formik.values.questions?.length > 0 
                        ? `${formik.values.questions.length} questões adicionadas` 
                        : 'Adicione pelo menos uma questão'
                      : 'Conteúdo pronto para publicação'
                  }
                />
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemIcon>
                  {formik.values.availableFrom && isAfter(new Date(formik.values.availableFrom), new Date()) ? (
                    <InfoIcon color="info" />
                  ) : (
                    <CheckCircleIcon color="success" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="Disponibilidade"
                  secondary={
                    formik.values.availableFrom 
                      ? isAfter(new Date(formik.values.availableFrom), new Date())
                        ? `Disponível a partir de ${formatDate(formik.values.availableFrom)}`
                        : 'Disponível imediatamente'
                      : 'Disponível imediatamente'
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Painel de Publicação */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, mb: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Publicar
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                <InputLabel id="visibility-label">Visibilidade</InputLabel>
                <Select
                  labelId="visibility-label"
                  id="visibility"
                  value={formik.values.isVisible ? 'visible' : 'hidden'}
                  onChange={(e) => formik.setFieldValue('isVisible', e.target.value === 'visible')}
                  label="Visibilidade"
                >
                  <MenuItem value="visible">Visível para os alunos</MenuItem>
                  <MenuItem value="hidden">Oculto dos alunos</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="access-label">Acesso</InputLabel>
                <Select
                  labelId="access-label"
                  id="access"
                  value={formik.values.access || 'all'}
                  onChange={(e) => formik.setFieldValue('access', e.target.value)}
                  label="Acesso"
                >
                  <MenuItem value="all">Todos os alunos</MenuItem>
                  <MenuItem value="specific">Alunos específicos</MenuItem>
                  <MenuItem value="groups">Grupos específicos</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Opções de Publicação
              </Typography>
              
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PublishIcon />}
                onClick={handleOpenPublishDialog}
                disabled={!isFormValid || isPublishing}
                sx={{ mb: 1 }}
              >
                {isPublishing ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Publicando...
                  </>
                ) : formik.values.status === 'published' ? (
                  'Atualizar Publicação'
                ) : formik.values.status === 'scheduled' ? (
                  'Agendar Publicação'
                ) : (
                  'Publicar Agora'
                )}
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<SaveIcon />}
                onClick={() => {
                  formik.setFieldValue('status', 'draft');
                  formik.handleSubmit();
                }}
                disabled={isPublishing}
              >
                Salvar como Rascunho
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Ações
              </Typography>
              
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={handlePreview}
                sx={{ mb: 1 }}
              >
                Visualizar
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleDuplicate}
                sx={{ mb: 1 }}
              >
                Duplicar
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<LinkIcon />}
                onClick={handleCopyLink}
              >
                Copiar Link
              </Button>
            </Box>
          </Paper>
          
          {/* Status de Validação */}
          {hasValidationErrors && (
            <Paper variant="outlined" sx={{ p: 2, borderLeft: `4px solid ${theme.palette.error.main}` }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <ErrorIcon color="error" sx={{ mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Corrija os erros abaixo para publicar
                  </Typography>
                  <List dense>
                    {Object.entries(formik.errors).map(([field, error]) => (
                      <ListItem key={field} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={error}
                          primaryTypographyProps={{ variant: 'caption', color: 'error' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            </Paper>
          )}
          
          {/* Dicas de Publicação */}
          <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2" gutterBottom>
              <InfoIcon color="info" sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />{' '}
              Dicas de Publicação
            </Typography>
            <Typography variant="caption" component="div" sx={{ mb: 1 }}>
              - Revise todas as informações antes de publicar.
            </Typography>
            <Typography variant="caption" component="div" sx={{ mb: 1 }}>
              - Use "Visualizar" para ver como os alunos verão a atividade.
            </Typography>
            <Typography variant="caption" component="div">
              - Você pode editar a atividade após a publicação, mas os alunos poderão ver as alterações imediatamente.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Diálogo de Confirmação de Publicação */}
      <Dialog
        open={openPublishDialog}
        onClose={handleClosePublishDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {publishOption === 'publish_now' && 'Publicar Agora'}
          {publishOption === 'schedule' && 'Agendar Publicação'}
          {publishOption === 'save_draft' && 'Salvar como Rascunho'}
          {publishOption === 'unpublish' && 'Despublicar Atividade'}
        </DialogTitle>
        <DialogContent>
          {publishOption === 'publish_now' && (
            <>
              <DialogContentText gutterBottom>
                Tem certeza de que deseja publicar esta atividade agora? Ela estará imediatamente visível para os alunos com base nas configurações de visibilidade.
              </DialogContentText>
              <Alert severity="info" sx={{ mt: 2 }}>
                <AlertTitle>Dica</AlertTitle>
                Use "Agendar Publicação" se desejar que a atividade fique visível em uma data futura.
              </Alert>
            </>
          )}
          
          {publishOption === 'schedule' && (
            <>
              <DialogContentText gutterBottom>
                Selecione a data e hora em que deseja que esta atividade seja publicada automaticamente.
              </DialogContentText>
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Data e Hora de Publicação"
                  type="datetime-local"
                  value={scheduledDate.toISOString().slice(0, 16)}
                  onChange={(e) => setScheduledDate(new Date(e.target.value))}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().slice(0, 16),
                  }}
                />
                {!isScheduledDateValid && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    Selecione uma data futura.
                  </Typography>
                )}
              </Box>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                A atividade será publicada automaticamente na data e hora especificadas.
              </Alert>
            </>
          )}
          
          {publishOption === 'save_draft' && (
            <DialogContentText>
              Salvar como rascunho permitirá que você continue editando a atividade posteriormente. Ela não estará visível para os alunos até que seja publicada.
            </DialogContentText>
          )}
          
          {publishOption === 'unpublish' && (
            <DialogContentText>
              Ao despublicar esta atividade, ela não estará mais visível para os alunos. Você pode publicá-la novamente a qualquer momento.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePublishDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmPublish} 
            color="primary" 
            variant="contained"
            disabled={isPublishButtonDisabled}
            startIcon={
              isPublishing ? <CircularProgress size={20} color="inherit" /> : <PublishIcon />
            }
          >
            {isPublishing 
              ? 'Processando...' 
              : publishOption === 'publish_now' 
                ? 'Publicar Agora' 
                : publishOption === 'schedule' 
                  ? 'Agendar' 
                  : publishOption === 'save_draft' 
                    ? 'Salvar Rascunho' 
                    : 'Despublicar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublishTab;
