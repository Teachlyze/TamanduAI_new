// src/styles/activityStyles.js

import { alpha } from '@mui/material/styles';

export const activityStyles = (theme) => ({
  // Estilos para os cartões de atividade
  activityCard: {
    transition: theme.transitions.create(['box-shadow', 'transform'], {
      duration: theme.transitions.duration.standard,
    }),
    '&:hover': {
      boxShadow: theme.shadows[8],
      transform: 'translateY(-2px)',
    },
  },
  
  // Estilos para os cabeçalhos das seções
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    '& h2': {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 600,
    },
  },
  
  // Estilos para os chips de status
  statusChip: {
    fontWeight: 600,
    '&.MuiChip-colorSuccess': {
      backgroundColor: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.dark,
    },
    '&.MuiChip-colorDefault': {
      backgroundColor: alpha(theme.palette.grey[500], 0.1),
      color: theme.palette.grey[700],
    },
    '&.MuiChip-colorError': {
      backgroundColor: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.dark,
    },
    '&.MuiChip-colorInfo': {
      backgroundColor: alpha(theme.palette.info.main, 0.1),
      color: theme.palette.info.dark,
    },
    '&.MuiChip-colorWarning': {
      backgroundColor: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.dark,
    },
  },
  
  // Estilos para os cartões de resumo
  summaryCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '& .MuiCardContent-root': {
      flexGrow: 1,
    },
  },
  
  // Estilos para a barra de progresso
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: theme.spacing(1),
  },
  
  // Estilos para a lista de verificação
  checklistItem: {
    '&.MuiListItem-root': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    '& .MuiListItemIcon-root': {
      minWidth: 36,
    },
    '&.completed': {
      opacity: 0.7,
      '& .MuiTypography-root': {
        textDecoration: 'line-through',
        color: theme.palette.text.secondary,
      },
    },
  },
  
  // Estilos para os botões de ação flutuantes
  floatingActionButton: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: theme.zIndex.speedDial,
  },
  
  // Estilos para os cards de arquivo
  fileCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
      '& .file-actions': {
        opacity: 1,
      },
    },
  },
  fileCardMedia: {
    height: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.secondary,
  },
  fileCardActions: {
    justifyContent: 'space-between',
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
  },
  fileActions: {
    opacity: 0,
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  
  // Estilos para o editor de texto rico
  richTextEditor: {
    minHeight: 300,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    '& .public-DraftEditor-content': {
      minHeight: 200,
    },
    '& .rdw-option-wrapper, & .rdw-dropdown-wrapper': {
      border: '1px solid #F1F1F1',
      borderRadius: theme.shape.borderRadius,
      boxShadow: 'none',
      '&:hover': {
        boxShadow: 'none',
        backgroundColor: theme.palette.action.hover,
      },
    },
    '& .rdw-option-active': {
      boxShadow: 'none',
      backgroundColor: theme.palette.action.selected,
    },
  },
  
  // Estilos para os passos do assistente
  stepIcon: {
    '&.MuiStepIcon-root': {
      '&.Mui-completed': {
        color: theme.palette.success.main,
      },
      '&.Mui-active': {
        color: theme.palette.primary.main,
      },
    },
  },
  
  // Estilos para os avisos e alertas
  warningAlert: {
    backgroundColor: alpha(theme.palette.warning.light, 0.1),
    borderLeft: `4px solid ${theme.palette.warning.main}`,
    '& .MuiAlert-icon': {
      color: theme.palette.warning.dark,
    },
  },
  infoAlert: {
    backgroundColor: alpha(theme.palette.info.light, 0.1),
    borderLeft: `4px solid ${theme.palette.info.main}`,
    '& .MuiAlert-icon': {
      color: theme.palette.info.dark,
    },
  },
  successAlert: {
    backgroundColor: alpha(theme.palette.success.light, 0.1),
    borderLeft: `4px solid ${theme.palette.success.main}`,
    '& .MuiAlert-icon': {
      color: theme.palette.success.dark,
    },
  },
  errorAlert: {
    backgroundColor: alpha(theme.palette.error.light, 0.1),
    borderLeft: `4px solid ${theme.palette.error.main}`,
    '& .MuiAlert-icon': {
      color: theme.palette.error.dark,
    },
  },
  
  // Estilos para os cartões de métricas
  metricCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    padding: theme.spacing(3),
    '& .metric-value': {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      margin: theme.spacing(1, 0),
      color: theme.palette.primary.main,
    },
    '& .metric-label': {
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontSize: '0.75rem',
    },
    '& .metric-change': {
      display: 'inline-flex',
      alignItems: 'center',
      marginTop: theme.spacing(1),
      fontSize: '0.875rem',
      '&.positive': {
        color: theme.palette.success.main,
      },
      '&.negative': {
        color: theme.palette.error.main,
      },
    },
  },
  
  // Estilos para os cards de visualização de dados
  dataCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '& .MuiCardHeader-root': {
      paddingBottom: theme.spacing(1),
    },
    '& .MuiCardContent-root': {
      paddingTop: 0,
      flexGrow: 1,
    },
  },
  
  // Estilos para os itens de lista de atividades
  activityListItem: {
    transition: theme.transitions.create('background-color'),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
      },
    },
  },
  
  // Estilos para os badges de notificação
  notificationBadge: {
    '& .MuiBadge-badge': {
      right: -3,
      top: 13,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  },
  
  // Estilos para os botões de ação
  actionButton: {
    textTransform: 'none',
    fontWeight: 500,
    '& + &': {
      marginLeft: theme.spacing(1),
    },
  },
  
  // Estilos para os inputs de formulário
  formControl: {
    marginBottom: theme.spacing(3),
  },
  
  // Estilos para os cartões de configuração
  settingCard: {
    marginBottom: theme.spacing(3),
    '& .MuiCardHeader-root': {
      paddingBottom: 0,
    },
    '& .MuiCardContent-root': {
      paddingTop: 0,
    },
  },
  
  // Estilos para os grupos de botões
  buttonGroup: {
    '& .MuiButtonGroup-grouped': {
      '&:not(:last-child)': {
        borderRightColor: theme.palette.divider,
      },
    },
  },
  
  // Estilos para os tooltips
  tooltip: {
    maxWidth: 300,
    fontSize: theme.typography.pxToRem(13),
    '& .MuiTooltip-arrow': {
      color: theme.palette.grey[800],
    },
  },
  
  // Estilos para os diálogos
  dialogPaper: {
    minHeight: '50vh',
    maxHeight: '90vh',
  },
  
  // Estilos para os painéis de abas
  tabPanel: {
    padding: theme.spacing(3, 0),
  },
  
  // Estilos para os itens de menu
  menuItem: {
    '& .MuiSvgIcon-root': {
      marginRight: theme.spacing(1),
      fontSize: 20,
    },
  },
  
  // Estilos para os avatares
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: theme.palette.primary.main,
  },
  
  // Estilos para os cartões de perfil
  profileCard: {
    textAlign: 'center',
    '& .MuiAvatar-root': {
      width: 80,
      height: 80,
      margin: '0 auto 16px',
    },
  },
  
  // Estilos para os indicadores de status
  statusIndicator: {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: '50%',
    marginRight: theme.spacing(1),
    '&.online': {
      backgroundColor: theme.palette.success.main,
    },
    '&.offline': {
      backgroundColor: theme.palette.grey[400],
    },
    '&.away': {
      backgroundColor: theme.palette.warning.main,
    },
    '&.busy': {
      backgroundColor: theme.palette.error.main,
    },
  },
  
  // Estilos para os cartões de estatísticas
  statCard: {
    position: 'relative',
    overflow: 'hidden',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 4,
    },
    '&.primary:after': {
      backgroundColor: theme.palette.primary.main,
    },
    '&.secondary:after': {
      backgroundColor: theme.palette.secondary.main,
    },
    '&.success:after': {
      backgroundColor: theme.palette.success.main,
    },
    '&.error:after': {
      backgroundColor: theme.palette.error.main,
    },
    '&.warning:after': {
      backgroundColor: theme.palette.warning.main,
    },
    '&.info:after': {
      backgroundColor: theme.palette.info.main,
    },
  },
  
  // Estilos para os cartões de gráfico
  chartCard: {
    '& .MuiCardHeader-root': {
      paddingBottom: 0,
    },
    '& .MuiCardContent-root': {
      paddingTop: 0,
      '&:last-child': {
        paddingBottom: theme.spacing(2),
      },
    },
  },
  
  // Estilos para os cartões de métricas de progresso
  progressCard: {
    display: 'flex',
    alignItems: 'center',
    '& .MuiAvatar-root': {
      width: 56,
      height: 56,
      marginRight: theme.spacing(2),
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
    },
    '& .progress-info': {
      flex: 1,
    },
  },
  
  // Estilos para os cartões de timeline
  timelineCard: {
    position: 'relative',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 20,
      width: 2,
      backgroundColor: theme.palette.divider,
    },
  },
  
  // Estilos para os itens da timeline
  timelineItem: {
    position: 'relative',
    paddingLeft: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    '&:last-child': {
      paddingBottom: 0,
    },
    '&:before': {
      content: '""',
      position: 'absolute',
      left: 16,
      top: 8,
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: theme.palette.primary.main,
      border: `2px solid ${theme.palette.background.paper}`,
      zIndex: 1,
    },
    '&.success:before': {
      backgroundColor: theme.palette.success.main,
    },
    '&.error:before': {
      backgroundColor: theme.palette.error.main,
    },
    '&.warning:before': {
      backgroundColor: theme.palette.warning.main,
    },
    '&.info:before': {
      backgroundColor: theme.palette.info.main,
    },
  },
  
  // Estilos para os cartões de comentários
  commentCard: {
    marginBottom: theme.spacing(2),
    '&:last-child': {
      marginBottom: 0,
    },
  },
  
  // Estilos para os avatares de usuário
  userAvatar: {
    width: 40,
    height: 40,
    marginRight: theme.spacing(2),
  },
  
  // Estilos para os campos de formulário
  formField: {
    marginBottom: theme.spacing(3),
  },
  
  // Estilos para os cartões de configuração
  settingsCard: {
    marginBottom: theme.spacing(3),
    '&:last-child': {
      marginBottom: 0,
    },
  },
  
  // Estilos para os cartões de permissões
  permissionCard: {
    marginBottom: theme.spacing(2),
    '&:last-child': {
      marginBottom: 0,
    },
  },
  
  // Estilos para os botões de ação flutuantes
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      bottom: theme.spacing(3),
      right: theme.spacing(3),
    },
  },
  
  // Estilos para os diálogos de confirmação
  confirmDialog: {
    '& .MuiDialog-paper': {
      width: '100%',
      maxWidth: 400,
    },
  },
  
  // Estilos para os diálogos de formulário
  formDialog: {
    '& .MuiDialog-paper': {
      width: '100%',
      maxWidth: 600,
    },
  },
  
  // Estilos para os diálogos de visualização
  viewDialog: {
    '& .MuiDialog-paper': {
      width: '100%',
      maxWidth: 800,
    },
  },
  
  // Estilos para os diálogos de tela cheia
  fullScreenDialog: {
    '& .MuiDialog-paper': {
      margin: 0,
      width: '100%',
      height: '100%',
      maxHeight: '100%',
      maxWidth: '100%',
      borderRadius: 0,
    },
  },
  
  // Estilos para os diálogos de alerta
  alertDialog: {
    '& .MuiDialog-paper': {
      width: '100%',
      maxWidth: 450,
    },
  },
  
  // Estilos para os diálogos de carregamento
  loadingDialog: {
    '& .MuiDialog-paper': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      overflow: 'hidden',
    },
  },
  
  // Estilos para os diálogos de aviso
  warningDialog: {
    '& .MuiDialog-paper': {
      borderLeft: `6px solid ${theme.palette.warning.main}`,
    },
  },
  
  // Estilos para os diálogos de erro
  errorDialog: {
    '& .MuiDialog-paper': {
      borderLeft: `6px solid ${theme.palette.error.main}`,
    },
  },
  
  // Estilos para os diálogos de sucesso
  successDialog: {
    '& .MuiDialog-paper': {
      borderLeft: `6px solid ${theme.palette.success.main}`,
    },
  },
  
  // Estilos para os diálogos de informação
  infoDialog: {
    '& .MuiDialog-paper': {
      borderLeft: `6px solid ${theme.palette.info.main}`,
    },
  },
  
  // Estilos para os diálogos de pergunta
  questionDialog: {
    '& .MuiDialog-paper': {
      borderLeft: `6px solid ${theme.palette.primary.main}`,
    },
  },
  
  // Estilos para os diálogos de confirmação de ação perigosa
  dangerDialog: {
    '& .MuiDialog-paper': {
      borderLeft: `6px solid ${theme.palette.error.main}`,
    },
  },
  
  // Estilos para os diálogos de confirmação de ação importante
  importantDialog: {
    '& .MuiDialog-paper': {
      borderLeft: `6px solid ${theme.palette.warning.main}`,
    },
  },
  
  // Estilos para os diálogos de confirmação de ação informativa
  noticeDialog: {
    '& .MuiDialog-paper': {
      borderLeft: `6px solid ${theme.palette.info.main}`,
    },
  },
  
  // Estilos para os diálogos de confirmação de ação bem-sucedida
  successActionDialog: {
    '& .MuiDialog-paper': {
      borderLeft: `6px solid ${theme.palette.success.main}`,
    },
  },
  
  // Estilos para os diálogos de confirmação de ação neutra
  neutralDialog: {
    '& .MuiDialog-paper': {
      borderLeft: `6px solid ${theme.palette.grey[500]}`,
    },
  },
  
  // Estilos para os diálogos de confirmação de ação personalizada
  customDialog: (color) => ({
    '& .MuiDialog-paper': {
      borderLeft: `6px solid ${color || theme.palette.primary.main}`,
    },
  }),
});

export default activityStyles;
