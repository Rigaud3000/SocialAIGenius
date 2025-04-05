import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileUp, Calendar, CalendarIcon, Upload, PlusCircle, Loader2, Share2, Edit3, Pencil, Clock, Globe, Video } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaTiktok, FaPinterest } from "react-icons/fa";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import PlatformEditor from "@/components/content/platform-editor";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const getPlatformIcon = (slug: string) => {
  const iconMap: { [key: string]: JSX.Element } = {
    facebook: <FaFacebook className="h-5 w-5 text-blue-600" />,
    instagram: <FaInstagram className="h-5 w-5 text-pink-500" />,
    twitter: <FaTwitter className="h-5 w-5 text-blue-400" />,
    linkedin: <FaLinkedin className="h-5 w-5 text-blue-800" />,
    youtube: <FaYoutube className="h-5 w-5 text-red-600" />,
    tiktok: <FaTiktok className="h-5 w-5" />,
    pinterest: <FaPinterest className="h-5 w-5 text-red-500" />,
  };
  
  return iconMap[slug] || <Globe className="h-5 w-5" />;
};

export default function ContentEditor() {
  const { toast } = useToast();
  const [tab, setTab] = useState("create");
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platformSpecificContent, setPlatformSpecificContent] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("12:00");
  const [schedulePost, setSchedulePost] = useState(false);
  const [applyAiOptimization, setApplyAiOptimization] = useState(true);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  
  // Get all platforms
  const { data: platforms } = useQuery({
    queryKey: ["/api/platforms"],
  });
  
  // Get all connected accounts
  const { data: accounts } = useQuery({
    queryKey: ["/api/accounts"],
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/posts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-posts"] });
      
      // Reset the form
      setContent("");
      setMediaFiles([]);
      setSelectedPlatforms([]);
      setPlatformSpecificContent({});
      setSelectedDate(undefined);
      setSelectedTime("12:00");
      setSchedulePost(false);
      
      toast({
        title: schedulePost ? "Post Scheduled" : "Post Created",
        description: schedulePost 
          ? "Your post has been scheduled successfully!" 
          : "Your post has been created and is ready to publish!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error creating your post. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Get connected platforms from accounts
  const connectedPlatforms = accounts && Array.isArray(accounts) 
    ? accounts.reduce((platforms: string[], account: any) => {
        if (account.connected && account.platform?.slug) {
          if (!platforms.includes(account.platform.slug)) {
            platforms.push(account.platform.slug);
          }
        }
        return platforms;
      }, []) 
    : [];
  
  // Fetch platforms details for the connected platforms
  const platformsDetails = platforms && Array.isArray(platforms)
    ? platforms.filter((platform: any) => connectedPlatforms.includes(platform.slug))
    : [];
  
  // Handle content change for a specific platform
  const handlePlatformContentChange = (platformId: string, updatedContent: string) => {
    setPlatformSpecificContent(prev => ({
      ...prev,
      [platformId]: updatedContent
    }));
  };
  
  // Handle media file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setMediaFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  // Remove a file from the media list
  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle platform selection toggle
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };
  
  // Handle post creation
  const handleCreatePost = () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter some content for your post",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Select Platforms",
        description: "Please select at least one platform to post to",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare scheduled datetime if scheduling is enabled
    let scheduledDateTime = null;
    if (schedulePost && selectedDate) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hours, minutes);
      scheduledDateTime = scheduledDate.toISOString();
    }
    
    // Create the post data with platform-specific content
    const platformsData = selectedPlatforms.map(platformId => {
      const platformContent = platformSpecificContent[platformId] || content;
      return {
        platformId,
        content: platformContent,
      };
    });
    
    // Create post with all data
    createPostMutation.mutate({
      userId: 1, // For demo purposes
      content: content,
      status: schedulePost ? "scheduled" : "draft",
      scheduledAt: scheduledDateTime,
      platforms: selectedPlatforms,
      platformContents: platformsData,
      hasMedia: mediaFiles.length > 0,
      aiOptimized: applyAiOptimization
    });
  };
  
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Editor</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Create and optimize content for multiple social platforms
          </p>
        </div>
        
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="create">
              <Pencil className="h-4 w-4 mr-2" />
              Create Content
            </TabsTrigger>
            <TabsTrigger value="platforms">
              <Share2 className="h-4 w-4 mr-2" />
              Platform Optimization
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Clock className="h-4 w-4 mr-2" />
              Scheduling
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Your Content</CardTitle>
                    <CardDescription>
                      Write your post content and add media
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="content">Post Content</Label>
                      <Textarea 
                        id="content"
                        className="min-h-32 mt-1"
                        placeholder="Write your post content here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                      <div className="mt-1 text-xs text-gray-500 flex justify-between">
                        <span>{content.length} characters</span>
                        <button 
                          onClick={() => setContent("")}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="media">Media</Label>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowMediaUploader(!showMediaUploader)}
                        >
                          {showMediaUploader ? "Hide" : "Add Media"}
                        </Button>
                      </div>
                      
                      {showMediaUploader && (
                        <div className="mt-2 border-2 border-dashed rounded-md p-6 text-center">
                          <FileUp className="h-8 w-8 mx-auto text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">
                            Drag and drop files here, or click to select files
                          </p>
                          <Input
                            id="media"
                            type="file"
                            className="mt-4"
                            onChange={handleFileChange}
                            multiple
                            accept="image/*,video/*"
                          />
                        </div>
                      )}
                      
                      {mediaFiles.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 className="text-sm font-medium">Added Media ({mediaFiles.length})</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {mediaFiles.map((file, index) => (
                              <div key={index} className="relative group">
                                <div className="h-24 border rounded-md overflow-hidden">
                                  {file.type.startsWith('image/') ? (
                                    <img 
                                      src={URL.createObjectURL(file)} 
                                      alt={file.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                      <Video className="h-8 w-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <button
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeFile(index)}
                                >
                                  &times;
                                </button>
                                <p className="mt-1 text-xs truncate">{file.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Publishing Options</CardTitle>
                    <CardDescription>
                      Select platforms and scheduling options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Select Platforms</Label>
                      <div className="space-y-2">
                        {platformsDetails.length > 0 ? (
                          platformsDetails.map((platform: any) => (
                            <div key={platform.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`platform-${platform.id}`}
                                checked={selectedPlatforms.includes(platform.slug)}
                                onCheckedChange={() => togglePlatform(platform.slug)}
                              />
                              <Label 
                                htmlFor={`platform-${platform.id}`} 
                                className="flex items-center cursor-pointer"
                              >
                                {getPlatformIcon(platform.slug)}
                                <span className="ml-2">{platform.name}</span>
                              </Label>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">
                            <p>No connected social accounts.</p>
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-sm"
                              onClick={() => window.location.href = "/connect-accounts"}
                            >
                              Connect accounts
                            </Button> 
                            to start posting.
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="schedule-toggle">Schedule Post</Label>
                        <Switch
                          id="schedule-toggle"
                          checked={schedulePost}
                          onCheckedChange={setSchedulePost}
                        />
                      </div>
                      
                      {schedulePost && (
                        <div className="pt-2 space-y-2">
                          <div className="space-y-1">
                            <Label htmlFor="schedule-date">Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={setSelectedDate}
                                  initialFocus
                                  disabled={(date) => date < new Date()}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          
                          <div className="space-y-1">
                            <Label htmlFor="schedule-time">Time</Label>
                            <Select 
                              value={selectedTime} 
                              onValueChange={setSelectedTime}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, h) => (
                                  [0, 30].map((m) => {
                                    const hour = h.toString().padStart(2, "0");
                                    const minute = m.toString().padStart(2, "0");
                                    const time = `${hour}:${minute}`;
                                    return (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    );
                                  })
                                )).flat()}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ai-optimization">Apply AI Optimization</Label>
                      <Switch
                        id="ai-optimization"
                        checked={applyAiOptimization}
                        onCheckedChange={setApplyAiOptimization}
                      />
                    </div>
                    
                    {applyAiOptimization && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-700 dark:text-blue-300">
                        AI will automatically optimize your content for each platform, including:
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Platform-specific formatting</li>
                          <li>Character count optimization</li>
                          <li>Hashtag recommendations</li>
                          <li>Best practices for each network</li>
                        </ul>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={handleCreatePost}
                      disabled={createPostMutation.isPending}
                    >
                      {createPostMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {schedulePost ? "Schedule Post" : "Create Post"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="platforms">
            <Card>
              <CardHeader>
                <CardTitle>Platform-Specific Optimization</CardTitle>
                <CardDescription>
                  Customize your content for each platform to maximize engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPlatforms.length === 0 ? (
                  <div className="text-center py-8">
                    <Share2 className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium">No platforms selected</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Select platforms in the Create Content tab first
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => setTab("create")}>
                      Go to Create Content
                    </Button>
                  </div>
                ) : (
                  <PlatformEditor
                    content={content}
                    platforms={selectedPlatforms}
                    onChange={handlePlatformContentChange}
                    onAnalyze={(platformId) => {
                      toast({
                        title: "Content Analysis",
                        description: `Analyzing content for ${platformId}`,
                      });
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule Your Post</CardTitle>
                    <CardDescription>
                      Choose when to publish your content across platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="schedule-toggle-main">Schedule Post</Label>
                      <Switch
                        id="schedule-toggle-main"
                        checked={schedulePost}
                        onCheckedChange={setSchedulePost}
                      />
                    </div>
                    
                    {schedulePost ? (
                      <div className="space-y-6">
                        <div>
                          <Label className="mb-2 block">Date & Time</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="schedule-date" className="text-sm">Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left mt-1"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <CalendarComponent
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    initialFocus
                                    disabled={(date) => date < new Date()}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div>
                              <Label htmlFor="schedule-time" className="text-sm">Time</Label>
                              <Select 
                                value={selectedTime} 
                                onValueChange={setSelectedTime}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 24 }, (_, h) => (
                                    [0, 30].map((m) => {
                                      const hour = h.toString().padStart(2, "0");
                                      const minute = m.toString().padStart(2, "0");
                                      const time = `${hour}:${minute}`;
                                      return (
                                        <SelectItem key={time} value={time}>
                                          {time}
                                        </SelectItem>
                                      );
                                    })
                                  )).flat()}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Selected Date/Time:</h3>
                          {selectedDate ? (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                              <div className="flex items-center">
                                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                                <span className="text-blue-700 dark:text-blue-300 font-medium">
                                  {format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
                                </span>
                              </div>
                              
                              {/* Show timezone info */}
                              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                                This time is in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                              </p>
                            </div>
                          ) : (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                              <p className="text-yellow-700 dark:text-yellow-300">
                                Please select a date to schedule your post
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Platform-specific Scheduling Info:</h3>
                          <div className="space-y-2">
                            {selectedPlatforms.map(platform => {
                              const platformConfig = platforms && Array.isArray(platforms) 
                                ? platforms.find((p: any) => p.slug === platform)
                                : undefined;
                              if (!platformConfig) return null;
                              
                              return (
                                <div key={platform} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                  <div className="flex items-center">
                                    {getPlatformIcon(platform)}
                                    <span className="ml-2 font-medium">{platformConfig.name}</span>
                                  </div>
                                  <Badge variant="outline">
                                    {selectedDate ? format(selectedDate, "MMM d") : "Not scheduled"}
                                  </Badge>
                                </div>
                              );
                            })}
                            
                            {selectedPlatforms.length === 0 && (
                              <div className="text-gray-500 text-sm">
                                No platforms selected. Please select platforms in the Create Content tab.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-md text-center">
                        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium">Scheduling Disabled</h3>
                        <p className="mt-2 text-sm text-gray-500">
                          Enable scheduling to set a specific date and time for your post
                        </p>
                        <Button className="mt-4" onClick={() => setSchedulePost(true)}>
                          Enable Scheduling
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Optimal Post Times</CardTitle>
                    <CardDescription>
                      Recommended posting times for better engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { name: "Facebook", slug: "facebook", times: ["9:00 AM", "1:00 PM", "3:00 PM"] },
                        { name: "Instagram", slug: "instagram", times: ["11:00 AM", "2:00 PM", "5:00 PM"] },
                        { name: "Twitter", slug: "twitter", times: ["8:00 AM", "12:00 PM", "6:00 PM"] },
                        { name: "LinkedIn", slug: "linkedin", times: ["7:30 AM", "12:00 PM", "5:30 PM"] },
                        { name: "TikTok", slug: "tiktok", times: ["9:00 AM", "7:00 PM", "11:00 PM"] }
                      ].map(platform => (
                        <div key={platform.slug} className="space-y-2">
                          <div className="flex items-center">
                            {getPlatformIcon(platform.slug)}
                            <span className="ml-2 font-medium">{platform.name}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {platform.times.map((time, i) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Convert time to 24-hour format
                                  const [timeStr, ampm] = time.split(" ");
                                  const [hours, minutes] = timeStr.split(":").map(Number);
                                  let hour24 = hours;
                                  if (ampm === "PM" && hours !== 12) hour24 += 12;
                                  if (ampm === "AM" && hours === 12) hour24 = 0;
                                  
                                  const timeStr24 = `${hour24.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
                                  setSelectedTime(timeStr24);
                                  
                                  // If no date is selected, set today
                                  if (!selectedDate) {
                                    setSelectedDate(new Date());
                                  }
                                  
                                  // Enable scheduling
                                  setSchedulePost(true);
                                  
                                  toast({
                                    title: "Time Selected",
                                    description: `Optimal posting time for ${platform.name}: ${time}`,
                                  });
                                }}
                                className="text-xs justify-center"
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                      <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">Why These Times?</h3>
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        These recommended times are based on general engagement patterns. For more accurate timing, 
                        our AI can analyze your specific audience and recommend personalized posting times.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}