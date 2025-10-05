import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import PageHeader from '../components/PageHeader';

const EmailConfirmationPage = () => {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token || !email) {
        setStatus('error');
        setError('Link de confirmação inválido ou expirado.');
        return;
      }

      try {
        // Call your API to verify the email confirmation token
        const response = await fetch('/api/auth/confirm-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Falha ao confirmar o e-mail');
        }

        setStatus('success');
      } catch (error) {
        console.error('Error confirming email:', error);
        setStatus('error');
        setError(error.message || 'Ocorreu um erro ao confirmar seu e-mail.');
      }
    };

    confirmEmail();
  }, [token, email]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Verificando seu e-mail...
            </Typography>
            <Typography color="textSecondary">
              Por favor, aguarde enquanto confirmamos seu endereço de e-mail.
            </Typography>
          </Box>
        );
      
      case 'success':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'success.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#fff" />
              </svg>
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              E-mail confirmado com sucesso!
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Seu endereço de e-mail foi confirmado com sucesso.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ mt: 3, px: 4, py: 1.5 }}
            >
              Ir para o Login
            </Button>
          </Box>
        );
      
      case 'error':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'error.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#fff" />
              </svg>
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Falha na confirmação
            </Typography>
            <Typography color="error" paragraph>
              {error}
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => window.location.reload()}
              >
                Tentar Novamente
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/')}
              >
                Página Inicial
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
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
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {renderContent()}
        </Paper>
      </Container>
    </Box>
  );
};

export default EmailConfirmationPage;
