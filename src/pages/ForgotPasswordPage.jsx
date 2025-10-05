import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from "@/hooks/useAuth";
import PageHeader from '../components/PageHeader';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Verifique sua caixa de entrada para as instruções de redefinição de senha');
    } catch (error) {
      setError('Falha ao redefinir senha. Verifique se o e-mail está correto.');
      console.error('Error resetting password:', error);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
      }}
    >
      <PageHeader />
      <Container component="main" maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Recuperar Senha
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          
          <Typography variant="body1" paragraph>
            Insira o e-mail associado à sua conta. Enviaremos um link para redefinir sua senha.
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-mail"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button 
                color="primary" 
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none' }}
              >
                Voltar para o Login
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
