
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Calendar, Plus, Trash2, AlertTriangle, CalendarX } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AbsenceManager: React.FC = () => {
  const { subjects, schedule, absences, addAbsence, removeAbsence } = useData();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState('');

  const handleAddAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast({
        title: "Selecione uma data",
        description: "Escolha o dia em que você faltou.",
        variant: "destructive",
      });
      return;
    }

    // Check if it's a weekend
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast({
        title: "Fim de semana",
        description: "Não há aulas aos fins de semana.",
        variant: "destructive",
      });
      return;
    }

    // Check if already exists
    const exists = absences.some(absence => absence.date === selectedDate);
    if (exists) {
      toast({
        title: "Falta já registrada",
        description: "Você já registrou falta para este dia.",
        variant: "destructive",
      });
      return;
    }

    addAbsence(selectedDate);
    setSelectedDate('');
    
    toast({
      title: "Falta registrada!",
      description: "A falta foi registrada automaticamente nas matérias do dia.",
    });
  };

  const handleRemoveAbsence = (id: string, date: string) => {
    removeAbsence(id);
    toast({
      title: "Falta removida",
      description: `Falta do dia ${format(new Date(date), 'dd/MM/yyyy')} foi removida.`,
    });
  };

  const getSubjectsForDay = (date: string) => {
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    let adjustedDay: number;
    
    if (dayOfWeek === 0) {
      adjustedDay = 6;
    } else if (dayOfWeek === 6) {
      adjustedDay = 5;
    } else {
      adjustedDay = dayOfWeek - 1;
    }
    
    if (adjustedDay >= 5) return [];
    
    const daySubjects = schedule
      .filter(slot => slot.day === adjustedDay)
      .map(slot => subjects.find(s => s.id === slot.subjectId))
      .filter(Boolean);
    
    return [...new Set(daySubjects)];
  };

  const sortedAbsences = [...absences].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Add Absence Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Registrar Falta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAbsence} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data da Falta</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              <p className="text-sm text-gray-500">
                As faltas serão registradas automaticamente em todas as aulas que você tem no dia selecionado.
              </p>
            </div>
            
            <Button type="submit" className="w-full">
              <CalendarX className="h-4 w-4 mr-2" />
              Registrar Falta
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Absences List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Histórico de Faltas ({absences.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {absences.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Nenhuma falta registrada</p>
              <p className="text-sm text-gray-400">
                Registre suas faltas para acompanhar sua frequência.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAbsences.map(absence => {
                const date = new Date(absence.date + 'T00:00:00');
                
                return (
                  <Card key={absence.id} className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <CalendarX className="h-4 w-4 text-red-500 mr-2" />
                            <h3 className="font-semibold">
                              {format(date, 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                            </h3>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Matérias afetadas:</p>
                            <div className="flex flex-wrap gap-2">
                              {absence.subjects.map(({ subjectId, classCount }) => {
                                const subject = subjects.find(s => s.id === subjectId);
                                if (!subject) return null;
                                
                                return (
                                  <Badge
                                    key={subjectId}
                                    className="text-white border-none"
                                    style={{ backgroundColor: subject.color }}
                                  >
                                    {subject.name} ({classCount} aula{classCount > 1 ? 's' : ''})
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveAbsence(absence.id, absence.date)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100 ml-4"
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

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <h4 className="font-semibold text-blue-900 mb-1">Como funciona o registro de faltas:</h4>
              <ul className="text-blue-800 space-y-1 list-disc list-inside">
                <li>Selecione o dia em que você faltou às aulas</li>
                <li>O sistema automaticamente registra falta em cada aula que você tem naquele dia</li>
                <li>Se uma matéria tem 2 aulas no dia, serão registradas 2 faltas</li>
                <li>Alertas são exibidos quando você atinge 75% e 90% do limite de faltas</li>
                <li>Ao atingir 100% do limite, você é considerado reprovado por falta</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbsenceManager;
