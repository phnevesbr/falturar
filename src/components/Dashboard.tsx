
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LogOut, Calendar, BookOpen, AlertTriangle, CheckCircle, XCircle, Menu, X } from 'lucide-react';
import WeeklySchedule from './WeeklySchedule';
import SubjectManager from './SubjectManager';
import AbsenceManager from './AbsenceManager';
import { useToast } from '../hooks/use-toast';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { subjects } = useData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'schedule' | 'subjects' | 'absences'>('schedule');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getAbsenceStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return { status: 'failed', color: 'bg-red-500', icon: XCircle };
    if (percentage >= 90) return { status: 'danger', color: 'bg-red-500', icon: AlertTriangle };
    if (percentage >= 75) return { status: 'warning', color: 'bg-yellow-500', icon: AlertTriangle };
    return { status: 'ok', color: 'bg-green-500', icon: CheckCircle };
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  const dangerousSubjects = subjects.filter(s => {
    const percentage = (s.currentAbsences / s.maxAbsences) * 100;
    return percentage >= 75;
  });

  const tabsConfig = [
    { key: 'schedule', label: 'Grade', icon: Calendar },
    { key: 'subjects', label: 'Matérias', icon: BookOpen },
    { key: 'absences', label: 'Faltas', icon: AlertTriangle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile-First Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14">
            {/* Logo and User Info */}
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">Faltula</h1>
                <p className="text-xs text-gray-500 truncate">Olá, {user?.name}</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden h-8 w-8 p-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
              
              {/* Desktop Logout Button */}
              <Button variant="outline" onClick={handleLogout} size="sm" className="hidden md:flex h-8">
                <LogOut className="h-3 w-3 mr-1" />
                Sair
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white py-2 space-y-1">
              <Button 
                variant="ghost" 
                onClick={handleLogout} 
                className="w-full justify-start h-10 px-3"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 max-w-7xl mx-auto">
        {/* Mobile-Optimized Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Matérias</CardTitle>
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{subjects.length}</div>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Em Risco</CardTitle>
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">{dangerousSubjects.length}</div>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in col-span-2 sm:col-span-1" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Curso</CardTitle>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm sm:text-lg font-semibold text-purple-600 truncate">{user?.course}</div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Optimized Alerts */}
        {dangerousSubjects.length > 0 && (
          <Card className="mb-4 sm:mb-6 border-yellow-200 bg-yellow-50 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-800 flex items-center text-sm sm:text-base">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Matérias em Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {dangerousSubjects.map(subject => {
                  const { status, color, icon: Icon } = getAbsenceStatus(subject.currentAbsences, subject.maxAbsences);
                  const percentage = Math.round((subject.currentAbsences / subject.maxAbsences) * 100);
                  
                  return (
                    <Badge key={subject.id} variant="outline" className={`${color} text-white border-none text-xs`}>
                      <Icon className="h-3 w-3 mr-1" />
                      <span className="truncate max-w-16 sm:max-w-20">{subject.name}</span> ({percentage}%)
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mobile-First Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6 animate-fade-in overflow-hidden">
          <div className="flex">
            {tabsConfig.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? 'default' : 'ghost'}
                  className={`flex-1 rounded-none h-12 sm:h-14 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                    activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'text-gray-600'
                  }`}
                  onClick={() => setActiveTab(tab.key as any)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'schedule' && <WeeklySchedule />}
          {activeTab === 'subjects' && <SubjectManager />}
          {activeTab === 'absences' && <AbsenceManager />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
