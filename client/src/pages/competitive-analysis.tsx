import React from "react";
import { Helmet } from "react-helmet";
import CompetitiveAnalysis from "@/components/dashboard/competitive-analysis";

export default function CompetitiveAnalysisPage() {
  return (
    <>
      <Helmet>
        <title>Competitive Analysis | Social Media Management Platform</title>
      </Helmet>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <CompetitiveAnalysis />
      </div>
    </>
  );
}