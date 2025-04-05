import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";
import { format, addDays, isToday, isSameDay, isBefore } from "date-fns";
import { Trash2, Calendar as CalendarIcon, Edit, Eye, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Scheduler() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tab, setTab] = useState("calendar");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  // Query to get scheduled posts
  const { data: scheduledPosts, isLoading } = useQuery({
    queryKey: ["/api/scheduled-posts"],
  });

  // Query to get connected accounts
  const { data: accounts } = useQuery({
    queryKey: ["/api/accounts"],
  });

  // Mutation to delete a post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest("DELETE", `/api/posts/${postId}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Post deleted",
        description: "The scheduled post has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  // Get posts for the selected date
  const getPostsForDate = (date: Date | undefined) => {
    if (!date || !scheduledPosts) return [];
    
    return scheduledPosts.filter((post: any) => {
      const postDate = new Date(post.scheduledAt);
      return isSameDay(date, postDate);
    });
  };

  // Get all upcoming scheduled posts
  const getUpcomingPosts = () => {
    if (!scheduledPosts) return [];
    
    const now = new Date();
    return scheduledPosts
      .filter((post: any) => {
        const postDate = new Date(post.scheduledAt);
        return !isBefore(postDate, now);
      })
      .sort((a: any, b: any) => {
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      });
  };

  // Handle post deletion
  const handleDeletePost = (postId: number) => {
    deletePostMutation.mutate(postId);
  };

  // Format time for display
  const formatTime = (date: string) => {
    return format(new Date(date), "h:mm a");
  };

  // Get posts for rendered view
  const postsForSelectedDate = selectedDate ? getPostsForDate(selectedDate) : [];
  const upcomingPosts = getUpcomingPosts();

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="mb-4 p-3 border rounded-md">
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scheduler</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage and schedule your upcoming social media posts</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar/List View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Tabs value={tab} onValueChange={setTab} className="w-full">
                  <TabsList>
                    <TabsTrigger value="calendar">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Calendar View
                    </TabsTrigger>
                    <TabsTrigger value="list">
                      <Clock className="h-4 w-4 mr-2" />
                      Timeline View
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <TabsContent value="calendar" className="mt-0">
                  <div className="flex flex-col space-y-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border mx-auto"
                      classNames={{
                        day_today: "bg-primary/10 font-bold text-primary",
                        day_selected: "bg-primary text-primary-foreground",
                        day: postsForSelectedDate.length > 0 ? "relative" : ""
                      }}
                      components={{
                        day: ({ date, ...props }) => {
                          // Check if there are posts for this day
                          const postsOnDate = scheduledPosts.filter((post: any) => {
                            const postDate = new Date(post.scheduledAt);
                            return isSameDay(date, postDate);
                          });
                          
                          // Return the day with a dot if there are posts
                          return (
                            <div {...props} className={`${props.className} relative`}>
                              {date.getDate()}
                              {postsOnDate.length > 0 && (
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>
                              )}
                            </div>
                          );
                        }
                      }}
                    />
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">
                        {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
                      </h3>
                      
                      {postsForSelectedDate.length > 0 ? (
                        <div className="space-y-3">
                          {postsForSelectedDate.map((post: any) => (
                            <Card key={post.id} className="overflow-hidden">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {formatTime(post.scheduledAt)}
                                      </span>
                                      <Badge variant="outline" className="text-xs">Scheduled</Badge>
                                    </div>
                                    <p className="text-sm font-medium">{post.content}</p>
                                    <div className="flex mt-2 space-x-1">
                                      {post.platforms?.map((platform: any) => (
                                        <div key={platform.id} className="p-1 rounded-full border">
                                          {getPlatformIcon(platform.platform?.slug)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button variant="ghost" size="icon">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete scheduled post?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. The post will be permanently deleted from your schedule.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => handleDeletePost(post.id)}
                                            className="bg-red-500 hover:bg-red-600"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-md border border-dashed">
                          <CalendarIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No posts scheduled</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            There are no posts scheduled for this date.
                          </p>
                          <Button className="mt-4">
                            Create a post
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="list" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Upcoming Posts</h3>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Filter by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Platforms</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {upcomingPosts.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingPosts.map((post: any) => {
                          const postDate = new Date(post.scheduledAt);
                          const isPostToday = isToday(postDate);
                          const dateDisplay = isPostToday 
                            ? 'Today' 
                            : format(postDate, 'MMM d, yyyy');
                          
                          return (
                            <Card key={post.id} className="overflow-hidden">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {dateDisplay} at {formatTime(post.scheduledAt)}
                                      </span>
                                      <Badge variant="outline" className={isPostToday ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300" : ""}>
                                        {isPostToday ? "Today" : "Scheduled"}
                                      </Badge>
                                    </div>
                                    <p className="text-sm font-medium">{post.content}</p>
                                    <div className="flex mt-2 space-x-1">
                                      {post.platforms?.map((platform: any) => (
                                        <div key={platform.id} className="p-1 rounded-full border">
                                          {getPlatformIcon(platform.platform?.slug)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button variant="ghost" size="icon">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete scheduled post?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. The post will be permanently deleted from your schedule.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => handleDeletePost(post.id)}
                                            className="bg-red-500 hover:bg-red-600"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-md border border-dashed">
                        <Clock className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No upcoming posts</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          You don't have any posts scheduled for the future.
                        </p>
                        <Button className="mt-4">
                          Create a post
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Schedule Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Schedule</CardTitle>
                <CardDescription>Create and schedule a post quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quick-content">Post Content</Label>
                    <Textarea 
                      id="quick-content"
                      placeholder="What's on your mind?" 
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Select Platforms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {accounts?.slice(0, 4).map((account: any) => (
                        <div key={account.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`platform-${account.id}`}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <Label htmlFor={`platform-${account.id}`} className="flex items-center cursor-pointer">
                            {getPlatformIcon(account.platform?.slug)}
                            <span className="ml-2">{account.platform?.name}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="schedule-time">Schedule For</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Select defaultValue="today">
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="tomorrow">Tomorrow</SelectItem>
                          <SelectItem value="custom">Custom date</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="12pm">
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9am">9:00 AM</SelectItem>
                          <SelectItem value="12pm">12:00 PM</SelectItem>
                          <SelectItem value="3pm">3:00 PM</SelectItem>
                          <SelectItem value="6pm">6:00 PM</SelectItem>
                          <SelectItem value="9pm">9:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button className="w-full">Schedule Post</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Optimal Posting Times</CardTitle>
                <CardDescription>AI-recommended times for best engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                    <div className="flex space-x-2 mb-1">
                      <FaFacebook className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Facebook</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Best times: Weekdays at 1-2pm, Wednesdays at 3pm
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-md bg-pink-50 dark:bg-pink-900/30 border border-pink-100 dark:border-pink-800">
                    <div className="flex space-x-2 mb-1">
                      <FaInstagram className="h-5 w-5 text-pink-500" />
                      <span className="font-medium">Instagram</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Best times: Tuesdays at 2pm, Weekdays at 10-11am
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                    <div className="flex space-x-2 mb-1">
                      <FaTwitter className="h-5 w-5 text-blue-400" />
                      <span className="font-medium">Twitter</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Best times: Weekdays at 9am, Wednesdays at 12pm
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
