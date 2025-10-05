// src/components/activities/tabs/MaterialDetailsTab.jsx
import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
  InputAdornment,
  FormHelperText,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  CloudQueue as CloudQueueIcon,
  CloudSync as CloudSyncIcon,
  Image as ImageIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon,
  VideoLibrary as VideoLibraryIcon,
  AudioFile as AudioFileIcon,
  Code as CodeIcon,
  Archive as ArchiveIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';

const MaterialDetailsTab = ({ formik, tabValue, onTabChange }) => {
  if (tabValue !== 'materials' || formik.values.type !== 'material') return null;

  const fileInputRef = useRef(null);
  const [files, setFiles] = useState(formik.values.materials?.files || []);
  const [links, setLinks] = useState(formik.values.materials?.links || []);
  const [currentLink, setCurrentLink] = useState({ title: '', url: '' });
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const fileTypes = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
    document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv'],
    video: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'],
    audio: ['mp3', 'wav', 'ogg', 'm4a'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz'],
    code: ['html', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'xml'],
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (fileTypes.image.includes(extension)) return <ImageIcon />;
    if (fileTypes.document.includes(extension)) {
      if (extension === 'pdf') return <PictureAsPdfIcon />;
      return <DescriptionIcon />;
    }
    if (fileTypes.video.includes(extension)) return <VideoLibraryIcon />;
    if (fileTypes.audio.includes(extension)) return <AudioFileIcon />;
    if (fileTypes.code.includes(extension)) return <CodeIcon />;
    if (fileTypes.archive.includes(extension)) return <ArchiveIcon />;
    
    return <DescriptionIcon />;
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    for (const [type, exts] of Object.entries(fileTypes)) {
      if (exts.includes(extension)) {
        return type;
      }
    }
    
    return 'other';
  };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files).map(file => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'queued',
      progress: 0,
      uploadedAt: null,
    }));

    setFiles([...files, ...newFiles]);
    uploadFiles(newFiles);
  };

  const uploadFiles = async (filesToUpload) => {
    // Simular upload de arquivos
    for (const fileObj of filesToUpload) {
      try {
        const fileIndex = files.findIndex(f => f.id === fileObj.id);
        if (fileIndex === -1) continue;

        // Atualizar status para "uploading"
        const updatedFiles = [...files];
        updatedFiles[fileIndex] = {
          ...updatedFiles[fileIndex],
          status: 'uploading',
          progress: 0,
        };
        setFiles(updatedFiles);

        // Simular progresso de upload
        const totalSize = fileObj.size;
        let uploadedSize = 0;
        const chunkSize = totalSize / 10; // Dividir em 10 partes para simular progresso

        while (uploadedSize < totalSize) {
          await new Promise(resolve => setTimeout(resolve, 300));
          uploadedSize = Math.min(uploadedSize + chunkSize, totalSize);
          const progress = Math.round((uploadedSize / totalSize) * 100);

          const updatedFilesProgress = [...files];
          const currentFileIndex = updatedFilesProgress.findIndex(f => f.id === fileObj.id);
          if (currentFileIndex !== -1) {
            updatedFilesProgress[currentFileIndex] = {
              ...updatedFilesProgress[currentFileIndex],
              progress,
            };
            setFiles(updatedFilesProgress);
          }
        }

        // Atualizar status para "completed"
        const updatedFilesCompleted = [...files];
        const completedFileIndex = updatedFilesCompleted.findIndex(f => f.id === fileObj.id);
        if (completedFileIndex !== -1) {
          updatedFilesCompleted[completedFileIndex] = {
            ...updatedFilesCompleted[completedFileIndex],
            status: 'completed',
            progress: 100,
            uploadedAt: new Date().toISOString(),
            url: URL.createObjectURL(fileObj.file), // URL temporária para visualização
          };
          setFiles(updatedFilesCompleted);
          updateFormikMaterials(updatedFilesCompleted, links);
        }
      } catch (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
        
        // Atualizar status para "error"
        const updatedFilesError = [...files];
        const errorFileIndex = updatedFilesError.findIndex(f => f.id === fileObj.id);
        if (errorFileIndex !== -1) {
          updatedFilesError[errorFileIndex] = {
            ...updatedFilesError[errorFileIndex],
            status: 'error',
            error: 'Falha no upload',
          };
          setFiles(updatedFilesError);
        }
      }
    }
  };

  const handleDeleteFile = (fileId) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    updateFormikMaterials(updatedFiles, links);
  };

  const handleAddLink = () => {
    setCurrentLink({ title: '', url: '' });
    setLinkDialogOpen(true);
  };

  const handleSaveLink = () => {
    if (!currentLink.title.trim() || !currentLink.url.trim()) {
      return;
    }

    // Validar URL
    let url = currentLink.url.trim();
    if (!url.match(/^https?:\/\//)) {
      url = `https://${url}`;
    }

    const newLink = {
      id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: currentLink.title.trim(),
      url,
      addedAt: new Date().toISOString(),
    };

    const updatedLinks = [...links, newLink];
    setLinks(updatedLinks);
    updateFormikMaterials(files, updatedLinks);
    setLinkDialogOpen(false);
  };

  const handleEditLink = (link) => {
    setCurrentLink({
      id: link.id,
      title: link.title,
      url: link.url,
    });
    setLinkDialogOpen(true);
  };

  const handleDeleteLink = (linkId) => {
    const updatedLinks = links.filter(link => link.id !== linkId);
    setLinks(updatedLinks);
    updateFormikMaterials(files, updatedLinks);
  };

  const updateFormikMaterials = (updatedFiles, updatedLinks) => {
    formik.setFieldValue('materials', {
      files: updatedFiles,
      links: updatedLinks,
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const sortedLinks = [...links].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredFiles = sortedFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || getFileType(file.name) === filterType;
    return matchesSearch && matchesType;
  });

  const filteredLinks = sortedLinks.filter(link => {
    return link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           link.url.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <CloudSyncIcon color="info" />;
      case 'completed':
        return <CloudDoneIcon color="success" />;
      case 'error':
        return <CloudOffIcon color="error" />;
      case 'queued':
      default:
        return <CloudQueueIcon color="action" />;
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Materiais do Curso</Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<LinkIcon />}
              onClick={handleAddLink}
            >
              Adicionar Link
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Enviar Arquivo
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              multiple
            />
          </Box>
        </Box>

        <Box mb={3} display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar materiais..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ width: 250 }}
          />

          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="filter-type-label">Filtrar por tipo</InputLabel>
            <Select
              labelId="filter-type-label"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Filtrar por tipo"
            >
              <MenuItem value="all">Todos os tipos</MenuItem>
              <MenuItem value="image">Imagens</MenuItem>
              <MenuItem value="document">Documentos</MenuItem>
              <MenuItem value="video">Vídeos</MenuItem>
              <MenuItem value="audio">Áudios</MenuItem>
              <MenuItem value="archive">Arquivos compactados</MenuItem>
              <MenuItem value="code">Código-fonte</MenuItem>
              <MenuItem value="link">Links</MenuItem>
            </Select>
          </FormControl>

          <Box ml="auto" display="flex" alignItems="center">
            <Tooltip title="Ordenar por nome">
              <IconButton
                onClick={() => handleSort('name')}
                color={sortConfig.key === 'name' ? 'primary' : 'default'}
              >
                {sortConfig.key === 'name' && sortConfig.direction === 'asc' ? (
                  <ArrowUpwardIcon />
                ) : (
                  <ArrowDownwardIcon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Ordenar por data">
              <IconButton
                onClick={() => handleSort('uploadedAt')}
                color={sortConfig.key === 'uploadedAt' ? 'primary' : 'default'}
              >
                {sortConfig.key === 'uploadedAt' && sortConfig.direction === 'asc' ? (
                  <ArrowUpwardIcon />
                ) : (
                  <ArrowDownwardIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Tabs
          value={currentFileIndex === -1 ? 0 : 1}
          onChange={(e, newValue) => setCurrentFileIndex(-1)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 2 }}
        >
          <Tab label="Arquivos" />
          <Tab label="Links" />
        </Tabs>

        {currentFileIndex === -1 ? (
          // Lista de arquivos
          filteredFiles.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p={4}
              textAlign="center"
            >
              <CloudUploadIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Nenhum arquivo adicionado
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Arraste e solte arquivos aqui ou clique no botão "Enviar Arquivo" acima
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mt: 2 }}
              >
                Selecionar Arquivos
              </Button>
            </Box>
          ) : (
            <List>
              {filteredFiles.map((file, index) => (
                <ListItem
                  key={file.id}
                  button
                  onClick={() => {
                    if (file.status === 'completed') {
                      window.open(file.url, '_blank');
                    }
                  }}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    width="100%"
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      width={40}
                      flexShrink={0}
                      mr={2}
                      color={
                        file.status === 'completed' ? 'primary.main' :
                        file.status === 'error' ? 'error.main' :
                        'text.secondary'
                      }
                    >
                      {getFileIcon(file.name)}
                    </Box>
                    
                    <Box flexGrow={1} minWidth={0}>
                      <Typography
                        noWrap
                        variant="subtitle1"
                        title={file.name}
                      >
                        {file.name}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <Chip
                          label={getFileType(file.name)}
                          size="small"
                          sx={{ mr: 1, textTransform: 'capitalize' }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {formatFileSize(file.size)}
                        </Typography>
                        {file.uploadedAt && (
                          <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                            - {new Date(file.uploadedAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                      
                      {file.status === 'uploading' && (
                        <Box width="100%" mt={1}>
                          <LinearProgress
                            variant="determinate"
                            value={file.progress}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {file.progress}% concluído
                          </Typography>
                        </Box>
                      )}
                      
                      {file.status === 'error' && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                          {file.error || 'Erro no upload'}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box ml="auto" display="flex" alignItems="center">
                      {file.status === 'completed' && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(file.url, '_blank');
                          }}
                        >
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                        }}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          )
        ) : (
          // Lista de links
          filteredLinks.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p={4}
              textAlign="center"
            >
              <LinkIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Nenhum link adicionado
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Adicione links úteis para materiais externos, vídeos ou outros recursos
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddLink}
                sx={{ mt: 2 }}
              >
                Adicionar Link
              </Button>
            </Box>
          ) : (
            <List>
              {filteredLinks.map((link) => (
                <ListItem
                  key={link.id}
                  button
                  component="a"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    width="100%"
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      width={40}
                      flexShrink={0}
                      mr={2}
                      color="primary.main"
                    >
                      <LinkIcon />
                    </Box>
                    
                    <Box flexGrow={1} minWidth={0}>
                      <Typography
                        noWrap
                        variant="subtitle1"
                        title={link.title}
                      >
                        {link.title || link.url}
                      </Typography>
                      
                      <Typography
                        noWrap
                        variant="body2"
                        color="text.secondary"
                        title={link.url}
                      >
                        {link.url}
                      </Typography>
                    </Box>
                    
                    <Box ml="auto" display="flex" alignItems="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditLink(link);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteLink(link.id);
                        }}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          )
        )}
      </Paper>

      {/* Diálogo para adicionar/editar link */}
      <Dialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentLink.id ? 'Editar Link' : 'Adicionar Link'}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Título"
              value={currentLink.title}
              onChange={(e) => setCurrentLink({
                ...currentLink,
                title: e.target.value,
              })}
              variant="outlined"
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="URL"
              value={currentLink.url}
              onChange={(e) => setCurrentLink({
                ...currentLink,
                url: e.target.value,
              })}
              variant="outlined"
              margin="normal"
              placeholder="https://"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={currentLink.id ? handleSaveLink : handleSaveLink}
            variant="contained"
            color="primary"
            disabled={!currentLink.title.trim() || !currentLink.url.trim()}
          >
            {currentLink.id ? 'Salvar Alterações' : 'Adicionar Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialDetailsTab;
