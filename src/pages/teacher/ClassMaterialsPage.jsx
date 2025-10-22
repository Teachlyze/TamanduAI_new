import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FolderOpen,
  Download,
  Trash2,
  Edit2,
  Copy,
  Eye,
  BarChart3,
  Filter,
  Grid,
  List,
  Plus,
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import MaterialCategoryFilter from '@/components/materials/MaterialCategoryFilter';
import UploadMaterialModal from '@/components/materials/UploadMaterialModal';
import MaterialCard from '@/components/materials/MaterialCard';
import MaterialTable from '@/components/materials/MaterialTable';
import materialsService from '@/services/materialsService';
import toast from 'react-hot-toast';

const ClassMaterialsPage = () => {
  const { classId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    if (classId) {
      loadMaterials();
      loadStats();
    }
  }, [classId]);

  useEffect(() => {
    applyFilters();
  }, [materials, filters]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialsService.getMaterials(classId);
      setMaterials(data);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      toast.error('Erro ao carregar materiais');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await materialsService.getMaterialStats(classId);
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...materials];

    if (filters.category) {
      filtered = filtered.filter(m => m.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(m =>
        m.tags && filters.tags.some(tag => m.tags.includes(tag))
      );
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(query) ||
        (m.description && m.description.toLowerCase().includes(query))
      );
    }

    setFilteredMaterials(filtered);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    loadMaterials();
    loadStats();
    toast.success('Material enviado com sucesso!');
  };

  const handleDelete = async (materialId) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;

    try {
      await materialsService.deleteMaterial(materialId);
      toast.success('Material excluído');
      loadMaterials();
      loadStats();
    } catch (error) {
      toast.error('Erro ao excluir material');
    }
  };

  const handleDownload = (material) => {
    materialsService.downloadMaterial(material.file_url, material.title);
    toast.success('Download iniciado');
  };

  if (loading) {
    return <LoadingScreen message="Carregando materiais..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">📚 Materiais da Turma</h1>
              <p className="text-white/90 text-lg">
                Organize e compartilhe recursos de aprendizagem
              </p>
            </div>

            <PremiumButton
              variant="white"
              leftIcon={Plus}
              onClick={() => setShowUploadModal(true)}
              className="whitespace-nowrap inline-flex items-center gap-2 bg-white text-purple-600 hover:bg-white/90"
            >
              <span>Enviar Material</span>
            </PremiumButton>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Total</p>
                    <p className="text-2xl font-bold">{stats.total_materials}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Tamanho</p>
                    <p className="text-2xl font-bold">
                      {materialsService.formatFileSize(stats.total_size)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Categorias</p>
                    <p className="text-2xl font-bold">
                      {Object.keys(stats.by_category).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Tipos</p>
                    <p className="text-2xl font-bold">
                      {Object.keys(stats.by_type).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <MaterialCategoryFilter
        classId={classId}
        onFilterChange={setFilters}
      />

      {/* View Toggle */}
      <PremiumCard variant="elevated">
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredMaterials.length} material(is) encontrado(s)
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </PremiumCard>

      {/* Materials Content */}
      {filteredMaterials.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={materials.length === 0 ? 'Nenhum material cadastrado' : 'Nenhum material encontrado'}
          description={
            materials.length === 0
              ? 'Comece enviando seu primeiro material para a turma'
              : 'Tente ajustar os filtros de busca'
          }
          action={
            materials.length === 0 && (
              <PremiumButton
                variant="gradient"
                leftIcon={Upload}
                onClick={() => setShowUploadModal(true)}
              >
                Enviar Primeiro Material
              </PremiumButton>
            )
          }
        />
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((material, index) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  index={index}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  onUpdate={loadMaterials}
                />
              ))}
            </div>
          ) : (
            <MaterialTable
              materials={filteredMaterials}
              onDelete={handleDelete}
              onDownload={handleDownload}
              onUpdate={loadMaterials}
            />
          )}
        </AnimatePresence>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadMaterialModal
          classId={classId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default ClassMaterialsPage;
