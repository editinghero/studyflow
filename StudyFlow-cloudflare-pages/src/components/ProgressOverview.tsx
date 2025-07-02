
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Clock, CheckCircle } from 'lucide-react';
import { Subject, StudyTopic } from '@/pages/Index';

interface ProgressOverviewProps {
  subjects: Subject[];
  topics: StudyTopic[];
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({ subjects, topics }) => {
  // Calculate overall statistics
  const totalTopics = topics.length;
  const completedTopics = topics.filter(t => t.completed).length;
  const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
  
  const todayTopics = topics.filter(t => {
    if (!t.scheduledDate) return false;
    const today = new Date();
    const topicDate = new Date(t.scheduledDate);
    return topicDate.toDateString() === today.toDateString();
  });
  
  const upcomingTopics = topics.filter(t => {
    if (!t.scheduledDate || t.completed) return false;
    const today = new Date();
    const topicDate = new Date(t.scheduledDate);
    return topicDate >= today;
  }).length;

  const highPriorityTopics = topics.filter(t => t.priority === 'high' && !t.completed).length;

  const stats = [
    {
      title: 'Overall Progress',
      value: `${Math.round(overallProgress)}%`,
      subtitle: `${completedTopics} of ${totalTopics} topics completed`,
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Today\'s Sessions',
      value: todayTopics.length.toString(),
      subtitle: todayTopics.filter(t => t.completed).length + ' completed',
      icon: Clock,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Upcoming Topics',
      value: upcomingTopics.toString(),
      subtitle: 'scheduled sessions',
      icon: Target,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'High Priority',
      value: highPriorityTopics.toString(),
      subtitle: 'topics remaining',
      icon: CheckCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="glass-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Chart */}
      {subjects.length > 0 && (
        <Card className="glass-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp size={20} />
              Subject Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjects.map(subject => {
                const subjectTopics = topics.filter(t => t.subjectId === subject.id);
                const completedCount = subjectTopics.filter(t => t.completed).length;
                const totalCount = subjectTopics.length;
                const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                
                return (
                  <div key={subject.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        <span className="font-medium text-foreground">{subject.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {completedCount}/{totalCount} ({Math.round(progress)}%)
                      </div>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressOverview;
