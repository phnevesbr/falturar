
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, X, Clock, Calendar, Smartphone } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const WeeklySchedule: React.FC = () => {
  const { subjects, schedule, addScheduleSlot, removeScheduleSlot } = useData();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isMobileView, setIsMobileView] = useState(false);

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const timeSlots = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'];

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  const getScheduleSlot = (day: number, timeSlot: number) => {
    return schedule.find(s => s.day === day && s.timeSlot === timeSlot);
  };

  const handleAddSlot = (day: number, timeSlot: number) => {
    if (!selectedSubject) {
      toast({
        title: "Selecione uma matéria",
        description: "Escolha uma matéria para adicionar ao horário.",
        variant: "destructive",
      });
      return;
    }

    const success = addScheduleSlot({ subjectId: selectedSubject, day, timeSlot });
    
    if (success) {
      toast({
        title: "Aula adicionada!",
        description: "A aula foi adicionada à sua grade horária.",
      });
      // Não limpar mais a seleção para facilitar adicionar múltiplas aulas
      // setSelectedSubject('');
    } else {
      toast({
        title: "Não foi possível adicionar",
        description: "Horário ocupado ou limite de 2 aulas por dia atingido.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSlot = (slotId: string) => {
    removeScheduleSlot(slotId);
    toast({
      title: "Aula removida",
      description: "A aula foi removida da sua grade horária.",
    });
  };

  const clearSelectedSubject = () => {
    setSelectedSubject('');
  };

  if (subjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Grade Horária Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Você precisa cadastrar suas matérias antes de montar sua grade horária.
            </p>
            <p className="text-sm text-gray-400">
              Vá para a aba "Matérias" para começar.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile Layout - Melhorado
  const MobileSchedule = () => (
    <div className="space-y-3">
      {days.map((day, dayIndex) => (
        <Card key={dayIndex} className="shadow-sm bg-white border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-primary flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {day}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {timeSlots.map((time, timeIndex) => {
              const slot = getScheduleSlot(dayIndex, timeIndex);
              const subject = slot ? getSubjectById(slot.subjectId) : null;

              return (
                <div
                  key={timeIndex}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-white"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-600 min-w-[80px] shrink-0">
                      {time}
                    </span>
                    {subject ? (
                      <Badge
                        className="text-white border-none text-xs px-2 py-1 truncate"
                        style={{ backgroundColor: subject.color }}
                      >
                        {subject.name}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-400">Vazio</span>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant={subject ? "destructive" : "outline"}
                    className="h-8 w-8 p-0 ml-2 shrink-0"
                    onClick={() => {
                      if (slot) {
                        handleRemoveSlot(slot.id);
                      } else {
                        handleAddSlot(dayIndex, timeIndex);
                      }
                    }}
                  >
                    {subject ? (
                      <X className="h-3 w-3" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Desktop Layout 
  const DesktopSchedule = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Grade Horária Semanal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-4">
          {/* Header */}
          <div></div>
          {days.map(day => (
            <div key={day} className="font-semibold text-center p-2 bg-gray-50 rounded">
              {day}
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map((time, timeIndex) => (
            <React.Fragment key={timeIndex}>
              <div className="font-medium text-sm text-gray-600 flex items-center justify-start p-2">
                {time}
              </div>
              {days.map((_, dayIndex) => {
                const slot = getScheduleSlot(dayIndex, timeIndex);
                const subject = slot ? getSubjectById(slot.subjectId) : null;

                return (
                  <div
                    key={`${dayIndex}-${timeIndex}`}
                    className="min-h-[60px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center p-2 hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => {
                      if (slot) {
                        handleRemoveSlot(slot.id);
                      } else {
                        handleAddSlot(dayIndex, timeIndex);
                      }
                    }}
                  >
                    {subject ? (
                      <Badge
                        className="text-white border-none relative group"
                        style={{ backgroundColor: subject.color }}
                      >
                        <span className="text-xs font-medium">{subject.name}</span>
                        <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Badge>
                    ) : (
                      <Plus className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          <p><strong>Dica:</strong> Cada matéria pode ter no máximo 2 aulas por dia.</p>
          <p>Clique em uma aula para removê-la ou em um espaço vazio para adicionar.</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Add Subject Controls - Melhorado para mobile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base md:text-lg">
            <div className="flex items-center">
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Adicionar Aula
            </div>
            {/* View Toggle - only show on medium screens and up */}
            <div className="hidden md:flex items-center space-x-2">
              <Button
                size="sm"
                variant={!isMobileView ? "default" : "outline"}
                onClick={() => setIsMobileView(false)}
                className="h-8"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Grade
              </Button>
              <Button
                size="sm"
                variant={isMobileView ? "default" : "outline"}
                onClick={() => setIsMobileView(true)}
                className="h-8"
              >
                <Smartphone className="h-3 w-3 mr-1" />
                Lista
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="flex-1 h-11">
                  <SelectValue placeholder="Selecione uma matéria" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: subject.color }}
                        />
                        <span>{subject.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSubject && (
                <Button 
                  variant="outline" 
                  onClick={clearSelectedSubject}
                  className="h-11 px-4"
                >
                  Limpar
                </Button>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>💡 Dica:</strong> Após selecionar uma matéria, ela permanecerá selecionada para facilitar a adição em múltiplos horários.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Display - Responsive */}
      <div className="md:hidden">
        <MobileSchedule />
      </div>
      
      <div className="hidden md:block">
        {isMobileView ? <MobileSchedule /> : <DesktopSchedule />}
      </div>
    </div>
  );
};

export default WeeklySchedule;
