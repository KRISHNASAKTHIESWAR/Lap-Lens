'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryGeneratorProps {
  sessionId: string;
  vehicleId: number;
}

interface RaceStoryResponse {
  session_id: string;
  vehicle_id: number;
  story: string;
}

export default function StoryGenerator({ sessionId, vehicleId }: StoryGeneratorProps) {
  const [story, setStory] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");

  const generateStory = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/race/generate-race-story-auto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          vehicle_id: vehicleId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate story: ${response.statusText}`);
      }

      const data: RaceStoryResponse = await response.json();
      setStory(data.story);
    } catch (err) {
      console.error('Story generation error:', err);
      setError(err instanceof Error ? err.message : "Failed to generate story");
    } finally {
      setIsGenerating(false);
    }
  };

  // Safe session ID display
  const displaySessionId = sessionId ? `${sessionId.slice(0, 12)}...` : 'Unknown Session';

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.5 }}
      className="
        rounded-2xl p-1 bg-gradient-to-r from-white/5 via-red-700/40 to-white/5 
        shadow-2xl shadow-red-900/20
        hover:shadow-2xl hover:shadow-red-900/30
        transition-all duration-500
      "
    >
      <div className="bg-black/80 rounded-2xl p-8 backdrop-blur-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="
              text-3xl font-bold font-orbitron tracking-wider
              bg-gradient-to-r from-white via-red-200 to-white 
              bg-clip-text text-transparent
              drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]
            ">
              AI RACE STORY
            </h2>
            <p className="text-gray-400 mt-2 font-orbitron tracking-wide">
              Session: {displaySessionId} • Vehicle: #{vehicleId}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(206,17,38,0.5)]"></div>
            <span className="text-red-300 text-sm font-orbitron">AI READY</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Initial State */}
          {!story && !isGenerating && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center shadow-2xl shadow-red-900/30">
                <div className="w-3 h-8 bg-white rounded-sm mx-0.5 animate-bar"></div>
                <div className="w-3 h-6 bg-white rounded-sm mx-0.5 animate-bar" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-10 bg-white rounded-sm mx-0.5 animate-bar" style={{animationDelay: '0.2s'}}></div>
              </div>
              <h3 className="text-2xl font-orbitron text-white mb-4 tracking-wider">
                GENERATE RACE NARRATIVE
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                Create an AI-powered story that analyzes your entire race session, 
                including telemetry data, strategic decisions, and performance metrics.
              </p>
              <motion.button
                onClick={generateStory}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="
                  bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 
                  text-white font-orbitron tracking-wider
                  py-4 px-8 rounded-xl text-lg
                  shadow-2xl shadow-red-900/30 hover:shadow-2xl hover:shadow-red-900/50
                  transition-all duration-300
                  border border-red-500/30
                "
              >
                GENERATE AI STORY
              </motion.button>
            </motion.div>
          )}

          {/* Generating State */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 border-4 border-red-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(206,17,38,0.3)]"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-white border-b-transparent rounded-full animate-spin animation-delay-[-0.3s]"></div>
              </div>
              <h3 className="text-2xl font-orbitron text-white mb-3 tracking-wider">
                ANALYZING RACE DATA
              </h3>
              <p className="text-gray-400">
                Processing telemetry and generating narrative...
              </p>
              <div className="mt-6 flex justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-2 h-8 bg-gradient-to-t from-red-500 to-red-700 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-red-900/50 rounded-full flex items-center justify-center border border-red-600">
                <div className="w-2 h-8 bg-red-400 rounded-sm"></div>
                <div className="w-2 h-8 bg-red-400 rounded-sm mx-1"></div>
              </div>
              <h3 className="text-xl font-orbitron text-red-400 mb-2">GENERATION FAILED</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
              <button
                onClick={generateStory}
                className="
                  bg-red-700 hover:bg-red-600 text-white font-orbitron 
                  py-3 px-6 rounded-lg tracking-wider
                  transition-all duration-300
                "
              >
                TRY AGAIN
              </button>
            </motion.div>
          )}

          {/* Story Display */}
          {story && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="
                bg-gradient-to-br from-gray-900/50 to-black/70 
                rounded-xl p-6 border border-gray-700/50
                shadow-inner shadow-black/50
              "
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-orbitron text-white tracking-wider">
                    RACE ANALYSIS • VEHICLE #{vehicleId}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">AI-Generated Narrative</p>
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => navigator.clipboard.writeText(story)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="
                      bg-gray-700/50 hover:bg-gray-600/50 text-white 
                      py-2 px-4 rounded-lg border border-gray-600/50
                      transition-all duration-200
                      text-sm font-orbitron tracking-wide
                    "
                  >
                    COPY
                  </motion.button>
                  <motion.button
                    onClick={generateStory}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="
                      bg-red-700/50 hover:bg-red-600/50 text-white 
                      py-2 px-4 rounded-lg border border-red-600/50
                      transition-all duration-200
                      text-sm font-orbitron tracking-wide
                    "
                  >
                    REGENERATE
                  </motion.button>
                </div>
              </div>
              
              <div className="
                text-gray-200 leading-7 whitespace-pre-wrap 
                max-h-96 overflow-y-auto pr-4
                scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800
              ">
                {story}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span>AI-Powered Analysis</span>
                  </div>
                  <span className="font-orbitron tracking-wide">Toyota Gazoo Racing</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}