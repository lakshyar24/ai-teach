'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, BookOpen, Target, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RoadmapPage() {
  const params = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoadmap();
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
          <Link href="/">
            <Button variant="outline" className="mb-4">← Back to Home</Button>
          </Link>
          
          <Card className="border-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-3xl">{roadmap.title}</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                {roadmap.goal}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
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
          {topics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="border-2 hover:border-blue-300 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <CardTitle className="text-xl">{topic.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base ml-13">
                        {topic.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-4 whitespace-nowrap">
                      <Clock className="w-3 h-3 mr-1" />
                      {topic.estimated_hours}h
                    </Badge>
                  </div>
                </CardHeader>
                {topic.learning_objectives && topic.learning_objectives.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
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
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">🎉 Your Roadmap is Ready!</CardTitle>
              <CardDescription className="text-green-700">
                You have a structured path with {topics.length} topics covering {Math.round(totalHours)} hours of learning.
                Follow this roadmap to achieve your goal: "{roadmap.goal}"
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}