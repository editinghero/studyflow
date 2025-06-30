
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { StudyTopic, Subject } from '@/pages/Index';

interface EditTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: StudyTopic | null;
  subjects: Subject[];
  onUpdateTopic: (topicId: string, updates: Partial<StudyTopic>) => void;
}

const EditTopicDialog: React.FC<EditTopicDialogProps> = ({
  open,
  onOpenChange,
  topic,
  subjects,
  onUpdateTopic
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [resources, setResources] = useState('');

  useEffect(() => {
    if (topic) {
      setTitle(topic.title);
      setDescription(topic.description);
      setSubjectId(topic.subjectId);
      setPriority(topic.priority);
      setScheduledDate(topic.scheduledDate);
      setScheduledTime(topic.scheduledTime);
      setDuration(topic.duration.toString());
      setNotes(topic.notes);
      setResources(topic.resources.join('\n'));
    }
  }, [topic]);

  const handleSave = () => {
    if (!topic) return;

    onUpdateTopic(topic.id, {
      title,
      description,
      subjectId,
      priority,
      scheduledDate,
      scheduledTime,
      duration: parseInt(duration),
      notes,
      resources: resources.split('\n').filter(r => r.trim() !== '')
    });

    onOpenChange(false);
  };

  if (!topic) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/40 dark:border-gray-700/40 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Study Topic</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-foreground">Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id} className="text-foreground">
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-foreground">Priority</Label>
              <Select value={priority} onValueChange={(value: 'high' | 'medium' | 'low') => setPriority(value)}>
                <SelectTrigger className="glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="high" className="text-foreground">High</SelectItem>
                  <SelectItem value="medium" className="text-foreground">Medium</SelectItem>
                  <SelectItem value="low" className="text-foreground">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal glass-input",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 glass-card">
                  <Calendar
                    mode="single"
                    selected={scheduledDate || undefined}
                    onSelect={(date) => setScheduledDate(date || null)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-foreground">Time</Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-foreground">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resources" className="text-foreground">Resources (one per line)</Label>
            <Textarea
              id="resources"
              value={resources}
              onChange={(e) => setResources(e.target.value)}
              placeholder="Enter resources, one per line"
              className="glass-input"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="glass-button">
            Cancel
          </Button>
          <Button onClick={handleSave} className="btn-theme-primary">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTopicDialog;
