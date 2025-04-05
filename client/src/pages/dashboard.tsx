import StatsCard from "@/components/dashboard/stats-card";
import PlatformTable from "@/components/dashboard/platform-table";
import RecentPosts from "@/components/dashboard/recent-posts";
import AiAssistant from "@/components/dashboard/ai-assistant";
import ContentCalendar from "@/components/dashboard/content-calendar";
import ConnectPlatforms from "@/components/dashboard/connect-platforms";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users, ThumbsUp, FileText, Calendar } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
  });

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <Link href="/content-creator">
              <Button>
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Create New Post
              </Button>
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Your social media at a glance</p>
        </div>
        
        {/* Stats overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {isLoading ? (
            <>
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-5">
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </>
          ) : (
            <>
              <StatsCard 
                title="Total Followers"
                value={analytics?.totalFollowers?.toLocaleString() || "0"}
                icon={<Users className="h-6 w-6 text-blue-600 dark:text-blue-200" />}
                iconBgColor="bg-blue-100 dark:bg-blue-900"
                iconTextColor="text-blue-600 dark:text-blue-200"
                trend={{ value: "12.3%", positive: true }}
              />
              <StatsCard 
                title="Engagement Rate"
                value={analytics?.engagementRate || "0%"}
                icon={<ThumbsUp className="h-6 w-6 text-purple-600 dark:text-purple-200" />}
                iconBgColor="bg-purple-100 dark:bg-purple-900"
                iconTextColor="text-purple-600 dark:text-purple-200"
                trend={{ value: "1.2%", positive: true }}
              />
              <StatsCard 
                title="Published Posts"
                value={analytics?.publishedPosts || "0"}
                subValue={`This month: ${Math.floor(analytics?.publishedPosts / 3) || 0}`}
                icon={<FileText className="h-6 w-6 text-green-600 dark:text-green-200" />}
                iconBgColor="bg-green-100 dark:bg-green-900"
                iconTextColor="text-green-600 dark:text-green-200"
              />
              <StatsCard 
                title="Scheduled Posts"
                value={analytics?.scheduledPosts || "0"}
                subValue={`Next 7 days: ${Math.floor(analytics?.scheduledPosts * 0.7) || 0}`}
                icon={<Calendar className="h-6 w-6 text-pink-600 dark:text-pink-200" />}
                iconBgColor="bg-pink-100 dark:bg-pink-900"
                iconTextColor="text-pink-600 dark:text-pink-200"
              />
            </>
          )}
        </div>
        
        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column: Recent posts & analytics */}
          <div className="col-span-2 space-y-6">
            <PlatformTable />
            <RecentPosts />
          </div>
          
          {/* Side column: AI and calendar */}
          <div className="space-y-6">
            <AiAssistant />
            <ContentCalendar />
            <ConnectPlatforms />
          </div>
        </div>
      </div>
    </div>
  );
}
