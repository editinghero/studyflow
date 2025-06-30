import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Circle, Calendar, Edit, Download, ExternalLink, Eye, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { Subject, StudyTopic } from '@/pages/Index';
import { downloadICalendar, generateGoogleCalendarUrl } from '@/utils/calendarExport';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface StudyCalendarProps {
  topics: StudyTopic[];
  subjects: Subject[];
  onUpdateTopic: (topicId: string, updates: Partial<StudyTopic>) => void;
  onEditTopic: (topic: StudyTopic) => void;
  onViewSession: (topic: StudyTopic) => void;
  onAddTopic: (prefilledDate?: Date) => void;
}

const priorityColors = {
  high: 'border-l-red-500 bg-red-50 dark:bg-red-950/30',
  medium: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
  low: 'border-l-green-500 bg-green-50 dark:bg-green-950/30'
};

const StudyCalendar: React.FC<StudyCalendarProps> = ({ 
  topics, 
  subjects, 
  onUpdateTopic, 
  onEditTopic, 
  onViewSession, 
  onAddTopic 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getTopicsForDate = (date: Date) => {
    return topics.filter(topic => 
      topic.scheduledDate && isSameDay(topic.scheduledDate, date)
    );
  };

  const getSubjectById = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId);
  };

  const selectedDateTopics = selectedDate ? getTopicsForDate(selectedDate) : [];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const toggleTopicCompletion = (topicId: string, completed: boolean) => {
    onUpdateTopic(topicId, { completed: !completed });
  };

  const handleExportCalendar = () => {
    downloadICalendar(topics, subjects);
  };

  const handleAddToGoogleCalendar = (topic: StudyTopic) => {
    const subject = getSubjectById(topic.subjectId);
    const url = generateGoogleCalendarUrl(topic, subject);
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar View */}
      <div className="lg:col-span-2">
        <Card className="glass-card border-white/40 dark:border-gray-700/40">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-foreground">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportCalendar}
                  className="glass-button hover:scale-105 transition-all duration-300"
                >
                  <Download size={16} className="mr-2" />
                  Export iCal
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="glass-button hover:scale-105 transition-all duration-300"
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="glass-button hover:scale-105 transition-all duration-300"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map(day => {
                const dayTopics = getTopicsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const hasTopics = dayTopics.length > 0;
                
                return (
                  <div key={day.toISOString()} className="relative group">
                    <button
                      onClick={() => setSelectedDate(day)}
                      className={`
                        w-full p-2 min-h-[60px] border rounded-lg transition-all hover:bg-primary/10 hover:border-primary/50
                        ${isSelected ? 'border-primary bg-primary/10' : 'border-border'}
                        ${isToday(day) ? 'bg-primary/20 border-primary' : ''}
                        ${hasTopics ? 'bg-gradient-to-br from-background to-primary/5' : ''}
                      `}
                    >
                      <div className="text-sm font-medium mb-1 text-foreground hover:text-foreground">
                        {format(day, 'd')}
                      </div>
                      
                      {dayTopics.slice(0, 2).map((topic) => {
                        const subject = getSubjectById(topic.subjectId);
                        return (
                          <div
                            key={topic.id}
                            className="text-xs p-1 mb-1 rounded truncate text-foreground"
                            style={{ 
                              backgroundColor: subject?.color + '20',
                              color: subject?.color 
                            }}
                          >
                            {topic.title}
                          </div>
                        );
                      })}
                      
                      {dayTopics.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayTopics.length - 2} more
                        </div>
                      )}
                    </button>
                    
                    {/* Plus icon for adding topics */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTopic(day);
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full bg-primary/80 hover:bg-primary text-primary-foreground hover:scale-110 transform"
                      title="Add topic for this date"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Details */}
      <div>
        <Card className="glass-card border-white/40 dark:border-gray-700/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">
                {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a date'}
              </CardTitle>
              {selectedDate && (
                <Button
                  size="sm"
                  onClick={() => onAddTopic(selectedDate)}
                  className="btn-theme-primary hover:scale-105 transition-all duration-300"
                >
                  <Plus size={16} className="mr-1" />
                  Add Topic
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {selectedDate ? (
              selectedDateTopics.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateTopics.map(topic => {
                    const subject = getSubjectById(topic.subjectId);
                    return (
                      <div
                        key={topic.id}
                        className={`p-4 rounded-lg border-l-4 transition-all glass-effect ${priorityColors[topic.priority]}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">
                              {topic.title}
                            </h4>
                            {subject && (
                              <Badge 
                                variant="secondary" 
                                className="text-xs mb-2"
                                style={{ 
                                  backgroundColor: subject.color + '20',
                                  color: subject.color 
                                }}
                              >
                                {subject.name}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-2">
                            <button
                              onClick={() => onViewSession(topic)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              title="View Session Details"
                            >
                              <Eye size={16} />
                            </button>
                            
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="text-muted-foreground hover:text-primary transition-colors">
                                  <ExternalLink size={16} />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48 glass-card">
                                <div className="space-y-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAddToGoogleCalendar(topic)}
                                    className="w-full justify-start text-foreground"
                                  >
                                    Add to Google Calendar
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                            
                            <button
                              onClick={() => onEditTopic(topic)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            
                            <button
                              onClick={() => toggleTopicCompletion(topic.id, topic.completed)}
                              className="transition-colors hover:scale-110"
                            >
                              {topic.completed ? (
                                <CheckCircle2 className="text-green-600" size={20} />
                              ) : (
                                <Circle className="text-muted-foreground hover:text-green-600" size={20} />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {topic.scheduledTime}
                          </div>
                          <span>•</span>
                          <span>{topic.duration} min</span>
                          <span>•</span>
                          <Badge variant="outline" className="capitalize text-xs text-foreground priority-text">
                            {topic.priority}
                          </Badge>
                        </div>
                        
                        {topic.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {topic.description}
                          </p>
                        )}
                        
                        {topic.resources.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-foreground">Resources:</p>
                            {topic.resources.map((resource, index) => (
                              <p key={index} className="text-xs text-muted-foreground truncate">
                                • {resource}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="mx-auto w-12 h-12 opacity-50 mb-3" />
                  <p className="mb-3">No study sessions scheduled for this day</p>
                  <Button
                    size="sm"
                    onClick={() => onAddTopic(selectedDate)}
                    className="btn-theme-primary hover:scale-105 transition-all duration-300"
                  >
                    <Plus size={16} className="mr-1" />
                    Add First Topic
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>Click on a date to view scheduled study sessions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudyCalendar;
