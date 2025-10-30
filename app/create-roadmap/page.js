'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';

const focusAreaOptions = [
  'Frontend', 'Backend', 'Full Stack', 'Mobile Development', 'DevOps',
  'Data Science', 'Machine Learning', 'Database', 'System Design', 'Cloud Computing'
];

export default function CreateRoadmapPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    goal: '',
    totalDays: 90,
    hoursPerDay: 2,
    skillLevel: 'beginner',
    focusAreas: []
  });

  const handleFocusAreaToggle = (area) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/roadmaps/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate roadmap');
      }

      // Redirect to roadmap view
      router.push(`/roadmap/${data.roadmapId}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Create Your Learning Roadmap
            </h1>
            <p className="text-lg text-gray-600">
              Tell us about your goals, and our AI will create a personalized learning path
            </p>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Roadmap Configuration
              </CardTitle>
              <CardDescription>
                Provide details about your learning goals and available time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Goal */}
                <div className="space-y-2">
                  <Label htmlFor="goal">Learning Goal *</Label>
                  <Textarea
                    id="goal"
                    placeholder="e.g., Learn full-stack web development to build production-ready applications"
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    required
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-sm text-gray-500">Be specific about what you want to achieve</p>
                </div>

                {/* Skill Level */}
                <div className="space-y-2">
                  <Label htmlFor="skillLevel">Current Skill Level *</Label>
                  <Select
                    value={formData.skillLevel}
                    onValueChange={(value) => setFormData({ ...formData, skillLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                      <SelectItem value="advanced">Advanced - Experienced learner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Commitment */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalDays">Total Days *</Label>
                    <Input
                      id="totalDays"
                      type="number"
                      min="7"
                      max="365"
                      value={formData.totalDays}
                      onChange={(e) => setFormData({ ...formData, totalDays: e.target.value })}
                      required
                    />
                    <p className="text-sm text-gray-500">7-365 days</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hoursPerDay">Hours Per Day *</Label>
                    <Input
                      id="hoursPerDay"
                      type="number"
                      min="0.5"
                      max="12"
                      step="0.5"
                      value={formData.hoursPerDay}
                      onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
                      required
                    />
                    <p className="text-sm text-gray-500">0.5-12 hours</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Total Learning Time: {formData.totalDays * formData.hoursPerDay} hours
                  </p>
                </div>

                {/* Focus Areas */}
                <div className="space-y-2">
                  <Label>Focus Areas (Optional)</Label>
                  <p className="text-sm text-gray-500 mb-3">Select areas you want to focus on</p>
                  <div className="flex flex-wrap gap-2">
                    {focusAreaOptions.map((area) => (
                      <Badge
                        key={area}
                        variant={formData.focusAreas.includes(area) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-blue-100 transition-colors px-3 py-1.5"
                        onClick={() => handleFocusAreaToggle(area)}
                      >
                        {area}
                        {formData.focusAreas.includes(area) && (
                          <X className="ml-1 w-3 h-3" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 text-lg"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Generating Your Roadmap...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-5 h-5" />
                      Generate Roadmap
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}