
import React, { useState } from 'react';
import { Bell, X, Clock, BookOpen, Play, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StudyTopic, Subject } from '@/pages/Index';

interface NotificationOverlayProps {
  activeNotifications: string[];
  studySessions: Record<string, {
    startTime: Date;
    duration: number;
    isActive: boolean;
    timeRemaining: number;
  }>;
  topics: StudyTopic[];
  subjects: Subject[];
  onDismiss: (topicId: string) => void;
  onStartStudy: (topicId: string, duration: number) => void;
  onExtendTime: (topicId: string, minutes: number) => void;
  onFinishSession: (topicId: string) => void;
  onPlayAlarm: () => void;
}

const NotificationOverlay: React.FC<NotificationOverlayProps> = ({
  activeNotifications,
  studySessions,
  topics,
  subjects,
  onDismiss,
  onStartStudy,
  onExtendTime,
  onFinishSession,
  onPlayAlarm
}) => {
  const [extendMinutes, setExtendMinutes] = useState<Record<string, number>>({});

  const getNotificationData = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    const subject = topic ? subjects.find(s => s.id === topic.subjectId) : null;
    return { topic, subject };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (session: any) => {
    return ((session.duration - session.timeRemaining) / session.duration) * 100;
  };

  if (activeNotifications.length === 0 && Object.keys(studySessions).length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute top-4 right-4 space-y-3 pointer-events-auto max-w-sm">
        {/* Active Notifications */}
        {activeNotifications.map(notificationId => {
          const { topic, subject } = getNotificationData(notificationId);
          
          if (!topic || !subject) return null;

          return (
            <Card 
              key={notificationId}
              className="glass-notification animate-notification border-l-4 overflow-hidden animate-pulse-slow"
              style={{ borderLeftColor: subject.color }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div 
                      className="p-2 rounded-full animate-pulse"
                      style={{ backgroundColor: subject.color + '20' }}
                    >
                      <Bell 
                        className="w-5 h-5 icon-theme animate-glow" 
                        style={{ color: subject.color }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 icon-theme" />
                      <h4 className="font-semibold text-sm truncate text-foreground">
                        Study Time!
                      </h4>
                    </div>
                    
                    <p className="text-sm font-medium mb-1 truncate text-foreground">
                      {topic.title}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span 
                        className="px-2 py-1 rounded-full text-white text-xs font-medium"
                        style={{ backgroundColor: subject.color }}
                      >
                        {subject.name}
                      </span>
                      <Clock className="w-3 h-3" />
                      <span>{topic.duration} min</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onStartStudy(notificationId, topic.duration)}
                        className="btn-theme-primary text-xs h-8 px-3"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Start Study
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onPlayAlarm}
                        className="glass-button h-8 px-2"
                      >
                        🔊
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDismiss(notificationId)}
                    className="flex-shrink-0 h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Active Study Sessions */}
        {Object.entries(studySessions).map(([topicId, session]) => {
          const { topic, subject } = getNotificationData(topicId);
          
          if (!topic || !subject) return null;

          return (
            <Card 
              key={`session-${topicId}`}
              className="glass-notification border-l-4 overflow-hidden"
              style={{ borderLeftColor: subject.color }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div 
                      className="p-2 rounded-full"
                      style={{ backgroundColor: subject.color + '20' }}
                    >
                      <Clock 
                        className="w-5 h-5" 
                        style={{ color: subject.color }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm truncate text-foreground">
                        Studying: {topic.title}
                      </h4>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Time Remaining</span>
                        <span className="font-mono font-bold text-foreground">
                          {formatTime(session.timeRemaining)}
                        </span>
                      </div>
                      <div className="study-progress-bar">
                        <div 
                          className="study-progress-fill"
                          style={{ width: `${getProgress(session)}%` }}
                        />
                      </div>
                    </div>
                    
                    {session.timeRemaining === 0 && (
                      <div className="space-y-2 mb-3">
                        <p className="text-sm text-green-600 font-medium">Session Complete! 🎉</p>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Minutes"
                            min="1"
                            max="60"
                            value={extendMinutes[topicId] || ''}
                            onChange={(e) => setExtendMinutes(prev => ({
                              ...prev,
                              [topicId]: parseInt(e.target.value) || 0
                            }))}
                            className="h-8 text-xs glass-input"
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              const minutes = extendMinutes[topicId] || 15;
                              onExtendTime(topicId, minutes);
                              setExtendMinutes(prev => ({ ...prev, [topicId]: 0 }));
                            }}
                            className="btn-theme-primary h-8 px-2 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Extend
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onFinishSession(topicId)}
                        className="btn-theme-primary text-xs h-8 px-3"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Finish
                      </Button>
                      {session.timeRemaining > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const minutes = 5;
                            onExtendTime(topicId, minutes);
                          }}
                          className="glass-button h-8 px-2 text-xs"
                        >
                          +5 min
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationOverlay;
