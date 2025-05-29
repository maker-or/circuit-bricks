'use client';

import { useState, useEffect } from 'react';
import MarkdownRenderer from '../../components/MarkdownRenderer';

export default function TestMarkdownPage() {
  const [markdownTests, setMarkdownTests] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/test-validation')
      .then(res => res.json())
      .then(data => {
        setMarkdownTests(data.markdownTests);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch test data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Loading Markdown Tests...</h1>
        </div>
      </div>
    );
  }

  if (!markdownTests) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-red-400">Failed to Load Test Data</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Markdown Circuit Rendering Tests</h1>
        
        <div className="space-y-8">
          {/* Test 1: With ```circuit language */}
          <div className="border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Test 1: With ```circuit Language Identifier</h2>
            <div className="bg-gray-900 p-4 rounded mb-4">
              <pre className="text-sm text-gray-300 overflow-x-auto">
                {markdownTests.withCircuitLanguage}
              </pre>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-medium mb-2">Rendered Output:</h3>
              <MarkdownRenderer content={markdownTests.withCircuitLanguage} />
            </div>
          </div>

          {/* Test 2: With ```json language */}
          <div className="border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Test 2: With ```json Language Identifier</h2>
            <div className="bg-gray-900 p-4 rounded mb-4">
              <pre className="text-sm text-gray-300 overflow-x-auto">
                {markdownTests.withJsonLanguage}
              </pre>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-medium mb-2">Rendered Output:</h3>
              <MarkdownRenderer content={markdownTests.withJsonLanguage} />
            </div>
          </div>

          {/* Test 3: With no language */}
          <div className="border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Test 3: With No Language Identifier</h2>
            <div className="bg-gray-900 p-4 rounded mb-4">
              <pre className="text-sm text-gray-300 overflow-x-auto">
                {markdownTests.withNoLanguage}
              </pre>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-medium mb-2">Rendered Output:</h3>
              <MarkdownRenderer content={markdownTests.withNoLanguage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
