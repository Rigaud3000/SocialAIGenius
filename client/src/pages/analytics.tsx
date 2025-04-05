import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";
import { TrendingUp, Users, ThumbsUp, Share2, BarChart4, Calendar, LineChart, PieChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Sample data for charts (simulate API response)
const followerGrowthData = [
  { name: 'Jan', facebook: 24000, instagram: 18000, twitter: 12000, linkedin: 8000 },
  { name: 'Feb', facebook: 26000, instagram: 22000, twitter: 13000, linkedin: 9000 },
  { name: 'Mar', facebook: 27000, instagram: 28000, twitter: 15000, linkedin: 10000 },
  { name: 'Apr', facebook: 29000, instagram: 36000, twitter: 18000, linkedin: 11000 },
  { name: 'May', facebook: 32000, instagram: 42000, twitter: 23000, linkedin: 13000 },
  { name: 'Jun', facebook: 35000, instagram: 48000, twitter: 28000, linkedin: 15000 },
];

const engagementData = [
  { name: 'Mon', facebook: 4.8, instagram: 6.2, twitter: 3.5, linkedin: 2.8 },
  { name: 'Tue', facebook: 5.2, instagram: 6.5, twitter: 4.0, linkedin: 3.2 },
  { name: 'Wed', facebook: 5.6, instagram: 6.8, twitter: 4.3, linkedin: 3.6 },
  { name: 'Thu', facebook: 5.3, instagram: 6.4, twitter: 4.1, linkedin: 3.4 },
  { name: 'Fri', facebook: 5.5, instagram: 6.0, twitter: 3.8, linkedin: 3.0 },
  { name: 'Sat', facebook: 4.6, instagram: 5.6, twitter: 3.0, linkedin: 2.5 },
  { name: 'Sun', facebook: 4.4, instagram: 5.4, twitter: 2.8, linkedin: 2.2 },
];

const contentPerformanceData = [
  { name: 'Text', value: 40, color: '#8884d8' },
  { name: 'Image', value: 30, color: '#83a6ed' },
  { name: 'Video', value: 20, color: '#8dd1e1' },
  { name: 'Link', value: 10, color: '#82ca9d' },
];

const postTimesData = [
  { time: '6-9 AM', posts: 12, engagementRate: 3.2 },
  { time: '9-12 PM', posts: 18, engagementRate: 4.5 },
  { time: '12-3 PM', posts: 25, engagementRate: 5.8 },
  { time: '3-6 PM', posts: 22, engagementRate: 5.2 },
  { time: '6-9 PM', posts: 20, engagementRate: 4.7 },
  { time: '9-12 AM', posts: 8, engagementRate: 2.9 },
];

export default function Analytics() {
  const [timeframe, setTimeframe] = useState("30days");
  const [platform, setPlatform] = useState("all");
  
  // Query to get analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          
          <div className="flex justify-between mb-6">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-10 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {Array(2).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Platform icon mapping
  const getPlatformIcon = (slug: string) => {
    switch (slug) {
      case 'facebook':
        return <FaFacebook className="h-5 w-5 text-blue-500" />;
      case 'instagram':
        return <FaInstagram className="h-5 w-5 text-pink-500" />;
      case 'twitter':
        return <FaTwitter className="h-5 w-5 text-blue-400" />;
      case 'linkedin':
        return <FaLinkedin className="h-5 w-5 text-blue-700" />;
      case 'youtube':
        return <FaYoutube className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Track your social media performance and audience engagement</p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 mb-6">
          <Tabs defaultValue={timeframe} onValueChange={setTimeframe} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="7days">7 Days</TabsTrigger>
              <TabsTrigger value="30days">30 Days</TabsTrigger>
              <TabsTrigger value="90days">90 Days</TabsTrigger>
              <TabsTrigger value="alltime">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select defaultValue={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {analytics?.platforms?.map((platform: any) => (
                <SelectItem key={platform.id} value={platform.slug}>
                  <div className="flex items-center">
                    {getPlatformIcon(platform.slug)}
                    <span className="ml-2">{platform.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Overview Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-blue-500" />
                <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">Total Followers</h3>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {(analytics?.totalFollowers || 0).toLocaleString()}
                </span>
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                  +12.3%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <ThumbsUp className="h-5 w-5 text-purple-500" />
                <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">Engagement Rate</h3>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analytics?.engagementRate || "0%"}
                </span>
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                  +1.2%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Share2 className="h-5 w-5 text-green-500" />
                <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">Total Posts</h3>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analytics?.publishedPosts || 0}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  This month: {Math.floor(analytics?.publishedPosts / 3) || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-pink-500" />
                <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">Growth Rate</h3>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  5.8%
                </span>
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                  +0.7%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Detailed Analytics Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Follower Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LineChart className="h-5 w-5 text-primary" />
                <span>Follower Growth</span>
              </CardTitle>
              <CardDescription>Follower count trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={followerGrowthData}>
                    <defs>
                      <linearGradient id="colorFacebook" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1877F2" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1877F2" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInstagram" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E1306C" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#E1306C" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTwitter" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1DA1F2" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1DA1F2" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLinkedin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0A66C2" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0A66C2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="facebook" 
                      name="Facebook"
                      stroke="#1877F2" 
                      fillOpacity={1} 
                      fill="url(#colorFacebook)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="instagram" 
                      name="Instagram"
                      stroke="#E1306C" 
                      fillOpacity={1} 
                      fill="url(#colorInstagram)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="twitter" 
                      name="Twitter"
                      stroke="#1DA1F2" 
                      fillOpacity={1} 
                      fill="url(#colorTwitter)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="linkedin" 
                      name="LinkedIn"
                      stroke="#0A66C2" 
                      fillOpacity={1} 
                      fill="url(#colorLinkedin)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Engagement Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart4 className="h-5 w-5 text-primary" />
                <span>Engagement Rate</span>
              </CardTitle>
              <CardDescription>Average engagement by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="facebook" name="Facebook" fill="#1877F2" />
                    <Bar dataKey="instagram" name="Instagram" fill="#E1306C" />
                    <Bar dataKey="twitter" name="Twitter" fill="#1DA1F2" />
                    <Bar dataKey="linkedin" name="LinkedIn" fill="#0A66C2" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Content Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-primary" />
                <span>Content Performance</span>
              </CardTitle>
              <CardDescription>Engagement by content type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={contentPerformanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      label
                    >
                      {contentPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Best Posting Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Optimal Posting Times</span>
              </CardTitle>
              <CardDescription>Best times to post for maximum engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={postTimesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="posts" 
                      name="Number of Posts" 
                      fill="#82ca9d" 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="engagementRate" 
                      name="Engagement Rate (%)" 
                      stroke="#ff7300" 
                      activeDot={{ r: 8 }} 
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Platform-specific metrics */}
        <div className="mt-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Platform Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics?.platforms?.map((platform: any) => (
              <Card key={platform.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    {getPlatformIcon(platform.slug)}
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{platform.name}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Followers</span>
                      <span className="font-medium">{platform.followers?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Engagement</span>
                      <span className="font-medium">{platform.engagement}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Growth</span>
                      <Badge variant={parseFloat(platform.growth) > 0 ? "outline" : "destructive"} className={parseFloat(platform.growth) > 0 ? "bg-green-50 text-green-700" : ""}>
                        {parseFloat(platform.growth) > 0 ? '+' : ''}{platform.growth}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Posts</span>
                      <span className="font-medium">{platform.posts}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
