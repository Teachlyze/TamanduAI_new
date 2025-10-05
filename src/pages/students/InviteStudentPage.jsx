import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Mail, User, ArrowLeft, Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const InviteStudentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    classId: '',
    message: 'Olá! Você está convidado(a) a se juntar à nossa plataforma educacional.'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Mock classes - Replace with actual API call
  const classes = [
    { id: 'math-9a', name: 'Matemática 9A' },
    { id: 'physics-2b', name: 'Física 2B' },
    { id: 'chem-3c', name: 'Química 3C' },
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }
    
    if (!formData.email) {
      newErrors.email = 'O e-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Por favor, insira um e-mail válido';
    }
    
    if (!formData.classId) {
      newErrors.classId = 'Selecione uma turma';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would call your API here
      // await api.inviteStudent(formData);
      
      setIsSuccess(true);
      
      toast({
        title: 'Convite enviado!',
        description: `Um convite foi enviado para ${formData.email}`,
      });
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          classId: '',
          message: 'Olá! Você está convidado(a) a se juntar à nossa plataforma educacional.'
        });
        setIsSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar convite',
        description: 'Ocorreu um erro ao enviar o convite. Por favor, tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para alunos
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 h-1" />
              <CardHeader className="pt-8 pb-6">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Send className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                  Convidar Aluno
                </CardTitle>
                <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                  Preencha os dados do aluno para enviar um convite
                </CardDescription>
              </CardHeader>
            </div>
            
            <CardContent className="pb-8 px-8">
              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Convite enviado!</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    O convite foi enviado para <span className="font-medium">{formData.email}</span> com sucesso.
                  </p>
                  <Button onClick={() => setIsSuccess(false)}>
                    Enviar outro convite
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nome do Aluno
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                          placeholder="Nome completo do aluno"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        E-mail do Aluno
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                          placeholder="exemplo@escola.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="classId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Turma
                      </Label>
                      <Select 
                        value={formData.classId} 
                        onValueChange={(value) => {
                          setFormData(prev => ({ ...prev, classId: value }));
                          if (errors.classId) {
                            setErrors(prev => ({
                              ...prev,
                              classId: null
                            }));
                          }
                        }}
                      >
                        <SelectTrigger className={`w-full ${errors.classId ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Selecione uma turma" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((classItem) => (
                            <SelectItem key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.classId && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.classId}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mensagem (opcional)
                      </Label>
                      <textarea
                        id="message"
                        name="message"
                        rows="3"
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                        placeholder="Mensagem personalizada para o aluno"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-md shadow-sm transition-all duration-200 flex items-center justify-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="-ml-1 mr-2 h-4 w-4" />
                          Enviar Convite
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>O aluno receberá um e-mail com instruções para criar uma conta.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InviteStudentPage;
