import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, AlertCircle, Minus, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Subject, StudyTopic } from '@/pages/Index';

interface AddTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTopic: (topic: Omit<StudyTopic, 'id'>) => void;
  subjects: Subject[];
  prefilledDate?: Date | null;
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

const AddTopicDialog: React.FC<AddTopicDialogProps> = ({
  open,
  onOpenChange,
  onAddTopic,
  subjects,
  prefilledDate
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [newSubtopic, setNewSubtopic] = useState('');
  const [resources, setResources] = useState<string[]>([]);
  const [newResource, setNewResource] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Set prefilled date when dialog opens
  useEffect(() => {
    if (open && prefilledDate) {
      setScheduledDate(prefilledDate);
    }
  }, [open, prefilledDate]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!subjectId) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!scheduledDate) {
      newErrors.date = 'Date is required';
    }
    
    if (!scheduledTime) {
      newErrors.time = 'Time is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Combine notes with subtopics as checkboxes
    const subtopicStrings = subtopics.map(subtopic => `[ ] ${subtopic}`);
    const combinedNotes = [notes.trim(), ...subtopicStrings].filter(Boolean).join('\n');
    
    onAddTopic({
      title: title.trim(),
      description: description.trim(),
      subjectId,
      priority,
      scheduledDate: scheduledDate!,
      scheduledTime,
      duration,
      completed: false,
      notes: combinedNotes,
      resources,
      subtopics
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setSubjectId('');
    setPriority('medium');
    setScheduledDate(undefined);
    setScheduledTime('09:00');
    setDuration(60);
    setNotes('');
    setSubtopics([]);
    setNewSubtopic('');
    setResources([]);
    setNewResource('');
    setErrors({});
    onOpenChange(false);
  };

  const addSubtopic = () => {
    if (newSubtopic.trim()) {
      setSubtopics([...subtopics, newSubtopic.trim()]);
      setNewSubtopic('');
    }
  };

  const removeSubtopic = (index: number) => {
    setSubtopics(subtopics.filter((_, i) => i !== index));
  };

  const addResource = () => {
    if (newResource.trim()) {
      setResources([...resources, newResource.trim()]);
      setNewResource('');
    }
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Study Topic</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Fields Notice */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <AlertTriangle size={16} className="text-blue-600" />
            <span className="text-sm text-blue-800 dark:text-blue-200">
              Title, Subject, Date, and Time are required fields
            </span>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic-title">Topic Title *</Label>
              <Input
                id="topic-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Calculus - Derivatives"
                className={cn(
                  "transition-colors focus:border-blue-400",
                  errors.title && "border-red-500 focus:border-red-500"
                )}
              />
              {errors.title && (
                <span className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.title}
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className={cn(errors.subject && "border-red-500")}>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        {subject.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject && (
                <span className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.subject}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what you'll study..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <Label>Priority Level</Label>
            <div className="flex gap-3">
              {(['high', 'medium', 'low'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriority(level)}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 transition-all capitalize font-medium',
                    priority === level ? priorityColors[level] : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  {level === 'high' && <AlertCircle size={16} className="inline mr-2" />}
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Scheduling - Now Required */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Study Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground",
                      errors.date && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <span className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.date}
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className={cn(
                    "pl-10",
                    errors.time && "border-red-500 focus:border-red-500"
                  )}
                />
              </div>
              {errors.time && (
                <span className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.time}
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes, study tips, or reminders..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Subtopics */}
          <div className="space-y-3">
            <Label>Subtopics Checklist</Label>
            <div className="flex gap-2">
              <Input
                value={newSubtopic}
                onChange={(e) => setNewSubtopic(e.target.value)}
                placeholder="Add a subtopic to track..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtopic())}
              />
              <Button type="button" onClick={addSubtopic} variant="outline">
                Add
              </Button>
            </div>
            
            {subtopics.length > 0 && (
              <div className="space-y-2">
                {subtopics.map((subtopic, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg border bg-gray-50 dark:bg-gray-800">
                    <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                    <span className="flex-1">{subtopic}</span>
                    <Button
                      type="button"
                      onClick={() => removeSubtopic(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Minus size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <Label>Resources & Links</Label>
            <div className="flex gap-2">
              <Input
                value={newResource}
                onChange={(e) => setNewResource(e.target.value)}
                placeholder="Add textbook, website, video link..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
              />
              <Button type="button" onClick={addResource} variant="outline">
                Add
              </Button>
            </div>
            
            {resources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resources.map((resource, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="pr-1 hover:bg-gray-200 transition-colors"
                  >
                    {resource}
                    <button
                      type="button"
                      onClick={() => removeResource(index)}
                      className="ml-2 hover:text-red-600"
                    >
                      <Minus size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Add Topic
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTopicDialog;
