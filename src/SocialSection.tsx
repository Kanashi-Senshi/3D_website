// SocialSection.tsx
// src/SocialSection.tsx
// src/SocialSection.tsx
import React, { useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";

const SocialSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Feed" | "Communities">("Feed");

  return (
    <div className="w-full min-h-screen bg-[#0d1117] text-white">
      <div className="w-full border-b border-gray-800 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Social Hub</h2>

        {/* Navigation Tabs */}
        <div className="flex">
          {["Feed", "Communities"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "Feed" | "Communities")}
              className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex gap-6">
        {/* Posts Column */}
        <div className="flex-grow">
          {/* Post Card */}
          <div className="bg-[#161b22] rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-medium">Tech Solutions Inc.</span>
            </div>
            <div className="text-sm text-gray-400 mb-3">
              Posted in Prototyping • 15/03/2024
            </div>
            <p className="text-gray-300 mb-4">
              Just launched our new 3D printing service! Check out these amazing
              prototypes.
            </p>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-gray-400 hover:text-gray-300">
                <Heart size={16} />
                <span>24</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-gray-300">
                <MessageCircle size={16} />
                <span>1</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-gray-300">
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80">
          {/* Suggested Communities */}
          <div className="bg-[#161b22] rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium mb-4">Suggested Communities</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Prototyping</h4>
                  <p className="text-sm text-gray-400">1250 members</p>
                </div>
                <button className="px-3 py-1 text-sm text-blue-400 hover:text-blue-300">
                  Join
                </button>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Product Design</h4>
                  <p className="text-sm text-gray-400">980 members</p>
                </div>
                <button className="px-3 py-1 text-sm text-blue-400 hover:text-blue-300">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="bg-[#161b22] rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "3D Printing",
                "Product Design",
                "Manufacturing",
                "Innovation",
              ].map((topic) => (
                <span
                  key={topic}
                  className="inline-block px-2 py-1 bg-[#1f2937] rounded text-sm text-gray-300"
                >
                  #{topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialSection;
