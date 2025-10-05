import React from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  useTheme,
  Chip,
  LinearProgress,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
} from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Link as LinkIcon,
  Publish as PublishIcon,
  UploadFile as UploadFileIcon,
  VideoLibrary as VideoLibraryIcon,
  AddLink as AddLinkIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

const fileTypeIcons = {
  'application/pdf': <DescriptionIcon />,
  'application/msword': <DescriptionIcon />,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': <DescriptionIcon />,
  'application/vnd.ms-powerpoint': <DescriptionIcon />,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': <DescriptionIcon />,
  'application/vnd.ms-excel': <DescriptionIcon />,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': <DescriptionIcon />,
  'image/jpeg': <ImageIcon />,
  'image/png': <ImageIcon />,
  'image/gif': <ImageIcon />,
  'video/mp4': <VideoLibraryIcon />,
  'video/quicktime': <VideoLibraryIcon />,
  'audio/mpeg': <DescriptionIcon />,
  'audio/wav': <DescriptionIcon />,
  'text/plain': <DescriptionIcon />,
  'text/csv': <DescriptionIcon />,
  'application/zip': <DescriptionIcon />,
  'application/x-rar-compressed': <DescriptionIcon />,
  'application/x-7z-compressed': <DescriptionIcon />,
  'default': <InsertDriveFileIcon />,
};

const AssignmentDetailsTab = ({ 
  formik, 
  tabValue, 
  onTabChange, 
  attachments, 
  onFileUpload, 
  onRemoveAttachment, 
  fileInputRef 
}) => {
  const theme = useTheme();
  
  // Verificar se a aba atual está ativa
  if (tabValue !== 'details') return null;
  
  // Obter ícone com base no tipo de arquivo
  const getFileIcon = (fileType) => {
    return fileTypeIcons[fileType] || fileTypeIcons['default'];
  };
  
  // Formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Manipulador para arrastar e soltar arquivos
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const fileObjects = files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        file,
      }));
      
      // Simular o evento de upload de arquivo
      const event = { target: { files } };
      onFileUpload(event);
    }
  };
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Detalhes da Atividade
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Forneça informações básicas sobre a atividade, como título, descrição e materiais de apoio.
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="title"
            name="title"
            label="Título da Atividade"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
            variant="outlined"
            margin="normal"
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1, mb: 1 }}>
            Descrição
          </Typography>
          <TextField
            fullWidth
            id="description"
            name="description"
            placeholder="Descreva a atividade para os alunos..."
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            variant="outlined"
            multiline
            rows={6}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box 
            sx={{ 
              border: `2px dashed ${theme.palette.divider}`,
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: 'action.hover',
              },
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUploadIcon fontSize="large" color="action" sx={{ mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Arraste e solte os arquivos aqui
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Ou clique para selecionar arquivos do seu computador
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Formatos suportados: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG, GIF, MP4, MP3, ZIP
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Tamanho máximo por arquivo: 100MB
            </Typography>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileUpload}
              multiple
              style={{ display: 'none' }}
            />
          </Box>
          
          {attachments.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Anexos ({attachments.length})
              </Typography>
              <List dense>
                {attachments.map((file) => (
                  <Paper 
                    key={file.id} 
                    variant="outlined" 
                    sx={{ 
                      mb: 1,
                      overflow: 'hidden',
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography noWrap sx={{ maxWidth: '60%' }}>
                            {file.name}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                              {formatFileSize(file.size)}
                            </Typography>
                            {file.status === 'uploading' && (
                              <Chip 
                                label="Enviando..." 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            )}
                            {file.status === 'completed' && (
                              <Chip 
                                label="Concluído" 
                                size="small" 
                                color="success" 
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            )}
                            {file.status === 'error' && (
                              <Chip 
                                label="Erro" 
                                size="small" 
                                color="error" 
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            )}
                          </>
                        }
                        secondaryTypographyProps={{ 
                          component: 'div',
                          sx: { 
                            display: 'flex', 
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
                            mt: 0.5,
                          } 
                        }}
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Remover">
                          <IconButton 
                            edge="end" 
                            aria-label="remover"
                            onClick={() => onRemoveAttachment(file.id)}
                            size="small"
                            sx={{ color: 'error.main' }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {file.status === 'uploading' && (
                      <LinearProgress 
                        variant="determinate" 
                        value={file.progress} 
                        sx={{ height: 2 }}
                      />
                    )}
                  </Paper>
                ))}
              </List>
            </Box>
          )}
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Configurações de Envio
          </Typography>
          <FormControl 
            fullWidth 
            variant="outlined" 
            margin="normal"
            error={formik.touched.submissionType && Boolean(formik.errors.submissionType)}
          >
            <InputLabel id="submission-type-label">Tipo de Envio</InputLabel>
            <Select
              labelId="submission-type-label"
              id="submissionType"
              name="submissionType"
              value={formik.values.submissionType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Tipo de Envio"
            >
              <MenuItem value="online">Texto online</MenuItem>
              <MenuItem value="file">Upload de arquivo</MenuItem>
              <MenuItem value="both">Texto online e upload de arquivo</MenuItem>
              <MenuItem value="none">Nenhum envio necessário</MenuItem>
            </Select>
            {formik.touched.submissionType && formik.errors.submissionType && (
              <FormHelperText>{formik.errors.submissionType}</FormHelperText>
            )}
          </FormControl>
          
          <Collapse in={formik.values.submissionType === 'file' || formik.values.submissionType === 'both'}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel id="allowed-file-types-label">Tipos de Arquivo Permitidos</InputLabel>
              <Select
                labelId="allowed-file-types-label"
                id="allowedFileTypes"
                name="allowedFileTypes"
                multiple
                value={formik.values.allowedFileTypes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Tipos de Arquivo Permitidos"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="pdf">PDF (.pdf)</MenuItem>
                <MenuItem value="doc">Documento Word (.doc, .docx)</MenuItem>
                <MenuItem value="ppt">Apresentação (.ppt, .pptx)</MenuItem>
                <MenuItem value="xls">Planilha (.xls, .xlsx, .csv)</MenuItem>
                <MenuItem value="image">Imagem (.jpg, .jpeg, .png, .gif)</MenuItem>
                <MenuItem value="video">Vídeo (.mp4, .mov, .avi)</MenuItem>
                <MenuItem value="audio">Áudio (.mp3, .wav)</MenuItem>
                <MenuItem value="archive">Arquivo compactado (.zip, .rar, .7z)</MenuItem>
                <MenuItem value="text">Arquivo de texto (.txt)</MenuItem>
                <MenuItem value="any">Qualquer tipo de arquivo</MenuItem>
              </Select>
              <FormHelperText>
                Selecione os tipos de arquivo que os alunos podem enviar
              </FormHelperText>
            </FormControl>
            
            <TextField
              fullWidth
              id="maxFileSize"
              name="maxFileSize"
              label="Tamanho máximo por arquivo (MB)"
              type="number"
              value={formik.values.maxFileSize || 10}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              variant="outlined"
              margin="normal"
              InputProps={{
                endAdornment: 'MB',
              }}
              inputProps={{
                min: 1,
                max: 100,
              }}
            />
          </Collapse>
          
          <TextField
            fullWidth
            id="points"
            name="points"
            label="Pontos"
            type="number"
            value={formik.values.points}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.points && Boolean(formik.errors.points)}
            helperText={formik.touched.points && formik.errors.points}
            variant="outlined"
            margin="normal"
            InputProps={{
              inputProps: {
                min: 0,
                step: 0.5,
              },
            }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={formik.values.allowLateSubmissions}
                onChange={(e) => {
                  formik.setFieldValue('allowLateSubmissions', e.target.checked);
                  if (!e.target.checked) {
                    formik.setFieldValue('latePenalty', 0);
                  }
                }}
                color="primary"
              />
            }
            label="Permitir envios atrasados"
            sx={{ mt: 1, display: 'block' }}
          />
          
          <Collapse in={formik.values.allowLateSubmissions} sx={{ pl: 4, mt: 1 }}>
            <TextField
              fullWidth
              id="latePenalty"
              name="latePenalty"
              label="Penalidade por atraso (por dia)"
              type="number"
              value={formik.values.latePenalty}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              variant="outlined"
              margin="normal"
              InputProps={{
                endAdornment: '%',
                inputProps: {
                  min: 0,
                  max: 100,
                  step: 5,
                },
              }}
              helperText="Porcentagem de penalidade aplicada por dia de atraso"
            />
          </Collapse>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssignmentDetailsTab;
