import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Paper, Alert } from '@mui/material';
import PageHeader from '../components/PageHeader';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('As senhas não coincidem');
    }
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      // Call your API to reset the password with the token
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao redefinir a senha');
      }
      
      setMessage('Senha redefinida com sucesso! Redirecionando para o login...');
      setTimeout(() => navigate('/login'), 3000);
      
    } catch (error) {
      setError(error.message || 'Ocorreu um erro ao redefinir sua senha');
      console.error('Error resetting password:', error);
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <Container component="main" maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Token de redefinição inválido ou expirado
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/forgot-password')}
            sx={{ mt: 3 }}
          >
            Solicitar novo link
          </Button>
        </Paper>
      </Container>
    );
  }

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
            Redefinir Senha
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          
          <Typography variant="body1" paragraph>
            Digite sua nova senha abaixo.
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Nova Senha"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputProps={{
                minLength: 6,
                'aria-describedby': 'password-helper-text'
              }}
              helperText="A senha deve ter pelo menos 6 caracteres"
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Nova Senha"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
