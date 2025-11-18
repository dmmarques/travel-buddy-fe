import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const router = useRouter();
  return (
    <div className="flex flex-row items-center border-b border-gray-200 px-8 pt-4">
      <Button variant="ghost" className="mr-4" onClick={() => router.back()}>
        ← Back
      </Button>
      <div className="flex flex-row gap-4 ml-auto">
        <Button
          variant="ghost"
          className={`pb-2 px-4 rounded-none shadow-none border-b-2 transition-colors duration-150 ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-gray-700"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </Button>
        <Button
          variant="ghost"
          className={`pb-2 px-4 rounded-none shadow-none border-b-2 transition-colors duration-150 ${
            activeTab === "travel"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-gray-700"
          }`}
          onClick={() => setActiveTab("travel")}
        >
          Travel
        </Button>
        <Button
          variant="ghost"
          className={`pb-2 px-4 rounded-none shadow-none border-b-2 transition-colors duration-150 ${
            activeTab === "accommodation"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-gray-700"
          }`}
          onClick={() => setActiveTab("accommodation")}
        >
          Accommodation
        </Button>
        <Button
          variant="ghost"
          className={`pb-2 px-4 rounded-none shadow-none border-b-2 transition-colors duration-150 ${
            activeTab === "aiTab"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-gray-700"
          }`}
          onClick={() => setActiveTab("aiTab")}
        >
          AI Buddy
        </Button>
        <Button
          variant="ghost"
          className={`pb-2 px-4 rounded-none shadow-none border-b-2 transition-colors duration-150 ${
            activeTab === "itinerary"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-gray-700"
          }`}
          onClick={() => setActiveTab("itinerary")}
        >
          Itinerary
        </Button>
        <Button
          variant="ghost"
          className={`pb-2 px-4 rounded-none shadow-none border-b-2 transition-colors duration-150 ${
            activeTab === "budget"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-gray-700"
          }`}
          onClick={() => setActiveTab("budget")}
        >
          Budget
        </Button>
      </div>
    </div>
  );
};

export default Tabs;
