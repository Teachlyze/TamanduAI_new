import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';

const StudentNicknameManager = ({ classId, students, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [nickname, setNickname] = useState('');
  const { toast } = useToast();

  const handleEdit = (student) => {
    setEditingId(student.id);
    setNickname(student.nickname || '');
  };

  const handleSave = async (studentId) => {
    try {
      const { error } = await supabase
        .from('class_members')
        .update({ nickname: nickname.trim() || null })
        .eq('class_id', classId)
        .eq('user_id', studentId);

      if (error) throw error;

      toast({
        title: 'Apelido salvo',
        description: 'O apelido foi atualizado com sucesso.'
      });

      if (onUpdate) onUpdate();
      setEditingId(null);
    } catch (error) {
      console.error('Error saving nickname:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o apelido.',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setNickname('');
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900">Gerenciar Apelidos</h3>
      <div className="border rounded-md divide-y">
        {students.map((student) => (
          <div key={student.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{student.name}</p>
              {editingId === student.id ? (
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Digite o apelido"
                  className="mt-1"
                  autoFocus
                />
              ) : (
                <p className="text-xs text-gray-500">
                  {student.nickname ? (
                    <>Apelido: <span className="font-medium">{student.nickname}</span></>
                  ) : (
                    <span className="italic">Sem apelido</span>
                  )}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editingId === student.id ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSave(student.id)}
                  >
                    <FiSave className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                  >
                    <FiX className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(student)}
                >
                  <FiEdit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        * Apelidos são visíveis apenas para você
      </p>
    </div>
  );
};

export default StudentNicknameManager;
