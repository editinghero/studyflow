
import { useEffect, useState, useCallback, useRef } from 'react';
import { StudyTopic, Subject } from '@/pages/Index';
import { toast } from '@/hooks/use-toast';

interface NotificationState {
  activeNotifications: string[];
  studySessions: Record<string, {
    startTime: Date;
    duration: number;
    isActive: boolean;
    timeRemaining: number;
  }>;
}

export const useNotifications = (topics: StudyTopic[], subjects: Subject[]) => {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    activeNotifications: [],
    studySessions: {}
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };
    initAudio();

    // Cleanup
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  const playAlarmSound = useCallback(() => {
    if (!audioContextRef.current) return;

    try {
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      // Create alarm pattern: beep-beep-pause
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.2);

      // Second beep
      setTimeout(() => {
        const oscillator2 = context.createOscillator();
        const gainNode2 = context.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(context.destination);
        
        oscillator2.frequency.setValueAtTime(1000, context.currentTime);
        oscillator2.type = 'sine';
        
        gainNode2.gain.setValueAtTime(0, context.currentTime);
        gainNode2.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
        
        oscillator2.start(context.currentTime);
        oscillator2.stop(context.currentTime + 0.2);
      }, 300);

    } catch (error) {
      console.error('Failed to play alarm sound:', error);
    }
  }, []);

  const dismissNotification = useCallback((topicId: string) => {
    setNotificationState(prev => ({
      ...prev,
      activeNotifications: prev.activeNotifications.filter(id => id !== topicId)
    }));
  }, []);

  const startStudySession = useCallback((topicId: string, duration: number) => {
    setNotificationState(prev => ({
      ...prev,
      studySessions: {
        ...prev.studySessions,
        [topicId]: {
          startTime: new Date(),
          duration: duration * 60, // Convert minutes to seconds
          isActive: true,
          timeRemaining: duration * 60
        }
      }
    }));
    
    // Dismiss the notification when study starts
    dismissNotification(topicId);
  }, [dismissNotification]);

  const extendStudyTime = useCallback((topicId: string, additionalMinutes: number) => {
    setNotificationState(prev => ({
      ...prev,
      studySessions: {
        ...prev.studySessions,
        [topicId]: {
          ...prev.studySessions[topicId],
          duration: prev.studySessions[topicId].duration + (additionalMinutes * 60),
          timeRemaining: prev.studySessions[topicId].timeRemaining + (additionalMinutes * 60)
        }
      }
    }));
  }, []);

  const finishStudySession = useCallback((topicId: string) => {
    setNotificationState(prev => {
      const newSessions = { ...prev.studySessions };
      delete newSessions[topicId];
      return {
        ...prev,
        studySessions: newSessions
      };
    });
  }, []);

  const showTaskNotification = useCallback((topic: StudyTopic, subject: Subject) => {
    console.log('Showing notification for topic:', topic.title);
    
    // Add to active notifications
    setNotificationState(prev => ({
      ...prev,
      activeNotifications: [...prev.activeNotifications.filter(id => id !== topic.id), topic.id]
    }));

    // Play alarm sound
    playAlarmSound();

    // Show toast notification
    toast({
      title: "📚 Study Time!",
      description: `Time to study: ${topic.title} (${subject.name})`,
      duration: 0, // Don't auto-dismiss
    });

    // Browser notification (if permission granted)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Study Time: ${topic.title}`, {
        body: `${subject.name} - ${topic.duration} minutes`,
        icon: '/favicon.ico',
        tag: topic.id
      });
    }
  }, [playAlarmSound]);

  // Check for due tasks and update study sessions
  useEffect(() => {
    const checkTasks = () => {
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                         now.getMinutes().toString().padStart(2, '0');

      console.log('Checking tasks at:', currentTime);

      // Check for scheduled topics
      topics.forEach(topic => {
        if (
          topic.scheduledDate &&
          topic.scheduledTime &&
          !topic.completed &&
          !notificationState.activeNotifications.includes(topic.id)
        ) {
          const taskDate = new Date(topic.scheduledDate);
          const isToday = taskDate.toDateString() === now.toDateString();
          const isTimeMatch = topic.scheduledTime === currentTime;

          console.log(`Topic ${topic.title}: isToday=${isToday}, isTimeMatch=${isTimeMatch}`);

          if (isToday && isTimeMatch) {
            const subject = subjects.find(s => s.id === topic.subjectId);
            if (subject) {
              console.log('Triggering notification for:', topic.title);
              showTaskNotification(topic, subject);
            }
          }
        }
      });

      // Update study sessions
      setNotificationState(prev => {
        const updatedSessions = { ...prev.studySessions };
        let hasChanges = false;

        Object.keys(updatedSessions).forEach(topicId => {
          const session = updatedSessions[topicId];
          if (session.isActive) {
            const elapsed = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
            const remaining = Math.max(0, session.duration - elapsed);
            
            if (remaining !== session.timeRemaining) {
              updatedSessions[topicId] = {
                ...session,
                timeRemaining: remaining
              };
              hasChanges = true;

              // Session completed
              if (remaining === 0) {
                const topic = topics.find(t => t.id === topicId);
                const subject = topic ? subjects.find(s => s.id === topic.subjectId) : null;
                
                if (topic && subject) {
                  playAlarmSound();
                  toast({
                    title: "⏰ Study Session Complete!",
                    description: `Finished studying: ${topic.title}`,
                    duration: 0,
                  });
                }
              }
            }
          }
        });

        return hasChanges ? { ...prev, studySessions: updatedSessions } : prev;
      });
    };

    // Check every 30 seconds for more accurate timing
    checkIntervalRef.current = setInterval(checkTasks, 30000);
    
    // Check immediately
    checkTasks();

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [topics, subjects, notificationState.activeNotifications, showTaskNotification, playAlarmSound]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    activeNotifications: notificationState.activeNotifications,
    studySessions: notificationState.studySessions,
    dismissNotification,
    startStudySession,
    extendStudyTime,
    finishStudySession,
    playAlarm: playAlarmSound
  };
};
