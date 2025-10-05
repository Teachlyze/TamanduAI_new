import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from "@/hooks/useAuth";

// Import tab components
const AssignmentSettingsTab = ({ formik }) => (
  <div>Configurações da Atividade</div>
);

const QuestionBankTab = ({ formik }) => (
  <div>Banco de Questões</div>
);

const MaterialDetailsTab = ({ formik }) => (
  <div>Detalhes do Material</div>
);

const PublishTab = ({ formik, onPublish, isPublishing }) => (
  <div>
    <h3>Publicar Atividade</h3>
    <button 
      onClick={() => onPublish('published')}
      disabled={isPublishing}
    >
      {isPublishing ? 'Publicando...' : 'Publicar Agora'}
    </button>
  </div>
);
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
  Alert,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Event as EventIcon,
  FormatListNumbered as FormatListNumberedIcon,
  HelpOutline as HelpOutlineIcon,
  Image as ImageIcon,
  InsertDriveFile as InsertDriveFileIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Link as LinkIcon,
  MoreVert as MoreVertIcon,
  NoteAdd as NoteAddIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Publish as PublishIcon,
  Quiz as QuizIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  ShortText as ShortTextIcon,
  Subject as SubjectIcon,
  Today as TodayIcon,
  UploadFile as UploadFileIcon,
  VideoLibrary as VideoLibraryIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../common/PageHeader';
import RichTextEditor from '../common/RichTextEditor';

// Componentes de etapas do formulário
import AssignmentDetailsTab from './tabs/AssignmentDetailsTab';
import AssignmentSettingsTab from './tabs/AssignmentSettingsTab';
import QuestionBankTab from './tabs/QuestionBankTab';
import MaterialDetailsTab from './tabs/MaterialDetailsTab';
import PublishTab from './tabs/PublishTab';

// Esquema de validação
const validationSchema = Yup.object().shape({
  title: Yup.string().required('Título é obrigatório'),
  description: Yup.string(),
  type: Yup.string().required('Tipo de atividade é obrigatório'),
  dueDate: Yup.date().when('hasDueDate', {
    is: true,
    then: Yup.date().required('Data de entrega é obrigatória'),
  }),
  dueTime: Yup.string().when('hasDueDate', {
    is: true,
    then: Yup.string().required('Hora de entrega é obrigatória'),
  }),
  points: Yup.number().min(0, 'Pontuação não pode ser negativa'),
  submissionType: Yup.string().when('type', {
    is: 'assignment',
    then: Yup.string().required('Tipo de envio é obrigatório'),
  }),
  allowedFileTypes: Yup.array().when('submissionType', {
    is: 'file',
    then: Yup.array().min(1, 'Selecione pelo menos um tipo de arquivo permitido'),
  }),
});

const CreateActivityForm = ({ isEditing = false, initialData = null }) => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser } = useAuth();
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [tabValue, setTabValue] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [scheduledPublish, setScheduledPublish] = useState(false);
  const [publishDate, setPublishDate] = useState('');
  const [publishTime, setPublishTime] = useState('');

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      type: 'material',
      status: 'draft',
      dueDate: '',
      points: 10,
      allowLateSubmissions: false,
      ...(initialData || {})
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Título é obrigatório'),
      description: Yup.string().required('Descrição é obrigatória'),
      type: Yup.string().required('Tipo de atividade é obrigatório'),
      points: Yup.number().min(0, 'A pontuação não pode ser negativa')
    }),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        // Handle form submission here
        console.log('Form submitted:', values);
      } catch (error) {
        console.error('Error submitting form:', error);
        setError('Ocorreu um erro ao salvar a atividade');
      } finally {
        setIsSubmitting(false);
      }
    }
  });
  
  // Referências
  const fileInputRef = useRef(null);

  const handlePublish = async (status, scheduledDate = null) => {
    try {
      setIsPublishing(true);
      const activityData = {
        ...formik.values,
        status,
        ...(scheduledDate && { scheduledPublishDate: scheduledDate }),
        publishedAt: status === 'published' ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      };
      
      // Chamar API para salvar/publicar
      console.log('Dados para salvar:', activityData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular chamada à API
      
      // Redirecionar ou mostrar mensagem de sucesso
      console.log('Atividade salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            aria-label="abas de criação de atividade"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Detalhes" value="details" />
            <Tab label="Configurações" value="settings" />
            {formik.values.type === 'quiz' && (
              <Tab label="Banco de Questões" value="questions" />
            )}
            {formik.values.type === 'material' && (
              <Tab label="Materiais" value="materials" />
            )}
            <Tab 
              label="Publicar" 
              value="publish" 
              disabled={!formik.dirty || !formik.isValid}
            />
          </Tabs>
        </Box>

        <Box sx={{ mb: 4 }}>
          {tabValue === 'details' && (
            {/* Conteúdo da aba de detalhes */}
          )}

          {tabValue === 'settings' && (
            <AssignmentSettingsTab 
              formik={formik} 
              tabValue={tabValue} 
              onTabChange={setTabValue} 
            />
          )}

          {tabValue === 'questions' && formik.values.type === 'quiz' && (
            <QuestionBankTab 
              formik={formik} 
              tabValue={tabValue} 
              onTabChange={setTabValue} 
            />
          )}

          {tabValue === 'materials' && formik.values.type === 'material' && (
            <MaterialDetailsTab 
              formik={formik} 
              tabValue={tabValue} 
              onTabChange={setTabValue} 
            />
          )}

          {tabValue === 'publish' && (
            <PublishTab 
              formik={formik} 
              tabValue={tabValue} 
              onTabChange={setTabValue} 
              onPublish={handlePublish} 
              isPublishing={isPublishing} 
            />
          )}
        </Box>
      </Box>
    </form>
  );
};

export default CreateActivityForm;
