import { supabase } from './supabaseClient';

// Password requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+\-=\[\]{};:\'"\\|,.<>/?`~',
};

// Validate password strength
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`A senha deve ter pelo menos ${PASSWORD_REQUIREMENTS.minLength} caracteres`);
  }
  
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }
  
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }
  
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && 
      !new RegExp(`[${PASSWORD_REQUIREMENTS.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
    errors.push(`A senha deve conter pelo menos um caractere especial: ${PASSWORD_REQUIREMENTS.specialChars}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate CPF (Brazilian Individual Taxpayer Registry)
export const validateCPF = (cpf) => {
  // Remove non-numeric characters
  const cleaned = cpf.replace(/\D/g, '');
  
  // Check if it has 11 digits or if all digits are the same
  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }
  
  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  const digit1 = remainder > 9 ? 0 : remainder;
  
  if (digit1 !== parseInt(cleaned.charAt(9))) {
    return false;
  }
  
  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  const digit2 = remainder > 9 ? 0 : remainder;
  
  return digit2 === parseInt(cleaned.charAt(10));
};


// Rate limiting for authentication attempts
const authAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const checkAuthAttempts = (identifier) => {
  const attempt = authAttempts.get(identifier);
  const now = Date.now();
  
  if (attempt) {
    // Reset attempts if lockout period has passed
    if (now - attempt.lastAttempt > LOCKOUT_DURATION) {
      authAttempts.delete(identifier);
      return { blocked: false, remainingAttempts: MAX_ATTEMPTS };
    }
    
    // Check if user is blocked
    if (attempt.count >= MAX_ATTEMPTS) {
      const timeLeft = Math.ceil((attempt.lastAttempt + LOCKOUT_DURATION - now) / 1000 / 60);
      return { 
        blocked: true, 
        message: `Muitas tentativas. Tente novamente em ${timeLeft} minutos.`,
        timeLeft
      };
    }
  }
  
  return { 
    blocked: false, 
    remainingAttempts: MAX_ATTEMPTS - (attempt?.count || 0)
  };
};

export const recordAuthAttempt = (identifier, success) => {
  const now = Date.now();
  const attempt = authAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
  
  if (success) {
    // Reset attempts on successful login
    authAttempts.delete(identifier);
  } else {
    // Increment failed attempts
    authAttempts.set(identifier, {
      count: attempt.count + 1,
      lastAttempt: now
    });
  }
};
