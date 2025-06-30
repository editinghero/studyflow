import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar, Target, CheckCircle2, Circle, BookOpen, FileText, Link, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { StudyTopic, Subject } from '@/pages/Index';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SessionSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: StudyTopic | null;
  subject: Subject | null;
  onUpdateTopic: (topicId: string, updates: Partial<StudyTopic>) => void;
  onDeleteTopic: (topicId: string) => void;
  onPlayTickSound?: () => void;
  onPlaySaveSound?: () => void;
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300'
};

const SessionSummaryDialog: React.FC<SessionSummaryDialogProps> = ({
  open,
  onOpenChange,
  topic,
  subject,
  onUpdateTopic,
  onDeleteTopic,
  onPlayTickSound,
  onPlaySaveSound
}) => {
  const [notes, setNotes] = useState(topic?.notes || '');
  const [todos, setTodos] = useState<Array<{id: string, text: string, completed: boolean}>>([]);

  React.useEffect(() => {
    if (topic) {
      setNotes(topic.notes);
      const todoRegex = /\[([x\s])\]\s(.+)/g;
      const foundTodos: Array<{id: string, text: string, completed: boolean}> = [];
      let match;
      let cleanNotes = topic.notes;
      
      while ((match = todoRegex.exec(topic.notes)) !== null) {
        foundTodos.push({
          id: Date.now().toString() + Math.random(),
          text: match[2],
          completed: match[1] === 'x'
        });
        cleanNotes = cleanNotes.replace(match[0], '').trim();
      }
      
      setTodos(foundTodos);
      setNotes(cleanNotes);
    }
  }, [topic]);

  const handleSaveNotes = () => {
    if (!topic) return;
    
    const todoStrings = todos.map(todo => `[${todo.completed ? 'x' : ' '}] ${todo.text}`);
    const combinedNotes = [notes, ...todoStrings].filter(Boolean).join('\n');
    
    onUpdateTopic(topic.id, { notes: combinedNotes });
    
    if (onPlaySaveSound) {
      onPlaySaveSound();
    }
    onOpenChange(false);
  };

  const toggleTodo = (todoId: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    ));
    
    if (onPlayTickSound) {
      onPlayTickSound();
    }
  };

  const addTodo = (text: string) => {
    if (text.trim()) {
      setTodos(prev => [...prev, {
        id: Date.now().toString() + Math.random(),
        text: text.trim(),
        completed: false
      }]);
    }
  };

  const removeTodo = (todoId: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== todoId));
  };

  const toggleCompletion = () => {
    if (!topic) return;
    onUpdateTopic(topic.id, { completed: !topic.completed });
    
    if (!topic.completed) {
      onOpenChange(false);
    }
  };

  const handleDeleteTopic = () => {
    if (!topic) return;
    onDeleteTopic(topic.id);
    onOpenChange(false);
  };

  if (!topic || !subject) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/40 dark:border-gray-700/40 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            Session Summary
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-2">{topic.title}</h2>
                  <Badge 
                    className="mb-3"
                    style={{ 
                      backgroundColor: subject.color + '20',
                      color: subject.color,
                      borderColor: subject.color + '40'
                    }}
                  >
                    <BookOpen size={14} className="mr-1" />
                    {subject.name}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge 
                    className={`${priorityColors[topic.priority]} capitalize`}
                  >
                    <Target size={14} className="mr-1" />
                    {topic.priority} Priority
                  </Badge>
                  
                  <Button
                    onClick={toggleCompletion}
                    variant={topic.completed ? "default" : "outline"}
                    className={topic.completed ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {topic.completed ? (
                      <>
                        <CheckCircle2 size={16} className="mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle size={16} className="mr-2" />
                        Mark Complete
                      </>
                    )}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{topic.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTopic} className="bg-destructive hover:bg-destructive/80">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              {/* Schedule Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={16} className="text-primary" />
                  <span>
                    {topic.scheduledDate ? format(topic.scheduledDate, 'EEEE, MMM d, yyyy') : 'No date set'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={16} className="text-primary" />
                  <span>{topic.scheduledTime}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target size={16} className="text-primary" />
                  <span>{topic.duration} minutes</span>
                </div>
              </div>
              
              {/* Description */}
              {topic.description && (
                <div className="mt-4">
                  <h3 className="font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-muted-foreground">{topic.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resources */}
          {topic.resources.length > 0 && (
            <Card className="glass-effect">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Link size={18} className="text-primary" />
                  Resources
                </h3>
                <div className="space-y-2">
                  {topic.resources.map((resource, index) => (
                    <div key={index} className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>{resource}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes and Todos */}
          <Card className="glass-effect">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-3">Notes & Progress</h3>
              
              {/* Notes Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  General Notes
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your study notes here..."
                  className="glass-input min-h-[100px]"
                />
              </div>

              {/* Todo Section */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Subtopic Checklist
                </label>
                
                <div className="space-y-2 mb-4">
                  {todos.map(todo => (
                    <div key={todo.id} className="flex items-center gap-3 p-2 rounded-lg glass-effect">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo.id)}
                      />
                      <span className={`flex-1 ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {todo.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTodo(todo.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a new subtopic..."
                    className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTodo(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add a new subtopic..."]') as HTMLInputElement;
                      if (input) {
                        addTodo(input.value);
                        input.value = '';
                      }
                    }}
                    variant="outline"
                    className="glass-button"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="glass-button">
            Close
          </Button>
          <Button onClick={handleSaveNotes} className="btn-theme-primary">
            Save Notes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionSummaryDialog;
