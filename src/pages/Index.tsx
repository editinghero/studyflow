import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, BookOpen, Clock, Target, Settings, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Toaster } from '@/components/ui/toaster';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AddSubjectDialog from '@/components/AddSubjectDialog';
import AddTopicDialog from '@/components/AddTopicDialog';
import EditTopicDialog from '@/components/EditTopicDialog';
import StudyCalendar from '@/components/StudyCalendar';
import ProgressOverview from '@/components/ProgressOverview';
import UpcomingSessions from '@/components/UpcomingSessions';
import ThemeSettings from '@/components/ThemeSettings';
import NotificationOverlay from '@/components/NotificationOverlay';
import SessionSummaryDialog from '@/components/SessionSummaryDialog';
import SubjectDetailsDialog from '@/components/SubjectDetailsDialog';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from '@/hooks/use-toast';

export interface Subject {
  id: string;
  name: string;
  color: string;
  totalTopics: number;
  completedTopics: number;
}

export interface StudyTopic {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  subtopics: string[];
  priority: 'high' | 'medium' | 'low';
  scheduledDate: Date | null;
  scheduledTime: string;
  duration: number; // minutes
  completed: boolean;
  notes: string;
  resources: string[];
}

const backgroundImages = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1441974231531-c0eb7f1359b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1501436513145-30f24e19fcc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1682685797527-63b4e495938f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
];

const IndexContent = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showEditTopic, setShowEditTopic] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [showSubjectDetails, setShowSubjectDetails] = useState(false);
  const [editingTopic, setEditingTopic] = useState<StudyTopic | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [view, setView] = useState<'calendar' | 'overview'>('overview');
  const [backgroundIndex, setBackgroundIndex] = useState(8);
  const [prefilledDate, setPrefilledDate] = useState<Date | null>(null);

  // Initialize notifications
  const { 
    activeNotifications, 
    studySessions,
    dismissNotification, 
    startStudySession,
    extendStudyTime,
    finishStudySession,
    playAlarm 
  } = useNotifications(topics, subjects);

  // Sound effect functions
  const playTickSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LDciQFLYDK8N2JNwgZeLPt559NEAxOq+/wtWMcBjiM2PLHcSQFLYHP8N2HNwgZd7Xk5Z9NEAxQs+PwtmMcBjiR1/LDciQFLYDN8d2JOQgZdr/n5J9NEAxSn+Pzt2MXCD6K2PLDciUELIHO8N2HNwgZd7Pk5p9NEAxSm/PytmMXCTiO1fLHcSQELoHO8t2GNwgZd7rk5p9NEAxSm/PytmMXCTaK2PLEciUELoHO8t2INwgYeb3k55ZNEAxPqu/wtmMXCTaK2fLEcyYELoHO89yINwgYeb3l4Z5NEAxPquXxtmMXCCuK2fLEcyQHKoHO89yIMQgYeb3l4J5NEA1Qru3xtmMWCDaK2fLEcSQFLYDO89yKNwgYebro4J5NEA1Qn+7xtWMWCDyJ1/LFcSQGL4DK8tyKNwgYeb3k4J5NEA1Q')
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const playSaveSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRu4CAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YcoCAAC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSubjects = localStorage.getItem('studyPlannerSubjects');
    const savedTopics = localStorage.getItem('studyPlannerTopics');
    
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
    if (savedTopics) {
      const parsedTopics = JSON.parse(savedTopics);
      // Convert date strings back to Date objects
      const topicsWithDates = parsedTopics.map((topic: any) => ({
        ...topic,
        scheduledDate: topic.scheduledDate ? new Date(topic.scheduledDate) : null
      }));
      setTopics(topicsWithDates);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('studyPlannerSubjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('studyPlannerTopics', JSON.stringify(topics));
  }, [topics]);

  const changeBackground = () => {
    setBackgroundIndex((prev) => (prev + 1) % backgroundImages.length);
  };

  const addSubject = (subject: Omit<Subject, 'id' | 'totalTopics' | 'completedTopics'>) => {
    const newSubject: Subject = {
      ...subject,
      id: Date.now().toString(),
      totalTopics: 0,
      completedTopics: 0
    };
    setSubjects(prev => [...prev, newSubject]);
  };

  const deleteSubject = (subjectId: string) => {
    // Delete all topics associated with this subject
    setTopics(prev => prev.filter(topic => topic.subjectId !== subjectId));
    // Delete the subject
    setSubjects(prev => prev.filter(subject => subject.id !== subjectId));
    
    toast({
      title: "Subject Deleted",
      description: "Subject and all associated topics have been removed.",
    });
  };

  const addTopic = (topic: Omit<StudyTopic, 'id'>) => {
    const newTopic: StudyTopic = {
      ...topic,
      id: Date.now().toString()
    };
    setTopics(prev => [...prev, newTopic]);
    
    setSubjects(prev => prev.map(subject => 
      subject.id === topic.subjectId 
        ? { ...subject, totalTopics: subject.totalTopics + 1 }
        : subject
    ));
  };

  const updateTopic = (topicId: string, updates: Partial<StudyTopic>) => {
    setTopics(prev => prev.map(topic => 
      topic.id === topicId ? { ...topic, ...updates } : topic
    ));
    
    // Update completed count if completion status changed
    if (updates.completed !== undefined) {
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        setSubjects(prev => prev.map(subject => 
          subject.id === topic.subjectId 
            ? { 
                ...subject, 
                completedTopics: updates.completed 
                  ? subject.completedTopics + 1 
                  : subject.completedTopics - 1
              }
            : subject
        ));
      }
    }
  };

  const deleteTopic = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      // Update subject counts
      setSubjects(prev => prev.map(subject => 
        subject.id === topic.subjectId 
          ? { 
              ...subject, 
              totalTopics: subject.totalTopics - 1,
              completedTopics: topic.completed ? subject.completedTopics - 1 : subject.completedTopics
            }
          : subject
      ));
      
      // Remove the topic
      setTopics(prev => prev.filter(t => t.id !== topicId));
      
      toast({
        title: "Topic Deleted",
        description: "The study topic has been removed.",
      });
    }
  };

  const handleEditTopic = (topic: StudyTopic) => {
    setEditingTopic(topic);
    setShowEditTopic(true);
  };

  const handleViewSession = (topic: StudyTopic) => {
    setSelectedTopic(topic);
    setShowSessionSummary(true);
  };

  const handleViewSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowSubjectDetails(true);
  };

  const handleExtendTime = (topicId: string, additionalMinutes: number) => {
    extendStudyTime(topicId, additionalMinutes);
    
    // Ask user if they want to shift all upcoming sessions
    const confirmShift = window.confirm(
      `You've extended this session by ${additionalMinutes} minutes. Do you want to shift all upcoming sessions by ${additionalMinutes} minutes to avoid conflicts?`
    );
    
    if (confirmShift) {
      const currentTopic = topics.find(t => t.id === topicId);
      if (currentTopic?.scheduledDate) {
        const currentDateTime = new Date(currentTopic.scheduledDate);
        const [hours, minutes] = currentTopic.scheduledTime.split(':').map(Number);
        currentDateTime.setHours(hours, minutes);
        
        // Find all future sessions after current session
        const futureTopics = topics.filter(topic => {
          if (!topic.scheduledDate || topic.completed || topic.id === topicId) return false;
          
          const topicDateTime = new Date(topic.scheduledDate);
          const [topicHours, topicMinutes] = topic.scheduledTime.split(':').map(Number);
          topicDateTime.setHours(topicHours, topicMinutes);
          
          return topicDateTime > currentDateTime;
        });
        
        // Shift each future topic
        futureTopics.forEach(topic => {
          const topicDateTime = new Date(topic.scheduledDate!);
          const [topicHours, topicMinutes] = topic.scheduledTime.split(':').map(Number);
          topicDateTime.setHours(topicHours, topicMinutes);
          topicDateTime.setMinutes(topicDateTime.getMinutes() + additionalMinutes);
          
          const newTime = `${topicDateTime.getHours().toString().padStart(2, '0')}:${topicDateTime.getMinutes().toString().padStart(2, '0')}`;
          
          updateTopic(topic.id, {
            scheduledDate: new Date(topicDateTime.getFullYear(), topicDateTime.getMonth(), topicDateTime.getDate()),
            scheduledTime: newTime
          });
        });
        
        toast({
          title: "Sessions Updated",
          description: `${futureTopics.length} upcoming sessions have been shifted by ${additionalMinutes} minutes.`,
        });
      }
    }
  };

  const handleFinishSession = (topicId: string) => {
    // Mark the topic as completed
    updateTopic(topicId, { completed: true });
    
    // Finish the study session (removes from active sessions)
    finishStudySession(topicId);
    
    // Dismiss any active notifications for this topic
    dismissNotification(topicId);
    
    // Show completion toast
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      toast({
        title: "🎉 Study Session Completed!",
        description: `Great job completing: ${topic.title}`,
        duration: 5000,
      });
    }
  };

  const filteredTopics = topics.filter(topic => {
    const subject = subjects.find(s => s.id === topic.subjectId);
    const subjectName = subject?.name || '';
    
    return (
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const upcomingSessions = topics
    .filter(topic => topic.scheduledDate && !topic.completed)
    .sort((a, b) => {
      if (!a.scheduledDate || !b.scheduledDate) return 0;
      return a.scheduledDate.getTime() - b.scheduledDate.getTime();
    })
    .slice(0, 5);

  const exportData = () => {
    const data = {
      subjects,
      topics,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-flow-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your Study Flow data has been downloaded successfully.",
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.subjects && data.topics) {
          // Convert date strings back to Date objects for topics
          const importedTopics = data.topics.map((topic: any) => ({
            ...topic,
            scheduledDate: topic.scheduledDate ? new Date(topic.scheduledDate) : null
          }));
          
          setSubjects(data.subjects);
          setTopics(importedTopics);
          
          toast({
            title: "Data Imported",
            description: "Your Study Flow data has been imported successfully.",
          });
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const triggerFileImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      // Convert native Event to React ChangeEvent structure
      const target = event.target as HTMLInputElement;
      const syntheticEvent = {
        target,
        currentTarget: target,
        nativeEvent: event,
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        persist: () => {},
        preventDefault: () => event.preventDefault(),
        stopPropagation: () => event.stopPropagation()
      } as React.ChangeEvent<HTMLInputElement>;
      
      importData(syntheticEvent);
    };
    input.click();
  };

  return (
    <div 
      className="min-h-screen bg-image relative overflow-hidden"
      style={{ 
        backgroundImage: `url(${backgroundImages[backgroundIndex]})`,
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-green-500/10 dark:from-gray-900/60 dark:via-gray-800/40 dark:to-blue-900/60 backdrop-blur-sm"></div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="glass-effect-light p-6 rounded-2xl backdrop-blur-xl">
            <h1 className="text-4xl font-bold flex items-center gap-3 text-white">
              <BookOpen className="text-primary" size={36} />
              Study Flow
            </h1>
            <p className="mt-2 text-white opacity-90">Organize your academic schedule effectively</p>
          </div>
          
          {/* Responsive Button Layout */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center w-full lg:w-auto">
            {/* First Row - Theme and Background */}
            <div className="flex gap-3 justify-center lg:justify-start">
              <Button
                onClick={changeBackground}
                variant="outline"
                className="glass-button hover:scale-105 transition-all duration-300 backdrop-blur-lg border-white/40 dark:border-gray-700/40 flex-1 lg:flex-none"
              >
                🖼️ Change Background
              </Button>
              <ThemeSettings />
            </div>
            
            {/* Second Row - Main Actions */}
            <div className="flex gap-3 justify-center lg:justify-start">
              <Button 
                onClick={() => setShowAddSubject(true)}
                className="btn-theme-primary shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-lg flex-1 lg:flex-none"
              >
                <Plus size={20} className="mr-2" />
                Add Subject
              </Button>
              
              <Button 
                onClick={() => setShowAddTopic(true)}
                variant="outline"
                className="glass-button hover:scale-105 transition-all duration-300 backdrop-blur-lg border-white/40 dark:border-gray-700/40 flex-1 lg:flex-none"
              >
                <Target size={20} className="mr-2 text-primary" />
                Add Topic
              </Button>
              
              {/* Settings moved here next to Add Topic */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-button hover:scale-105 transition-all duration-300 backdrop-blur-lg border-white/40 dark:border-gray-700/40 w-10 h-10 p-0"
                  >
                    <Settings size={16} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 glass-card backdrop-blur-xl border-white/40 dark:border-gray-700/40">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={exportData}
                      className="w-full justify-start text-foreground hover:bg-accent/20 hover:text-foreground"
                    >
                      <Download size={16} className="mr-2" />
                      Export Data
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={triggerFileImport}
                      className="w-full justify-start text-foreground hover:bg-accent/20 hover:text-foreground"
                    >
                      <Upload size={16} className="mr-2" />
                      Import Data
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search topics and subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-input border-white/40 dark:border-gray-700/40 backdrop-blur-lg focus:ring-2 focus:ring-primary/50 transition-all duration-300"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={view === 'overview' ? 'default' : 'outline'}
              onClick={() => setView('overview')}
              className={`glass-button transition-all duration-300 hover:scale-105 backdrop-blur-lg border-white/40 dark:border-gray-700/40 ${
                view === 'overview' 
                  ? 'btn-theme-primary' 
                  : 'hover:bg-white/20 dark:hover:bg-gray-800/20'
              }`}
            >
              Overview
            </Button>
            <Button
              variant={view === 'calendar' ? 'default' : 'outline'}
              onClick={() => setView('calendar')}
              className={`glass-button transition-all duration-300 hover:scale-105 backdrop-blur-lg border-white/40 dark:border-gray-700/40 ${
                view === 'calendar' 
                  ? 'btn-theme-primary calendar-active' 
                  : 'hover:bg-white/20 dark:hover:bg-gray-800/20'
              }`}
            >
              <Calendar size={16} className="mr-2 text-primary calendar-icon" />
              Calendar
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {view === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mobile: Upcoming Sessions First */}
            <div className="lg:hidden">
              <UpcomingSessions 
                sessions={upcomingSessions} 
                subjects={subjects}
                studySessions={studySessions}
                onUpdateTopic={updateTopic}
                onEditTopic={handleEditTopic}
                onViewSession={handleViewSession}
              />
            </div>

            {/* Left Column - Progress & Subjects */}
            <div className="lg:col-span-2 space-y-6">
              <ProgressOverview subjects={subjects} topics={topics} />
              
              {/* Subjects Overview */}
              <Card className="glass-card border-white/40 dark:border-gray-700/40 backdrop-blur-2xl shadow-2xl animate-glass-shine">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground" style={{ color: 'hsl(var(--foreground))' }}>
                    <BookOpen size={20} className="text-primary" />
                    Your Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subjects.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No subjects added yet</p>
                      <Button 
                        onClick={() => setShowAddSubject(true)}
                        className="mt-3 glass-button hover:scale-105 transition-all duration-300"
                        variant="outline"
                      >
                        Add Your First Subject
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {subjects.map(subject => (
                        <div 
                          key={subject.id}
                          className="p-4 rounded-xl border-2 transition-all hover:shadow-2xl hover:scale-[1.02] glass-primary backdrop-blur-xl duration-300 animate-float cursor-pointer"
                          style={{ 
                            borderColor: subject.color + '40',
                          }}
                          onClick={() => handleViewSubject(subject)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-foreground" style={{ color: 'hsl(var(--foreground))' }}>{subject.name}</h3>
                            <div 
                              className="w-4 h-4 rounded-full shadow-lg animate-glow"
                              style={{ backgroundColor: subject.color }}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground" style={{ color: 'hsl(var(--muted-foreground))' }}>
                              <span>Progress</span>
                              <span>{subject.completedTopics}/{subject.totalTopics}</span>
                            </div>
                            <Progress 
                              value={subject.totalTopics > 0 ? (subject.completedTopics / subject.totalTopics) * 100 : 0}
                              className="h-2 glass-effect"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Upcoming Sessions (Desktop only) */}
            <div className="hidden lg:block">
              <UpcomingSessions 
                sessions={upcomingSessions} 
                subjects={subjects}
                studySessions={studySessions}
                onUpdateTopic={updateTopic}
                onEditTopic={handleEditTopic}
                onViewSession={handleViewSession}
              />
            </div>
          </div>
        ) : (
          <StudyCalendar 
            topics={filteredTopics} 
            subjects={subjects}
            onUpdateTopic={updateTopic}
            onEditTopic={handleEditTopic}
            onViewSession={handleViewSession}
            onAddTopic={(prefilledDate?: Date) => {
              if (prefilledDate) {
                setPrefilledDate(prefilledDate);
              }
              setShowAddTopic(true);
            }}
          />
        )}

        {/* Dialogs */}
        <AddSubjectDialog 
          open={showAddSubject}
          onOpenChange={setShowAddSubject}
          onAddSubject={addSubject}
        />
        
        <AddTopicDialog 
          open={showAddTopic}
          onOpenChange={(open) => {
            setShowAddTopic(open);
            if (!open) {
              setPrefilledDate(null);
            }
          }}
          onAddTopic={addTopic}
          subjects={subjects}
          prefilledDate={prefilledDate}
        />

        <EditTopicDialog
          open={showEditTopic}
          onOpenChange={setShowEditTopic}
          topic={editingTopic}
          subjects={subjects}
          onUpdateTopic={updateTopic}
        />

        <SessionSummaryDialog
          open={showSessionSummary}
          onOpenChange={setShowSessionSummary}
          topic={selectedTopic}
          subject={selectedTopic ? subjects.find(s => s.id === selectedTopic.subjectId) : null}
          onUpdateTopic={updateTopic}
          onDeleteTopic={deleteTopic}
          onPlayTickSound={playTickSound}
          onPlaySaveSound={playSaveSound}
        />

        <SubjectDetailsDialog
          open={showSubjectDetails}
          onOpenChange={setShowSubjectDetails}
          subject={selectedSubject}
          topics={topics.filter(t => t.subjectId === selectedSubject?.id)}
          onViewSession={handleViewSession}
          onDeleteSubject={deleteSubject}
        />
      </div>

      {/* Notification Overlay */}
      <NotificationOverlay
        activeNotifications={activeNotifications}
        studySessions={studySessions}
        topics={topics}
        subjects={subjects}
        onDismiss={dismissNotification}
        onStartStudy={startStudySession}
        onExtendTime={handleExtendTime}
        onFinishSession={handleFinishSession}
        onPlayAlarm={playAlarm}
      />

      {/* Toast Container */}
      <Toaster />
    </div>
  );
};

const Index = () => {
  return (
    <ThemeProvider>
      <IndexContent />
    </ThemeProvider>
  );
};

export default Index;
