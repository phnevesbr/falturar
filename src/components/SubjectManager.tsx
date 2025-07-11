
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { BookOpen, Plus, Trash2, Edit, CheckCircle, AlertTriangle, XCircle, Settings } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const SubjectManager: React.FC = () => {
  const { subjects, addSubject, updateSubject, deleteSubject } = useData();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    weeklyHours: 1,
    maxAbsences: 5,
    useCustomLimit: false
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Função para gerar cores aleatórias para as matérias
  const generateRandomColor = () => {
    const colors = [
      '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getDefaultMaxAbsences = (weeklyHours: number): number => {
    if (weeklyHours >= 4) return 20;
    if (weeklyHours === 3) return 15;
    if (weeklyHours === 2) return 10;
    return 5;
  };

  const handleWeeklyHoursChange = (hours: number) => {
    setFormData(prev => ({
      ...prev,
      weeklyHours: hours,
      maxAbsences: prev.useCustomLimit ? prev.maxAbsences : getDefaultMaxAbsences(hours)
    }));
  };

  const handleCustomLimitToggle = (useCustom: boolean) => {
    setFormData(prev => ({
      ...prev,
      useCustomLimit: useCustom,
      maxAbsences: useCustom ? prev.maxAbsences : getDefaultMaxAbsences(prev.weeklyHours)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome da matéria.",
        variant: "destructive",
      });
      return;
    }

    if (formData.maxAbsences < 1 || formData.maxAbsences > 50) {
      toast({
        title: "Limite inválido",
        description: "O limite de faltas deve estar entre 1 e 50.",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      updateSubject(editingId, {
        name: formData.name,
        weeklyHours: formData.weeklyHours,
        maxAbsences: formData.maxAbsences
      });
      setEditingId(null);
      toast({
        title: "Matéria atualizada!",
        description: "As informações da matéria foram atualizadas.",
      });
    } else {
      addSubject({
        name: formData.name,
        weeklyHours: formData.weeklyHours,
        maxAbsences: formData.maxAbsences,
        color: generateRandomColor()
      });
      toast({
        title: "Matéria adicionada!",
        description: "A matéria foi adicionada à sua lista.",
      });
    }
    
    setFormData({ name: '', weeklyHours: 1, maxAbsences: 5, useCustomLimit: false });
  };

  const handleEdit = (subject: any) => {
    const defaultLimit = getDefaultMaxAbsences(subject.weeklyHours);
    setFormData({
      name: subject.name,
      weeklyHours: subject.weeklyHours,
      maxAbsences: subject.maxAbsences,
      useCustomLimit: subject.maxAbsences !== defaultLimit
    });
    setEditingId(subject.id);
  };

  const handleDelete = (id: string, name: string) => {
    deleteSubject(id);
    toast({
      title: "Matéria removida",
      description: `${name} foi removida da sua lista.`,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', weeklyHours: 1, maxAbsences: 5, useCustomLimit: false });
  };

  const getAbsenceStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return { status: 'failed', color: 'text-red-600', icon: XCircle, bg: 'bg-red-50' };
    if (percentage >= 90) return { status: 'danger', color: 'text-red-600', icon: AlertTriangle, bg: 'bg-red-50' };
    if (percentage >= 75) return { status: 'warning', color: 'text-yellow-600', icon: AlertTriangle, bg: 'bg-yellow-50' };
    return { status: 'ok', color: 'text-green-600', icon: CheckCircle, bg: 'bg-green-50' };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Add/Edit Subject Form - Mobile Optimized */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Plus className="h-4 w-4 mr-2" />
            {editingId ? 'Editar Matéria' : 'Nova Matéria'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Nome da Matéria</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Matemática"
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weeklyHours" className="text-sm font-medium">Aulas por Semana</Label>
                <Select
                  value={formData.weeklyHours.toString()}
                  onValueChange={(value) => handleWeeklyHoursChange(parseInt(value))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 aula</SelectItem>
                    <SelectItem value="2">2 aulas</SelectItem>
                    <SelectItem value="3">3 aulas</SelectItem>
                    <SelectItem value="4">4+ aulas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Limite de Faltas</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant={formData.useCustomLimit ? "default" : "outline"}
                    onClick={() => handleCustomLimitToggle(!formData.useCustomLimit)}
                    className="h-8 text-xs"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    {formData.useCustomLimit ? 'Personalizado' : 'Padrão'}
                  </Button>
                </div>
                
                {formData.useCustomLimit ? (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.maxAbsences}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxAbsences: parseInt(e.target.value) || 1 }))}
                      className="h-11"
                      placeholder="Número de faltas para reprovar"
                    />
                    <p className="text-xs text-gray-500">
                      Defina quantas faltas são necessárias para reprovar nesta matéria
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      <strong>Padrão:</strong> {getDefaultMaxAbsences(formData.weeklyHours)} faltas máximas
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Baseado em 25% da carga horária semestral
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" className="flex-1 h-11">
                {editingId ? 'Atualizar' : 'Adicionar'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelEdit} className="h-11">
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Subjects List - Mobile Optimized */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <BookOpen className="h-4 w-4 mr-2" />
            Matérias ({subjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Nenhuma matéria cadastrada</p>
              <p className="text-sm text-gray-400 px-4">
                Adicione suas matérias para começar a organizar sua grade horária.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {subjects.map(subject => {
                const { status, color, icon: Icon, bg } = getAbsenceStatus(subject.currentAbsences, subject.maxAbsences);
                const percentage = Math.round((subject.currentAbsences / subject.maxAbsences) * 100);
                
                return (
                  <Card key={subject.id} className={`${bg} border-l-4 shadow-sm`} style={{ borderLeftColor: subject.color }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">{subject.name}</h3>
                          <p className="text-sm text-gray-600">
                            {subject.weeklyHours} aula{subject.weeklyHours > 1 ? 's' : ''}/semana
                          </p>
                        </div>
                        <Badge 
                          className="text-white border-none text-xs flex-shrink-0 ml-2"
                          style={{ backgroundColor: subject.color }}
                        >
                          {subject.weeklyHours}h
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Faltas:</span>
                          <div className={`flex items-center ${color}`}>
                            <Icon className="h-4 w-4 mr-1" />
                            <span className="font-semibold text-sm">
                              {subject.currentAbsences}/{subject.maxAbsences}
                            </span>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              percentage >= 100 ? 'bg-red-500' :
                              percentage >= 90 ? 'bg-red-500' :
                              percentage >= 75 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        
                        <p className="text-xs text-gray-500 leading-tight">
                          {percentage >= 100 ? 'REPROVADO POR FALTA' :
                           percentage >= 90 ? 'PERIGO: Muito próximo do limite!' :
                           percentage >= 75 ? 'ATENÇÃO: Próximo do limite' :
                           'Situação normal'}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(subject)}
                          className="flex-1 h-9 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(subject.id, subject.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 px-3"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectManager;
