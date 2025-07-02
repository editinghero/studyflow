
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, CheckCircle2, Circle, AlertTriangle, PlayCircle, Edit, Eye } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Subject, StudyTopic } from '@/pages/Index';

interface UpcomingSessionsProps {
  sessions: StudyTopic[];
  subjects: Subject[];
  studySessions: Record<string, {
    startTime: Date;
    duration: number;
    isActive: boolean;
    timeRemaining: number;
  }>;
  onUpdateTopic: (topicId: string, updates: Partial<StudyTopic>) => void;
  onEditTopic: (topic: StudyTopic) => void;
  onViewSession: (topic: StudyTopic) => void;
}

const priorityColors = {
  high: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
  medium: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30', 
  low: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
};

const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({ 
  sessions, 
  subjects, 
  studySessions,
  onUpdateTopic,
  onEditTopic,
  onViewSession
}) => {
  const getSubjectById = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId);
  };

  const formatSessionDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, EEE');
  };

  const toggleCompletion = (sessionId: string, completed: boolean) => {
    onUpdateTopic(sessionId, { completed: !completed });
  };

  const isOverdue = (session: StudyTopic) => {
    if (!session.scheduledDate || session.completed) return false;
    const now = new Date();
    const sessionDateTime = new Date(session.scheduledDate);
    const [hours, minutes] = session.scheduledTime.split(':').map(Number);
    sessionDateTime.setHours(hours, minutes);
    return sessionDateTime < now;
  };

  const isInProgress = (sessionId: string) => {
    return studySessions[sessionId]?.isActive;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="glass-card border-white/40 backdrop-blur-2xl shadow-2xl h-fit animate-float">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar size={20} className="text-primary" />
          Upcoming Sessions
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p className="mb-2">No upcoming sessions</p>
            <p className="text-sm">Schedule some study topics to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map(session => {
              const subject = getSubjectById(session.subjectId);
              const overdue = isOverdue(session);
              const inProgress = isInProgress(session.id);
              const sessionData = studySessions[session.id];
              
              return (
                <div
                  key={session.id}
                  className={`p-4 rounded-xl border-2 transition-all hover:shadow-2xl hover:scale-[1.02] duration-300 glass-effect backdrop-blur-lg ${
                    inProgress
                      ? 'border-green-300/60 bg-green-50/30 dark:bg-green-900/20'
                      : overdue 
                      ? 'border-red-300/60 bg-red-50/30 dark:bg-red-900/20' 
                      : 'border-white/40 hover:border-white/60 dark:border-gray-700/40 dark:hover:border-gray-600/60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">
                          {session.title}
                        </h4>
                        {inProgress && (
                          <PlayCircle className="text-green-500 animate-pulse" size={16} />
                        )}
                      </div>
                      
                      {subject && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs mb-2 glass-effect border-0 text-foreground"
                          style={{ 
                            backgroundColor: subject.color + '30',
                            color: subject.color 
                          }}
                        >
                          {subject.name}
                        </Badge>
                      )}
                      
                      {inProgress && sessionData && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Time Remaining</span>
                            <span className="font-mono font-bold text-foreground">
                              {formatTime(sessionData.timeRemaining)}
                            </span>
                          </div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000"
                              style={{ 
                                width: `${((sessionData.duration - sessionData.timeRemaining) / sessionData.duration) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <button
                        onClick={() => onViewSession(session)}
                        className="transition-all hover:scale-110 duration-300 text-muted-foreground hover:text-primary"
                        title="View Session Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEditTopic(session)}
                        className="transition-all hover:scale-110 duration-300 text-muted-foreground hover:text-primary"
                        title="Edit Topic"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => toggleCompletion(session.id, session.completed)}
                        className="transition-all hover:scale-110 duration-300"
                        title="Toggle Completion"
                      >
                        {session.completed ? (
                          <CheckCircle2 className="text-green-400 animate-glow" size={20} />
                        ) : (
                          <Circle className="text-muted-foreground hover:text-green-400 hover:text-primary" size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar size={14} className="text-primary" />
                      <span>
                        {session.scheduledDate && formatSessionDate(session.scheduledDate)}
                      </span>
                      {overdue && !inProgress && (
                        <>
                          <AlertTriangle size={14} className="text-red-400 animate-pulse" />
                          <span className="text-red-400 font-medium">Overdue</span>
                        </>
                      )}
                      {inProgress && (
                        <>
                          <PlayCircle size={14} className="text-green-400 animate-pulse" />
                          <span className="text-green-400 font-medium">In Progress</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-primary" />
                          {session.scheduledTime}
                        </div>
                        <span>•</span>
                        <span>{session.duration} min</span>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={`text-xs capitalize glass-effect border-0 ${priorityColors[session.priority]}`}
                      >
                        {session.priority}
                      </Badge>
                    </div>
                    
                    {session.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {session.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            
            {sessions.length >= 5 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="glass-button hover:scale-105 transition-all duration-300 text-foreground">
                  <span className="text-primary">View All Sessions</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingSessions;
