import React from 'react';
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
  Collapse,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  HelpOutline as HelpOutlineIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

const AssignmentSettingsTab = ({ formik, tabValue, onTabChange }) => {
  const theme = useTheme();
  
  // Verificar se a aba atual está ativa
  if (tabValue !== 'settings') return null;
  
  // Função para adicionar uma nova data de entrega
  const handleAddDueDate = () => {
    const newDueDate = {
      id: `due-date-${Date.now()}`,
      name: `Entrega ${formik.values.dueDates.length + 1}`,
      dueDate: null,
      isActive: true,
      isLocked: false,
      isVisible: true,
    };
    
    formik.setFieldValue('dueDates', [...formik.values.dueDates, newDueDate]);
  };
  
  // Função para remover uma data de entrega
  const handleRemoveDueDate = (id) => {
    formik.setFieldValue(
      'dueDates',
      formik.values.dueDates.filter((date) => date.id !== id)
    );
  };
  
  // Função para atualizar uma data de entrega
  const handleUpdateDueDate = (id, field, value) => {
    formik.setFieldValue(
      'dueDates',
      formik.values.dueDates.map((date) =>
        date.id === id ? { ...date, [field]: value } : date
      )
    );
  };
  
  // Função para alternar visibilidade de uma data de entrega
  const toggleDueDateVisibility = (id) => {
    formik.setFieldValue(
      'dueDates',
      formik.values.dueDates.map((date) =>
        date.id === id ? { ...date, isVisible: !date.isVisible } : date
      )
    );
  };
  
  // Função para alternar bloqueio de uma data de entrega
  const toggleDueDateLock = (id) => {
    formik.setFieldValue(
      'dueDates',
      formik.values.dueDates.map((date) =>
        date.id === id ? { ...date, isLocked: !date.isLocked } : date
      )
    );
  };
  
  // Função para formatar a data para exibição
  const formatDate = (date) => {
    if (!date) return 'Não definido';
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Configurações da Atividade
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure as opções de disponibilidade, prazos e outras configurações da atividade.
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Disponibilidade
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <DateTimePicker
                    label="Data de início"
                    value={formik.values.availableFrom}
                    onChange={(date) => formik.setFieldValue('availableFrom', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                        error={formik.touched.availableFrom && Boolean(formik.errors.availableFrom)}
                        helperText={formik.touched.availableFrom && formik.errors.availableFrom}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.hasDueDate}
                        onChange={(e) => {
                          formik.setFieldValue('hasDueDate', e.target.checked);
                          if (!e.target.checked) {
                            formik.setFieldValue('dueDate', null);
                          }
                        }}
                        color="primary"
                      />
                    }
                    label="Definir data de encerramento"
                    sx={{ mt: 1, display: 'block' }}
                  />
                  
                  <Collapse in={formik.values.hasDueDate} sx={{ mt: 1 }}>
                    <DateTimePicker
                      label="Data de encerramento"
                      value={formik.values.dueDate}
                      onChange={(date) => formik.setFieldValue('dueDate', date)}
                      minDateTime={formik.values.availableFrom || new Date()}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          margin="normal"
                          error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                          helperText={formik.touched.dueDate && formik.errors.dueDate}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                    />
                  </Collapse>
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Configurações de tempo
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.enableTimeLimit}
                  onChange={(e) => {
                    formik.setFieldValue('enableTimeLimit', e.target.checked);
                    if (!e.target.checked) {
                      formik.setFieldValue('timeLimitHours', 0);
                      formik.setFieldValue('timeLimitMinutes', 30);
                    }
                  }}
                  color="primary"
                />
              }
              label="Limitar tempo para conclusão"
              sx={{ mt: 1, display: 'block' }}
            />
            
            <Collapse in={formik.values.enableTimeLimit} sx={{ pl: 4, mt: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="timeLimitHours"
                    name="timeLimitHours"
                    label="Horas"
                    type="number"
                    value={formik.values.timeLimitHours}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    variant="outlined"
                    margin="normal"
                    inputProps={{
                      min: 0,
                      max: 23,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="timeLimitMinutes"
                    name="timeLimitMinutes"
                    label="Minutos"
                    type="number"
                    value={formik.values.timeLimitMinutes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    variant="outlined"
                    margin="normal"
                    inputProps={{
                      min: 0,
                      max: 59,
                      step: 5,
                    }}
                  />
                </Grid>
              </Grid>
            </Collapse>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Datas de entrega
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddDueDate}
                disabled={formik.values.dueDates.length >= 5}
              >
                Adicionar data
              </Button>
            </Box>
            
            {formik.values.dueDates.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: 'action.hover',
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <EventIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Nenhuma data de entrega definida
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Clique em "Adicionar data" para criar uma nova data de entrega
                </Typography>
              </Paper>
            ) : (
              <Box>
                {formik.values.dueDates.map((dueDate) => (
                  <Paper
                    key={dueDate.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 2,
                      position: 'relative',
                      borderLeft: `4px solid ${
                        dueDate.isActive
                          ? theme.palette.primary.main
                          : theme.palette.grey[400]
                      }`,
                      opacity: dueDate.isActive ? 1 : 0.7,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TextField
                        fullWidth
                        value={dueDate.name}
                        onChange={(e) =>
                          handleUpdateDueDate(dueDate.id, 'name', e.target.value)
                        }
                        variant="standard"
                        sx={{
                          '& .MuiInputBase-input': {
                            fontWeight: 'bold',
                            fontSize: '1rem',
                          },
                        }}
                        margin="none"
                      />
                      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                        <Tooltip
                          title={dueDate.isVisible ? 'Ocultar dos alunos' : 'Mostrar para os alunos'}
                        >
                          <IconButton
                            size="small"
                            onClick={() => toggleDueDateVisibility(dueDate.id)}
                            color={dueDate.isVisible ? 'primary' : 'default'}
                          >
                            {dueDate.isVisible ? (
                              <VisibilityIcon fontSize="small" />
                            ) : (
                              <VisibilityOffIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={dueDate.isLocked ? 'Desbloquear edição' : 'Bloquear edição'}
                        >
                          <IconButton
                            size="small"
                            onClick={() => toggleDueDateLock(dueDate.id)}
                            color={dueDate.isLocked ? 'warning' : 'default'}
                          >
                            {dueDate.isLocked ? (
                              <LockIcon fontSize="small" />
                            ) : (
                              <LockOpenIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remover data">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveDueDate(dueDate.id)}
                            disabled={formik.values.dueDates.length <= 1}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                      <DateTimePicker
                        label="Data e hora"
                        value={dueDate.dueDate}
                        onChange={(date) =>
                          handleUpdateDueDate(dueDate.id, 'dueDate', date)
                        }
                        disabled={dueDate.isLocked}
                        minDateTime={formik.values.availableFrom || new Date()}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            size="small"
                            margin="normal"
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        icon={<EventIcon fontSize="small" />}
                        label={dueDate.dueDate ? formatDate(dueDate.dueDate) : 'Não definido'}
                        size="small"
                        variant="outlined"
                        color={dueDate.isActive ? 'primary' : 'default'}
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Chip
                        icon={dueDate.isActive ? <EventAvailableIcon fontSize="small" /> : <EventBusyIcon fontSize="small" />}
                        label={dueDate.isActive ? 'Ativo' : 'Inativo'}
                        size="small"
                        variant="outlined"
                        color={dueDate.isActive ? 'success' : 'default'}
                        sx={{ fontSize: '0.7rem' }}
                        onClick={() =>
                          handleUpdateDueDate(dueDate.id, 'isActive', !dueDate.isActive)
                        }
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Verificação de Plágio
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={!!formik.values.plagiarism_enabled}
                  onChange={(e) => formik.setFieldValue('plagiarism_enabled', e.target.checked)}
                  color="primary"
                />
              }
              label="Ativar verificação de plágio (Winston AI)"
              sx={{ mt: 1, display: 'block' }}
            />

            <Collapse in={!!formik.values.plagiarism_enabled} sx={{ pl: 4, mt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!formik.values.show_plagiarism_notice}
                    onChange={(e) => formik.setFieldValue('show_plagiarism_notice', e.target.checked)}
                    color="primary"
                  />
                }
                label="Exibir aviso ao aluno de que a atividade será verificada (sem mostrar resultados)"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                A verificação ocorre de forma assíncrona e não impacta a entrega. Classificações: Médio (&gt;20%), Grave (&gt;35%), Gravíssimo (&gt;50%).
              </Typography>
            </Collapse>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Configurações avançadas
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.allowResubmissions}
                  onChange={(e) =>
                    formik.setFieldValue('allowResubmissions', e.target.checked)
                  }
                  color="primary"
                />
              }
              label="Permitir reenvios"
              sx={{ mt: 1, display: 'block' }}
            />
            
            {formik.values.allowResubmissions && (
              <Box sx={{ pl: 4, mt: 1 }}>
                <FormControl fullWidth variant="outlined" margin="normal" size="small">
                  <InputLabel id="resubmission-limit-label">
                    Limite de reenvios
                  </InputLabel>
                  <Select
                    labelId="resubmission-limit-label"
                    id="resubmissionLimit"
                    name="resubmissionLimit"
                    value={formik.values.resubmissionLimit}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Limite de reenvios"
                  >
                    <MenuItem value={1}>1 reenvio</MenuItem>
                    <MenuItem value={2}>2 reenvios</MenuItem>
                    <MenuItem value={3}>3 reenvios</MenuItem>
                    <MenuItem value={5}>5 reenvios</MenuItem>
                    <MenuItem value={10}>10 reenvios</MenuItem>
                    <MenuItem value={0}>Ilimitado</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
            
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.requirePasscode}
                  onChange={(e) => {
                    formik.setFieldValue('requirePasscode', e.target.checked);
                    if (!e.target.checked) {
                      formik.setFieldValue('passcode', '');
                    }
                  }}
                  color="primary"
                />
              }
              label="Exigir senha de acesso"
              sx={{ mt: 1, display: 'block' }}
            />
            
            {formik.values.requirePasscode && (
              <Box sx={{ pl: 4, mt: 1 }}>
                <TextField
                  fullWidth
                  id="passcode"
                  name="passcode"
                  label="Senha de acesso"
                  type="text"
                  value={formik.values.passcode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  variant="outlined"
                  margin="normal"
                  size="small"
                  helperText="Os alunos precisarão digitar esta senha para acessar a atividade"
                />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssignmentSettingsTab;
