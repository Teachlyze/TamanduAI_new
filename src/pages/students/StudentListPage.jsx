import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Add, Delete, Edit, FilterList, Search } from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';

// Componente para o cabeçalho da tabela
const EnhancedTableHead = (props) => {
  const { onSelectAllClick, numSelected, rowCount } = props;
  
  const headCells = [
    { id: 'name', numeric: false, label: 'Nome' },
    { id: 'email', numeric: false, label: 'E-mail' },
    { id: 'class', numeric: false, label: 'Turma' },
    { id: 'status', numeric: false, label: 'Status' },
    { id: 'lastAccess', numeric: false, label: 'Último Acesso' },
    { id: 'actions', numeric: false, label: 'Ações' },
  ];

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'selecionar todos os alunos' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

// Prop Types para validação de props
EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const StudentListPage = () => {
  const navigate = useNavigate();
  // State for students data
  const [students] = useState([
    // Dados de exemplo - substitua pela sua lógica de busca real
    { id: 1, name: 'João Silva', email: 'joao@escola.com', class_name: '1º Ano A', status: 'Ativo', lastAccess: new Date() },
    { id: 2, name: 'Maria Santos', email: 'maria@escola.com', class_name: '2º Ano B', status: 'Ativo', lastAccess: new Date() },
  ]);
  const [loading] = useState(false);
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  // Funções de manipulação
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredStudents.map((student) => student.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtragem de alunos
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      const matchesClass = classFilter === 'all' || student.class_name === classFilter;
      
      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [students, searchTerm, statusFilter, classFilter]);

  const uniqueClasses = useMemo(() => {
    const classes = new Set(students.map(s => s.class_name).filter(Boolean));
    return Array.from(classes).sort();
  }, [students]);

  const isSelected = (id) => selected.indexOf(id) !== -1;
  
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredStudents.length) : 0;
  
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100vh',
      margin: 0,
      padding: 0,
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      <PageHeader 
        title="Gerenciar Alunos" 
        subtitle="Visualize e gerencie os alunos da sua instituição"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate('/dashboard/students/invite')}
          >
            Adicionar Aluno
          </Button>
        }
      />
      
      <Card sx={{ 
        mb: 3, 
        flexShrink: 0, 
        width: '100%',
        marginLeft: 0,
        marginRight: 0,
        '& .MuiCardContent-root': {
          padding: '16px',
          '&:last-child': {
            paddingBottom: '16px'
          }
        }
      }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar alunos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">Todos os status</MenuItem>
                  <MenuItem value="Ativo">Ativo</MenuItem>
                  <MenuItem value="Inativo">Inativo</MenuItem>
                  <MenuItem value="Pendente">Pendente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="class-filter-label">Turma</InputLabel>
                <Select
                  labelId="class-filter-label"
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  label="Turma"
                >
                  <MenuItem value="all">Todas as turmas</MenuItem>
                  {uniqueClasses.map((classItem) => (
                    <MenuItem key={classItem} value={classItem}>
                      {classItem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setClassFilter('all');
                }}
              >
                Limpar Filtros
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Paper sx={{ 
        width: '100%',
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        mb: 0,
        minHeight: 0,
        borderRadius: 0,
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(selected.length > 0 && {
              bgcolor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.primary.light
                  : theme.palette.primary.dark,
            }),
          }}
        >
          {selected.length > 0 ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {selected.length} selecionado(s)
            </Typography>
          ) : (
            <Typography
              sx={{ flex: '1 1 100%' }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              Lista de Alunos
            </Typography>
          )}
          
          {selected.length > 0 && (
            <Tooltip title="Excluir selecionados">
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => {
                  // TODO: Implementar lógica de exclusão
                  console.log('Excluindo alunos selecionados:', selected);
                  setSelected([]);
                }}
                sx={{ mr: 1 }}
              >
                Excluir selecionados
              </Button>
            </Tooltip>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Buscar alunos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filtrar por turma</InputLabel>
              <Select
                value={classFilter}
                label="Filtrar por turma"
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <MenuItem value="all">Todas as turmas</MenuItem>
                {uniqueClasses.map((className) => (
                  <MenuItem key={className} value={className}>
                    {className}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filtrar por status</InputLabel>
              <Select
                value={statusFilter}
                label="Filtrar por status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Todos os status</MenuItem>
                <MenuItem value="Ativo">Ativo</MenuItem>
                <MenuItem value="Inativo">Inativo</MenuItem>
                <MenuItem value="Pendente">Pendente</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Toolbar>
        
        <TableContainer sx={{ 
          flex: '1 1 auto',
          overflow: 'auto',
          minHeight: 0,
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px'
          }
        }}>
          <Table 
            sx={{ 
              minWidth: 750,
              tableLayout: 'fixed'
            }} 
            aria-labelledby="tableTitle"
            stickyHeader
          >
            <EnhancedTableHead
              numSelected={selected.length}
              onSelectAllClick={handleSelectAllClick}
              rowCount={filteredStudents.length}
            />
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                      Carregando alunos...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Search sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="h6" color="textSecondary">
                      Nenhum aluno encontrado
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
                      Tente ajustar sua busca ou filtros
                    </Typography>
                    {searchTerm && (
                      <Button 
                        variant="text" 
                        color="primary" 
                        onClick={() => setSearchTerm('')}
                      >
                        Limpar busca
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student) => {
                    const isItemSelected = isSelected(student.id);
                    const labelId = `student-${student.id}`;
                    
                    return (
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, student.id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={student.id}
                        selected={isItemSelected}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              'aria-labelledby': labelId,
                            }}
                          />
                        </TableCell>
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          sx={{ fontWeight: 'medium' }}
                        >
                          {student.name}
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={student.class} 
                            size="small" 
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              setClassFilter(student.class);
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={student.status} 
                            size="small" 
                            color={
                              student.status === 'Ativo' 
                                ? 'success' 
                                : student.status === 'Pendente' 
                                ? 'warning' 
                                : 'default'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(student.lastAccess).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="Editar">
                              <IconButton 
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/dashboard/students/${student.id}`);
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton 
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Handle delete
                                  console.log('Delete:', student.id);
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por p gina:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from} - ${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            position: 'sticky',
            backgroundColor: 'background.paper',
zIndex: 2
          }}
        />
      </Paper>
    </Box>
  );
};

export default StudentListPage;
