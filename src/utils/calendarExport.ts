
import { StudyTopic, Subject } from '@/pages/Index';

export const generateICalendar = (topics: StudyTopic[], subjects: Subject[]): string => {
  const getSubjectById = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId);
  };

  const formatDateTime = (date: Date, time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const eventDate = new Date(date);
    eventDate.setHours(hours, minutes, 0, 0);
    return eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const createEvent = (topic: StudyTopic): string => {
    if (!topic.scheduledDate) return '';
    
    const subject = getSubjectById(topic.subjectId);
    const startDateTime = formatDateTime(topic.scheduledDate, topic.scheduledTime);
    const endDate = new Date(topic.scheduledDate);
    const [hours, minutes] = topic.scheduledTime.split(':').map(Number);
    endDate.setHours(hours, minutes + topic.duration, 0, 0);
    const endDateTime = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const uid = `study-${topic.id}@studyplanner.com`;
    const created = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${created}`,
      `DTSTART:${startDateTime}`,
      `DTEND:${endDateTime}`,
      `SUMMARY:${topic.title}${subject ? ` - ${subject.name}` : ''}`,
      `DESCRIPTION:${topic.description}${topic.notes ? `\\n\\nNotes: ${topic.notes}` : ''}${topic.resources.length > 0 ? `\\n\\nResources:\\n${topic.resources.join('\\n')}` : ''}`,
      `CATEGORIES:STUDY,${topic.priority.toUpperCase()}`,
      `STATUS:${topic.completed ? 'COMPLETED' : 'CONFIRMED'}`,
      'END:VEVENT'
    ].join('\r\n');
  };

  const events = topics
    .filter(topic => topic.scheduledDate)
    .map(createEvent)
    .filter(event => event !== '')
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Study Planner//Study Planner Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events,
    'END:VCALENDAR'
  ].join('\r\n');
};

export const downloadICalendar = (topics: StudyTopic[], subjects: Subject[]): void => {
  const icalContent = generateICalendar(topics, subjects);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'study-planner-calendar.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateGoogleCalendarUrl = (topic: StudyTopic, subject?: Subject): string => {
  if (!topic.scheduledDate) return '';
  
  const startDate = new Date(topic.scheduledDate);
  const [hours, minutes] = topic.scheduledTime.split(':').map(Number);
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + topic.duration);
  
  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${topic.title}${subject ? ` - ${subject.name}` : ''}`,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: `${topic.description}${topic.notes ? `\n\nNotes: ${topic.notes}` : ''}${topic.resources.length > 0 ? `\n\nResources:\n${topic.resources.join('\n')}` : ''}`,
    location: subject?.name || ''
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
