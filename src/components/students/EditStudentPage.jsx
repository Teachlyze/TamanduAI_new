import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Icons
import { 
  Loader2, 
  ArrowLeft, 
  Save,
  Camera, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  AlertCircle,
  Trash2,
  GraduationCap,
  Users,
  FileText
} from 'lucide-react';

// Initialize Supabase client
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Form validation schema
const studentFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  status: z.enum(['active', 'inactive']),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  classId: z.string().min(1, 'Selecione uma turma'),
  enrollmentNumber: z.string().optional(),
  grade: z.string().optional(),
  shift: z.string().optional(),
  emergencyContact: z.string().optional(),
  medicalInfo: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  parentEmail: z.string().email('E-mail do responsável inválido').or(z.literal('')).optional(),
  hasParentInfo: z.boolean().default(false)
}).refine(data => {
  if (data.hasParentInfo) {
    return z.object({
      parentName: z.string().min(3, 'Nome do responsável é obrigatório'),
      parentPhone: z.string().min(10, 'Telefone do responsável é obrigatório'),
      parentEmail: z.string().email('E-mail do responsável inválido')
    }).safeParse(data).success;
  }
  return true;
}, {
  message: 'Preencha todas as informações do responsável',
  path: ['parentName']
});

const EditStudentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Initialize form with react-hook-form and zod
  const form = useForm({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      status: 'active',
      birthDate: '',
      address: '',
      notes: '',
      classId: '',
      enrollmentNumber: '',
      grade: '',
      shift: '',
      emergencyContact: '',
      medicalInfo: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      hasParentInfo: false
    }
  });

  // Watch hasParentInfo to conditionally show/hide parent fields
  const hasParentInfo = form.watch('hasParentInfo');

  // Fetch student data and available classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockStudent = {
          id: id,
          name: 'Ana Silva',
          email: 'ana.silva@email.com',
          phone: '(11) 99999-9999',
          status: 'active',
          birthDate: '2010-05-15',
          address: 'Rua das Flores, 123 - São Paulo/SP',
          notes: 'Aluna dedicada e participativa.',
          classId: '1',
          enrollmentNumber: '2024001',
          grade: '9º Ano',
          shift: 'Manhã',
          emergencyContact: '(11) 98888-8888 - Maria Silva (Mãe)',
          medicalInfo: 'Alergia a amendoim',
          parentName: 'Maria Silva',
          parentPhone: '(11) 98888-7777',
          parentEmail: 'maria.silva@email.com'
        };

        const mockClasses = [
          { id: '1', name: 'Matemática 9A' },
          { id: '2', name: 'Português 9A' },
          { id: '3', name: 'Ciências 9A' },
          { id: '4', name: 'História 9A' },
          { id: '5', name: 'Geografia 9A' }
        ];

        setAvailableClasses(mockClasses);
        
        // Set form values if student data exists
        if (mockStudent) {
          form.reset({
            ...mockStudent,
            hasParentInfo: !!mockStudent.parentName
          });
          
          // Set avatar preview
          setAvatarPreview(`https://ui-avatars.com/api/?name=${encodeURIComponent(mockStudent.name)}&background=4f46e5&color=fff`);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar os dados do aluno. Tente novamente mais tarde.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, form]);

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Formato inválido',
        description: 'Por favor, selecione um arquivo de imagem válido.'
      });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast({
        variant: 'destructive',
        title: 'Arquivo muito grande',
        description: 'A imagem não pode ser maior que 2MB.'
      });
      return;
    }
    
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Handle form submission
  const onSubmit = async (data) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Aluno atualizado com sucesso!",
        description: `Os dados de ${data.name} foram atualizados.`,
      });

      // Navigate back to student details
      navigate(`/dashboard/students/${id}`);

    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar aluno',
        description: 'Não foi possível atualizar os dados do aluno. Tente novamente mais tarde.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete student
  const handleDeleteStudent = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Aluno excluído",
        description: "O aluno foi removido com sucesso.",
      });
      
      navigate('/dashboard/students');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir aluno',
        description: 'Não foi possível excluir o aluno. Tente novamente.'
      });
    }
  };

  // Loading state
  if (isLoading) {
    if (loading) return <LoadingScreen />;

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Carregando dados do aluno...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full space-y-8 p-6">
        {/* Header com gradiente */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white hover:opacity-90"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(`/dashboard/students/${id}`)}
                className="text-white hover:bg-white/20 h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold">Editar Aluno</h1>
                <p className="text-blue-100 text-lg">Atualize as informações do aluno</p>
              </div>
            </div>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Avatar and Basic Info */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white hover:opacity-90">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                      Foto do Aluno
                    </CardTitle>
                    <CardDescription>
                      Adicione uma foto para facilitar a identificação.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                          {avatarPreview ? (
                            <AvatarImage src={avatarPreview} alt={form.getValues('name')} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl hover:opacity-90">
                              {form.getValues('name') ? form.getValues('name').charAt(0).toUpperCase() : 'A'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <label
                          htmlFor="avatar-upload"
                          className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full cursor-pointer hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:opacity-90"
                          title="Alterar foto"
                        >
                          <Camera className="h-4 w-4" />
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Formatos: JPG, PNG, WEBP (máx. 2MB)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white hover:opacity-90">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      Status e Turma
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status do Aluno</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="inactive">Inativo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="classId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Turma</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma turma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableClasses.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Middle Column - Personal Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white hover:opacity-90">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                placeholder="Nome completo do aluno"
                                className="bg-white dark:bg-slate-900 text-foreground pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="exemplo@email.com"
                                className="bg-white dark:bg-slate-900 text-foreground pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                placeholder="(00) 00000-0000"
                                className="bg-white dark:bg-slate-900 text-foreground pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                type="date"
                                className="bg-white dark:bg-slate-900 text-foreground pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Textarea
                                placeholder="Rua, número, complemento, bairro, cidade/UF"
                                className="pl-9 min-h-[80px]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white hover:opacity-90">
                        <GraduationCap className="w-4 h-4 text-white" />
                      </div>
                      Informações Acadêmicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="enrollmentNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Matrícula</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: 2024001"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Série/Ano</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Série" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="6º Ano">6º Ano</SelectItem>
                                <SelectItem value="7º Ano">7º Ano</SelectItem>
                                <SelectItem value="8º Ano">8º Ano</SelectItem>
                                <SelectItem value="9º Ano">9º Ano</SelectItem>
                                <SelectItem value="1º Ano EM">1º Ano EM</SelectItem>
                                <SelectItem value="2º Ano EM">2º Ano EM</SelectItem>
                                <SelectItem value="3º Ano EM">3º Ano EM</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shift"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Turno</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Turno" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Manhã">Manhã</SelectItem>
                                <SelectItem value="Tarde">Tarde</SelectItem>
                                <SelectItem value="Noite">Noite</SelectItem>
                                <SelectItem value="Integral">Integral</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Right Column - Additional Info */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white hover:opacity-90">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        Responsável
                      </CardTitle>
                      <FormField
                        control={form.control}
                        name="hasParentInfo"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0 text-sm">
                              {field.value ? 'Com responsável' : 'Sem responsável'}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className={cn("space-y-4", !hasParentInfo && "opacity-50")}>
                    <FormField
                      control={form.control}
                      name="parentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Responsável</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                placeholder="Nome completo do responsável"
                                className="bg-white dark:bg-slate-900 text-foreground pl-9"
                                disabled={!hasParentInfo}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parentEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail do Responsável</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="exemplo@email.com"
                                className="bg-white dark:bg-slate-900 text-foreground pl-9"
                                disabled={!hasParentInfo}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parentPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone do Responsável</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                placeholder="(00) 00000-0000"
                                className="bg-white dark:bg-slate-900 text-foreground pl-9"
                                disabled={!hasParentInfo}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white hover:opacity-90">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      Informações Adicionais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contato de Emergência</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ex: (11) 98888-8888 - Maria Silva (Mãe)"
                              className="min-h-[60px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="medicalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Informações Médicas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ex: Alergias, medicamentos, necessidades especiais..."
                              className="min-h-[60px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações Gerais</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Informações adicionais sobre o aluno..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="bg-red-50/70 backdrop-blur-sm border-red-200/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-red-700">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white hover:opacity-90">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      Zona de Perigo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Excluir Aluno</p>
                        <p className="text-sm text-muted-foreground">
                          Esta ação não pode ser desfeita. O aluno será removido permanentemente.
                        </p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          type="button" 
                          variant="destructive" 
                          className="w-full bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir Aluno
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteStudent}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Sim, excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end gap-4 pt-6"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/dashboard/students/${id}`)}
                className="bg-white/70 backdrop-blur-sm border-white/50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white min-w-[120px] hover:opacity-90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditStudentPage;
