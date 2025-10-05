// src/pages/UserProfilePage.jsx
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Button,
  Tabs,
  Tab,
  Paper,
  Grid,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  InputAdornment,
  CircularProgress,
  Switch,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useAuth } from "@/hooks/useAuth";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { toast } from 'react-hot-toast';

const UserProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object({
    displayName: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
    phone: Yup.string().matches(/^[0-9]{10,11}$/, 'Telefone inválido'),
    institution: Yup.string(),
    bio: Yup.string().max(500, 'A biografia deve ter no máximo 500 caracteres'),
  });

  const formik = useFormik({
    initialValues: {
      displayName: currentUser?.displayName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phoneNumber || '',
      institution: currentUser?.institution || '',
      bio: currentUser?.bio || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        await updateProfile(values);
        toast.success('Perfil atualizado com sucesso!');
        setIsEditing(false);
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast.error('Erro ao atualizar perfil. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={currentUser?.photoURL}
                alt={currentUser?.displayName}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              <Typography variant="h5" component="h1" gutterBottom>
                {currentUser?.displayName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {currentUser?.role || 'Usuário'}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(!isEditing)}
                sx={{ mt: 1, mb: 2 }}
              >
                {isEditing ? 'Cancelar' : 'Editar Perfil'}
              </Button>
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/aluno/${currentUser?.id || 'current'}/historico`)}
                  startIcon={<HistoryIcon />}
                  sx={{ minWidth: '200px', mb: 1 }}
                >
                  Histórico Acadêmico
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate(`/aluno/${currentUser?.id || 'current'}/desempenho`)}
                  startIcon={<AssessmentIcon />}
                  sx={{ minWidth: '200px', mb: 1 }}
                >
                  Análise de Desempenho
                </Button>
              </Box>
            </Box>

            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <EmailIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="E-mail"
                  secondary={currentUser?.email}
                />
              </ListItem>
              {currentUser?.phoneNumber && (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PhoneIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Telefone"
                    secondary={currentUser.phoneNumber}
                  />
                </ListItem>
              )}
              {currentUser?.institution && (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <SchoolIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Instituição"
                    secondary={currentUser.institution}
                  />
                </ListItem>
              )}
            </List>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
              sx={{ mb: 3 }}
            >
              <Tab label="Informações Pessoais" />
              <Tab label="Segurança" />
              <Tab label="Preferências" />
            </Tabs>

            {tabValue === 0 && (
              <Box component="form" onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="displayName"
                      name="displayName"
                      label="Nome completo"
                      value={formik.values.displayName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.displayName && Boolean(formik.errors.displayName)}
                      helperText={formik.touched.displayName && formik.errors.displayName}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="E-mail"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="phone"
                      name="phone"
                      label="Telefone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="institution"
                      name="institution"
                      label="Instituição"
                      value={formik.values.institution}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.institution && Boolean(formik.errors.institution)}
                      helperText={formik.touched.institution && formik.errors.institution}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SchoolIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="bio"
                      name="bio"
                      label="Biografia"
                      multiline
                      rows={4}
                      value={formik.values.bio}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.bio && Boolean(formik.errors.bio)}
                      helperText={formik.touched.bio && formik.errors.bio}
                      disabled={!isEditing}
                    />
                  </Grid>
                  {isEditing && (
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isLoading || !formik.dirty}
                        startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                      >
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Segurança da Conta
                </Typography>
                <List>
                  <ListItem
                    button
                    onClick={() => {/* Implementar mudança de senha */}}
                    sx={{
                      '&:hover': { backgroundColor: 'action.hover' },
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <LockIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Alterar Senha"
                      secondary="Atualize sua senha regularmente para manter sua conta segura"
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem
                    sx={{
                      '&:hover': { backgroundColor: 'action.hover' },
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <SecurityIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Autenticação de Dois Fatores"
                      secondary="Adicione uma camada extra de segurança à sua conta"
                      secondaryTypographyProps={{ color: 'primary.main' }}
                    />
                    <Switch
                      edge="end"
                      checked={currentUser?.twoFactorEnabled || false}
                      onChange={() => {/* Implementar 2FA */}}
                    />
                  </ListItem>
                </List>
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Preferências
                </Typography>
                <List>
                  <ListItem
                    sx={{
                      '&:hover': { backgroundColor: 'action.hover' },
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <LanguageIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Idioma"
                      secondary="Português (Brasil)"
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem
                    sx={{
                      '&:hover': { backgroundColor: 'action.hover' },
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <NotificationsIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Notificações"
                      secondary="Gerenciar preferências de notificação"
                    />
                  </ListItem>
                </List>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Seção de Atividades Recentes */}
      <Typography variant="h6" gutterBottom>
        Atividades Recentes
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <List>
          {[1, 2, 3].map((item) => (
            <React.Fragment key={item}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <BadgeIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`Atividade ${item}`}
                  secondary={`Você completou esta atividade em ${new Date().toLocaleDateString()}`}
                />
                <Typography variant="caption" color="text.secondary">
                  {new Date().toLocaleTimeString()}
                </Typography>
              </ListItem>
              {item < 3 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default UserProfilePage;
