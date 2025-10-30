'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Clock, BookOpen, Target, CheckCircle2, Video, Code, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RoadmapPage() {
  const params = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoadmap();
    fetchProgress();
  }, [params.id]);

  const fetchRoadmap = async () => {
    try {
      const response = await fetch(`/api/roadmaps/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch roadmap');
      }

      setRoadmap(data.roadmap);
      setTopics(data.topics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/progress?roadmapId=${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        const progressMap = {};
        data.progress.forEach(p => {
          progressMap[p.topic_id] = p.completed;
        });
        setProgress(progressMap);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  const handleProgressToggle = async (topicId, currentState) => {
    try {
      const newState = !currentState;
      
      // Optimistic update
      setProgress(prev => ({ ...prev, [topicId]: newState }));

      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roadmapId: params.id,
          topicId: topicId,
          completed: newState
        })
      });

      if (!response.ok) {
        // Revert on error
        setProgress(prev => ({ ...prev, [topicId]: currentState }));
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      // Revert on error
      setProgress(prev => ({ ...prev, [topicId]: currentState }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Link href="/">
              <Button className="mt-4">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalHours = topics.reduce((sum, topic) => sum + parseFloat(topic.estimated_hours || 0), 0);
  const completedCount = topics.filter(t => progress[t._id]).length;
  const progressPercentage = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button variant="outline">← Back to Home</Button>
            </Link>
            <Link href="/visualize">
              <Button variant="outline">
                <Code className="w-4 h-4 mr-2" />
                Code Visualizer
              </Button>
            </Link>
          </div>
          
          <Card className="border-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-3xl">{roadmap.title}</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                {roadmap.goal}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{roadmap.total_days} days × {roadmap.hours_per_day}h/day</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{topics.length} topics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span>{Math.round(totalHours)} total hours</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress: {completedCount}/{topics.length} topics</span>
                  <span className="font-bold">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-full h-3"
                  />
                </div>
              </div>

              {roadmap.skill_level && (
                <Badge className="mt-4 bg-white text-blue-600" variant="secondary">
                  {roadmap.skill_level.charAt(0).toUpperCase() + roadmap.skill_level.slice(1)} Level
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Topics Timeline */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Path</h2>
          {topics.map((topic, index) => {
            const isCompleted = progress[topic._id] || false;
            
            return (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className={`border-2 hover:border-blue-300 hover:shadow-lg transition-all ${isCompleted ? 'bg-green-50 border-green-300' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 ${isCompleted ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
                            {index + 1}
                          </div>
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => handleProgressToggle(topic._id, isCompleted)}
                            className="flex-shrink-0"
                          />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl">{topic.title}</CardTitle>
                          <CardDescription className="text-base mt-2">
                            {topic.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-4 whitespace-nowrap">
                        <Clock className="w-3 h-3 mr-1" />
                        {topic.estimated_hours}h
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Learning Objectives */}
                    {topic.learning_objectives && topic.learning_objectives.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Learning Objectives:</p>
                        <ul className="space-y-1.5">
                          {topic.learning_objectives.map((objective, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Video Suggestions */}
                    {topic.video_suggestions && topic.video_suggestions.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Video Resources:
                        </p>
                        <div className="space-y-2">
                          {topic.video_suggestions.map((query, idx) => (
                            <a
                              key={idx}
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <Video className="w-4 h-4 flex-shrink-0" />
                              <span>{query}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Practice Questions */}
                    {topic.practice_questions && topic.practice_questions.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          Practice Questions:
                        </p>
                        <div className="space-y-2">
                          {topic.practice_questions.map((question, idx) => (
                            <a
                              key={idx}
                              href={question.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Code className="w-4 h-4 text-gray-600" />
                                <div>
                                  <p className="text-sm font-medium">{question.title}</p>
                                  <p className="text-xs text-gray-500">{question.platform}</p>
                                </div>
                              </div>
                              <Badge 
                                variant={question.difficulty === 'Easy' ? 'default' : question.difficulty === 'Medium' ? 'secondary' : 'destructive'}
                                className={
                                  question.difficulty === 'Easy' ? 'bg-green-500' : 
                                  question.difficulty === 'Medium' ? 'bg-yellow-500' : 
                                  'bg-red-500'
                                }
                              >
                                {question.difficulty}
                              </Badge>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <Card className={`${progressPercentage === 100 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
            <CardHeader>
              <CardTitle className={progressPercentage === 100 ? 'text-green-900' : 'text-blue-900'}>
                {progressPercentage === 100 ? '🎉 Congratulations! Roadmap Complete!' : '📚 Keep Learning!'}
              </CardTitle>
              <CardDescription className={progressPercentage === 100 ? 'text-green-700' : 'text-blue-700'}>
                {progressPercentage === 100 
                  ? `Amazing work! You've completed all ${topics.length} topics in this roadmap.`
                  : `You have a structured path with ${topics.length} topics covering ${Math.round(totalHours)} hours of learning. Follow this roadmap to achieve your goal: "${roadmap.goal}"`
                }
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
