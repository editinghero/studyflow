import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Calendar, Clock, Target, CheckCircle2, Circle, Eye, Trash2 } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { Subject, StudyTopic } from '@/pages/Index';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SubjectDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
  topics: StudyTopic[];
  onViewSession: (topic: StudyTopic) => void;
  onDeleteSubject: (subjectId: string) => void;
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300'
};

const SubjectDetailsDialog: React.FC<SubjectDetailsDialogProps> = ({
  open,
  onOpenChange,
  subject,
  topics,
  onViewSession,
  onDeleteSubject
}) => {
  if (!subject) return null;

  const completedTopics = topics.filter(t => t.completed);
  const upcomingTopics = topics.filter(t => !t.completed && t.scheduledDate);
  const unscheduledTopics = topics.filter(t => !t.completed && !t.scheduledDate);

  const formatDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const totalStudyTime = topics.reduce((acc, topic) => acc + topic.duration, 0);
  const completedStudyTime = completedTopics.reduce((acc, topic) => acc + topic.duration, 0);

  const handleDeleteSubject = () => {
    onDeleteSubject(subject.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/40 dark:border-gray-700/40 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            Subject Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Subject Header */}
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full shadow-lg"
                    style={{ backgroundColor: subject.color }}
                  />
                  <h2 className="text-2xl font-bold text-foreground">{subject.name}</h2>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      {subject.completedTopics}/{subject.totalTopics}
                    </div>
                    <div className="text-sm text-muted-foreground">Topics Completed</div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 size={16} className="mr-1" />
                        Delete Subject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{subject.name}"? This will also delete all {subject.totalTopics} associated topics. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSubject} className="bg-destructive hover:bg-destructive/80">
                          Delete Subject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              <Progress 
                value={subject.totalTopics > 0 ? (subject.completedTopics / subject.totalTopics) * 100 : 0}
                className="h-3 mb-4"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg glass-effect">
                  <div className="text-lg font-semibold text-foreground">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</div>
                  <div className="text-sm text-muted-foreground">Total Study Time</div>
                </div>
                
                <div className="p-3 rounded-lg glass-effect">
                  <div className="text-lg font-semibold text-foreground">{Math.floor(completedStudyTime / 60)}h {completedStudyTime % 60}m</div>
                  <div className="text-sm text-muted-foreground">Time Completed</div>
                </div>
                
                <div className="p-3 rounded-lg glass-effect">
                  <div className="text-lg font-semibold text-foreground">{upcomingTopics.length}</div>
                  <div className="text-sm text-muted-foreground">Upcoming Sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Topics */}
          {upcomingTopics.length > 0 && (
            <Card className="glass-effect">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  Upcoming Sessions ({upcomingTopics.length})
                </h3>
                
                <div className="space-y-3">
                  {upcomingTopics
                    .sort((a, b) => {
                      if (!a.scheduledDate || !b.scheduledDate) return 0;
                      return a.scheduledDate.getTime() - b.scheduledDate.getTime();
                    })
                    .map(topic => (
                      <div key={topic.id} className="p-4 rounded-lg glass-effect border-l-4" style={{ borderLeftColor: subject.color }}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground mb-2">{topic.title}</h4>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                {topic.scheduledDate && formatDate(topic.scheduledDate)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                {topic.scheduledTime}
                              </div>
                              <div className="flex items-center gap-1">
                                <Target size={14} />
                                {topic.duration}min
                              </div>
                            </div>
                            
                            <Badge className={`text-xs capitalize ${priorityColors[topic.priority]}`}>
                              {topic.priority} priority
                            </Badge>
                          </div>
                          
                          <Button
                            onClick={() => onViewSession(topic)}
                            variant="outline"
                            size="sm"
                            className="glass-button"
                          >
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Topics */}
          {completedTopics.length > 0 && (
            <Card className="glass-effect">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-500" />
                  Completed Sessions ({completedTopics.length})
                </h3>
                
                <div className="space-y-3">
                  {completedTopics.map(topic => (
                    <div key={topic.id} className="p-4 rounded-lg glass-effect border-l-4 border-l-green-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-green-500" />
                            {topic.title}
                          </h4>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Target size={14} />
                              {topic.duration}min
                            </div>
                            <Badge className={`text-xs capitalize ${priorityColors[topic.priority]}`}>
                              {topic.priority} priority
                            </Badge>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => onViewSession(topic)}
                          variant="outline"
                          size="sm"
                          className="glass-button"
                        >
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unscheduled Topics */}
          {unscheduledTopics.length > 0 && (
            <Card className="glass-effect">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Circle size={18} className="text-orange-500" />
                  Unscheduled Topics ({unscheduledTopics.length})
                </h3>
                
                <div className="space-y-3">
                  {unscheduledTopics.map(topic => (
                    <div key={topic.id} className="p-4 rounded-lg glass-effect border-l-4 border-l-orange-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-2">{topic.title}</h4>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Target size={14} />
                              {topic.duration}min
                            </div>
                            <Badge className={`text-xs capitalize ${priorityColors[topic.priority]}`}>
                              {topic.priority} priority
                            </Badge>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => onViewSession(topic)}
                          variant="outline"
                          size="sm"
                          className="glass-button"
                        >
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)} className="glass-button">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectDetailsDialog;
