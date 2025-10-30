'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Play, Code2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const exampleCodes = {
  javascript: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(5);
console.log(result);`,
  python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

numbers = [64, 34, 25, 12, 22]
result = bubble_sort(numbers)
print(result)`
};

export default function VisualizePage() {
  const [code, setCode] = useState(exampleCodes.javascript);
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [visualization, setVisualization] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(exampleCodes[newLang] || '');
    setVisualization(null);
    setCurrentStep(0);
  };

  const handleVisualize = async () => {
    setError('');
    setLoading(true);
    setVisualization(null);
    setCurrentStep(0);

    try {
      const response = await fetch('/api/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to visualize code');
      }

      setVisualization(data.visualization);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (visualization && currentStep < visualization.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetVisualization = () => {
    setCurrentStep(0);
  };

  const currentStepData = visualization?.steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            AI Code Visualizer
          </h1>
          <p className="text-lg text-gray-600">
            See how your code executes step-by-step with AI-powered visualization
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Code Editor Panel */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                Code Editor
              </CardTitle>
              <CardDescription>
                Write or paste your code below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <MonacoEditor
                  height="400px"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <Button
                onClick={handleVisualize}
                disabled={loading || !code}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Analyzing Code...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 w-5 h-5" />
                    Visualize Execution
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Visualization Panel */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Execution Visualization</CardTitle>
              <CardDescription>
                {visualization
                  ? `Step ${currentStep + 1} of ${visualization.steps.length}`
                  : 'Click "Visualize Execution" to see step-by-step execution'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!visualization && !loading && (
                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed">
                  <p className="text-gray-500">Visualization will appear here</p>
                </div>
              )}

              {loading && (
                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">AI is analyzing your code...</p>
                  </div>
                </div>
              )}

              {visualization && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Code Summary:</p>
                    <p className="text-sm text-blue-800">{visualization.summary}</p>
                  </div>

                  {/* Current Step */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                        <p className="text-sm font-semibold text-green-900 mb-2">
                          Line {currentStepData?.line}: Execution
                        </p>
                        <p className="text-green-800">{currentStepData?.description}</p>
                      </div>

                      {/* Variables State */}
                      {currentStepData?.variables && Object.keys(currentStepData.variables).length > 0 && (
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-sm font-semibold text-purple-900 mb-2">Variables:</p>
                          <div className="space-y-1">
                            {Object.entries(currentStepData.variables).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2 text-sm">
                                <span className="font-mono font-semibold text-purple-800">{key}:</span>
                                <span className="font-mono text-purple-600">{JSON.stringify(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Controls */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    <Button
                      onClick={resetVisualization}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>

                    <Button
                      onClick={nextStep}
                      disabled={currentStep === visualization.steps.length - 1}
                      variant="outline"
                      size="sm"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}