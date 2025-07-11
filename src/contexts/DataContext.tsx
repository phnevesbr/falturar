
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Subject {
  id: string;
  name: string;
  weeklyHours: number;
  color: string;
  maxAbsences: number;
  currentAbsences: number;
}

export interface ScheduleSlot {
  id: string;
  subjectId: string;
  day: number; // 0 = Monday, 4 = Friday
  timeSlot: number; // 0-4
}

export interface Absence {
  id: string;
  date: string;
  subjects: { subjectId: string; classCount: number }[];
}

interface DataContextType {
  subjects: Subject[];
  schedule: ScheduleSlot[];
  absences: Absence[];
  addSubject: (subject: Omit<Subject, 'id' | 'currentAbsences'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addScheduleSlot: (slot: Omit<ScheduleSlot, 'id'>) => boolean;
  removeScheduleSlot: (id: string) => void;
  addAbsence: (date: string) => void;
  removeAbsence: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const subjectColors = [
  '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#8B5A2B', '#6366F1', '#84CC16', '#F97316'
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      const userKey = `faltula_data_${user.id}`;
      const savedData = localStorage.getItem(userKey);
      if (savedData) {
        const data = JSON.parse(savedData);
        setSubjects(data.subjects || []);
        setSchedule(data.schedule || []);
        setAbsences(data.absences || []);
      }
    } else {
      setSubjects([]);
      setSchedule([]);
      setAbsences([]);
    }
  }, [user]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      const userKey = `faltula_data_${user.id}`;
      const data = { subjects, schedule, absences };
      localStorage.setItem(userKey, JSON.stringify(data));
    }
  }, [user, subjects, schedule, absences]);

  const addSubject = (subjectData: Omit<Subject, 'id' | 'currentAbsences'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: Date.now().toString(),
      currentAbsences: 0,
      color: subjectColors[subjects.length % subjectColors.length]
    };
    setSubjects(prev => [...prev, newSubject]);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(subject => {
      if (subject.id === id) {
        return { ...subject, ...updates };
      }
      return subject;
    }));
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(subject => subject.id !== id));
    setSchedule(prev => prev.filter(slot => slot.subjectId !== id));
  };

  const addScheduleSlot = (slot: Omit<ScheduleSlot, 'id'>): boolean => {
    // Check if slot is already occupied
    const isOccupied = schedule.some(s => s.day === slot.day && s.timeSlot === slot.timeSlot);
    if (isOccupied) return false;

    // Check if subject already has 2 classes on this day
    const subjectSlotsOnDay = schedule.filter(s => s.day === slot.day && s.subjectId === slot.subjectId);
    if (subjectSlotsOnDay.length >= 2) return false;

    const newSlot: ScheduleSlot = {
      ...slot,
      id: Date.now().toString()
    };
    setSchedule(prev => [...prev, newSlot]);
    return true;
  };

  const removeScheduleSlot = (id: string) => {
    setSchedule(prev => prev.filter(slot => slot.id !== id));
  };

  const addAbsence = (date: string) => {
    console.log('Adicionando falta para a data:', date);
    
    // Corrigir a lógica de conversão de dia da semana
    const dateObj = new Date(date + 'T00:00:00'); // Força horário local
    const dayOfWeek = dateObj.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
    
    console.log('Dia da semana (getDay):', dayOfWeek);
    
    // Converter para nosso sistema: segunda=0, terça=1, ..., sexta=4
    let adjustedDay: number;
    if (dayOfWeek === 0) { // domingo
      adjustedDay = 6; // fora do range 0-4, será filtrado
    } else if (dayOfWeek === 6) { // sábado
      adjustedDay = 5; // fora do range 0-4, será filtrado
    } else {
      adjustedDay = dayOfWeek - 1; // segunda=0, terça=1, ..., sexta=4
    }
    
    console.log('Dia ajustado:', adjustedDay);
    
    if (adjustedDay >= 5) {
      console.log('Fim de semana detectado, ignorando');
      return; // Weekend, no classes
    }
    
    // Buscar todas as aulas do dia
    const daySlots = schedule.filter(slot => slot.day === adjustedDay);
    console.log('Aulas encontradas no dia:', daySlots);
    
    if (daySlots.length === 0) {
      console.log('Nenhuma aula encontrada para este dia');
      return;
    }
    
    // Contar quantas aulas cada matéria tem no dia
    const subjectClassCount = new Map<string, number>();
    daySlots.forEach(slot => {
      const currentCount = subjectClassCount.get(slot.subjectId) || 0;
      subjectClassCount.set(slot.subjectId, currentCount + 1);
    });
    
    console.log('Contagem de aulas por matéria:', Array.from(subjectClassCount.entries()));
    
    const subjectsWithCount = Array.from(subjectClassCount.entries()).map(([subjectId, classCount]) => ({
      subjectId,
      classCount
    }));
    
    const newAbsence: Absence = {
      id: Date.now().toString(),
      date,
      subjects: subjectsWithCount
    };
    
    console.log('Nova falta criada:', newAbsence);
    
    setAbsences(prev => [...prev, newAbsence]);
    
    // Atualizar contagem de faltas das matérias (cada aula = 1 falta)
    setSubjects(prev => prev.map(subject => {
      const subjectData = subjectsWithCount.find(s => s.subjectId === subject.id);
      if (subjectData) {
        const newCount = subject.currentAbsences + subjectData.classCount;
        console.log(`Atualizando faltas da matéria ${subject.name}: ${subject.currentAbsences} + ${subjectData.classCount} = ${newCount}`);
        return { ...subject, currentAbsences: newCount };
      }
      return subject;
    }));
  };

  const removeAbsence = (id: string) => {
    const absence = absences.find(a => a.id === id);
    if (!absence) return;
    
    console.log('Removendo falta:', absence);
    
    setAbsences(prev => prev.filter(a => a.id !== id));
    
    // Atualizar contagem de faltas das matérias (subtrair o número correto de aulas)
    setSubjects(prev => prev.map(subject => {
      const subjectData = absence.subjects.find(s => s.subjectId === subject.id);
      if (subjectData) {
        const newCount = Math.max(0, subject.currentAbsences - subjectData.classCount);
        console.log(`Removendo faltas da matéria ${subject.name}: ${subject.currentAbsences} - ${subjectData.classCount} = ${newCount}`);
        return { ...subject, currentAbsences: newCount };
      }
      return subject;
    }));
  };

  return (
    <DataContext.Provider value={{
      subjects,
      schedule,
      absences,
      addSubject,
      updateSubject,
      deleteSubject,
      addScheduleSlot,
      removeScheduleSlot,
      addAbsence,
      removeAbsence
    }}>
      {children}
    </DataContext.Provider>
  );
};
