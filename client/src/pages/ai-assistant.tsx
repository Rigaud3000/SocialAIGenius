import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Wand2Icon, Calendar as CalendarIcon, Sparkles, Lightbulb, Clock, Check, RefreshCw, Share2, Clipboard as ClipboardIcon } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";
import { generateContent } from "@/lib/openai";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import ApiStatusAlert from "@/components/ai/api-status-alert";

export default function AiAssistant() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [tab, setTab] = useState("suggestions");
  const [contentType, setContentType] = useState<string>("content");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [useGemini, setUseGemini] = useState<boolean>(true); // Default to using Gemini API

  // Query to get AI suggestions
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/ai-suggestions"],
  });

  // Query to get connected accounts
  const { data: accounts } = useQuery({
    queryKey: ["/api/accounts"],
  });

  // Mutation for AI content generation
  const generateContentMutation = useMutation({
    mutationFn: generateContent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-suggestions"] });
      setPrompt("");
      toast({
        title: "Content generated",
        description: "AI has generated content based on your prompt",
      });
    },
    onError: (error: any) => {
      // Handle API quota specific errors more gracefully
      const errorMessage = error?.message?.includes('quota exceeded') 
        ? `OpenAI API quota exceeded. Please upgrade your API key plan or try again later.`
        : "Failed to generate content. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Mutation to create a post from AI suggestion
  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/posts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-posts"] });
      toast({
        title: "Post created",
        description: selectedDate 
          ? "Your post has been scheduled successfully" 
          : "Your post has been created successfully",
      });
      setSelectedDate(undefined);
      setSelectedAccounts([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Use AI suggestion to create a post
  const useSuggestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/ai-suggestions/${id}/use`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-suggestions"] });
      toast({
        title: "Suggestion used",
        description: "This suggestion has been marked as used",
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

  // Suggestion type icon mapping
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <Sparkles className="h-5 w-5 text-primary" />;
      case 'content':
        return <Lightbulb className="h-5 w-5 text-secondary" />;
      case 'timing':
        return <Clock className="h-5 w-5 text-amber-600" />;
      default:
        return <Lightbulb className="h-5 w-5 text-secondary" />;
    }
  };

  // Get gradient class based on suggestion type
  const getSuggestionClass = (type: string) => {
    switch (type) {
      case 'trend':
        return 'from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30';
      case 'content':
        return 'from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30';
      case 'timing':
        return 'from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30';
      default:
        return 'from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30';
    }
  };

  // Get button class based on suggestion type
  const getButtonClass = (type: string) => {
    switch (type) {
      case 'trend':
        return 'bg-primary hover:bg-primary/90 focus:ring-primary';
      case 'content':
        return 'bg-secondary hover:bg-secondary/90 focus:ring-secondary';
      case 'timing':
        return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
      default:
        return 'bg-primary hover:bg-primary/90 focus:ring-primary';
    }
  };

  // Handle generate content
  const handleGenerateContent = () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for the AI",
        variant: "destructive",
      });
      return;
    }
    
    // Convert contentType to a valid type for the API
    const validType = contentType === "trend" || contentType === "content" || contentType === "timing" 
      ? contentType as "trend" | "content" | "timing"
      : "content"; // Default to content if somehow we get an invalid type
    
    generateContentMutation.mutate({ 
      prompt: prompt,
      type: validType,
      useGemini // Pass the useGemini flag to use Google Gemini API
    });
  };

  // Handle prompt template selection
  const handlePromptTemplateChange = (template: string) => {
    setPromptTemplate(template);
    
    // Set predefined prompts based on template
    const templates: Record<string, string> = {
      "engagement": "Write an engaging social media post that encourages audience interaction and comments about",
      "product": "Create a compelling product announcement for social media highlighting the key features and benefits of",
      "event": "Write a social media post promoting an upcoming event, including key details and a call to action for",
      "trending": "Create content that leverages the current trending topic of",
      "storytelling": "Write a narrative-style social media post that tells a compelling story about",
    };
    
    setPrompt(templates[template] || "");
  };

  // Handle using AI suggestion
  const handleUseSuggestion = (suggestion: any) => {
    useSuggestionMutation.mutate(suggestion.id);
  };

  // Handle creating a post from suggestion
  const handleCreatePost = (suggestion: any) => {
    if (selectedAccounts.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return;
    }
    
    createPostMutation.mutate({
      userId: 1, // For demo purposes
      content: suggestion.content,
      status: selectedDate ? "scheduled" : "draft",
      scheduledAt: selectedDate,
      platforms: selectedAccounts,
      aiGenerated: true
    });
  };

  // Toggle platform selection
  const togglePlatform = (platformId: number) => {
    setSelectedAccounts(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  // Render loading state
  if (suggestionsLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          
          <Tabs defaultValue="suggestions" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="suggestions">
                <Skeleton className="h-5 w-24" />
              </TabsTrigger>
              <TabsTrigger value="generator">
                <Skeleton className="h-5 w-24" />
              </TabsTrigger>
              <TabsTrigger value="scheduler">
                <Skeleton className="h-5 w-24" />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="suggestions">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <div className="flex justify-end space-x-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Generate content ideas and optimize your social media strategy</p>
        </div>
        
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="suggestions">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Suggestions
            </TabsTrigger>
            <TabsTrigger value="generator">
              <Wand2Icon className="h-4 w-4 mr-2" />
              Content Generator
            </TabsTrigger>
            <TabsTrigger value="scheduler">
              <Share2 className="h-4 w-4 mr-2" />
              Create & Schedule
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions?.map((suggestion: any) => (
                <Card key={suggestion.id} className={suggestion.used ? "opacity-60" : ""}>
                  <CardContent className={`p-6 bg-gradient-to-r ${getSuggestionClass(suggestion.type)} rounded-t-lg`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {getSuggestionIcon(suggestion.type)}
                      </div>
                      <div className="ml-3 w-full">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">{suggestion.title}</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{suggestion.content}</p>
                        
                        <div className="mt-4 flex justify-between items-center">
                          {suggestion.used ? (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <Check className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">Used</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(suggestion.createdAt).toLocaleDateString()}
                            </span>
                          )}
                          
                          <div className="flex space-x-2">
                            {!suggestion.used && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUseSuggestion(suggestion)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Use
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    setTab("scheduler");
                                    // Pre-fill with suggestion content
                                    setPrompt(suggestion.content);
                                  }}
                                >
                                  <Share2 className="h-3 w-3 mr-1" />
                                  Share
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {(!suggestions || suggestions.length === 0) && (
                <div className="col-span-full text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed">
                  <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No suggestions yet</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Use the content generator to create AI-powered suggestions for your social media.
                  </p>
                  <Button className="mt-4" onClick={() => setTab("generator")}>
                    Generate Content
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="generator">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Content Generator</CardTitle>
                    <CardDescription>Create engaging content for your social media</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* API Status Alert - shows only when there are API errors */}
                    {generateContentMutation.isError && (
                      <div className="mb-4">
                        <ApiStatusAlert 
                          error={
                            (generateContentMutation.error as any)?.message?.includes('quota exceeded')
                              ? `${useGemini ? "Google Gemini" : "OpenAI"} API quota exceeded. Please check your API key billing details or try again later.`
                              : `There was an error connecting to the ${useGemini ? "Google Gemini" : "OpenAI"} API.`
                          }
                          onRetry={() => generateContentMutation.reset()}
                          provider={useGemini ? "gemini" : "openai"}
                        />
                      </div>
                    )}
                    
                    {/* API Provider Toggle */}
                    <div className="flex items-center justify-between space-x-2 p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-medium">AI Provider</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {useGemini ? "Using Google Gemini AI" : "Using OpenAI"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="gemini-toggle" className={`text-sm ${!useGemini ? "font-bold" : ""}`}>OpenAI</Label>
                        <Switch
                          id="gemini-toggle"
                          checked={useGemini}
                          onCheckedChange={setUseGemini}
                        />
                        <Label htmlFor="gemini-toggle" className={`text-sm ${useGemini ? "font-bold" : ""}`}>Gemini</Label>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label htmlFor="content-type" className="text-sm font-medium">Content Type</label>
                        <Select 
                          value={contentType} 
                          onValueChange={setContentType}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="content">Content Idea</SelectItem>
                            <SelectItem value="trend">Trending Topic</SelectItem>
                            <SelectItem value="timing">Posting Strategy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="template" className="text-sm font-medium">Prompt Template</label>
                        <Select 
                          value={promptTemplate} 
                          onValueChange={handlePromptTemplateChange}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select a template or write your own prompt" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="engagement">Engagement Post</SelectItem>
                            <SelectItem value="product">Product Announcement</SelectItem>
                            <SelectItem value="event">Event Promotion</SelectItem>
                            <SelectItem value="trending">Trending Topic</SelectItem>
                            <SelectItem value="storytelling">Story Narrative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Textarea
                        placeholder="Describe what you want the AI to create... Be specific about your goals, audience, and tone."
                        className="min-h-32"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 mt-4">
                      <label className="text-sm font-medium">Prompt Templates</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="justify-start"
                          onClick={() => setPrompt("Create an engaging post about our new product that highlights the key features and benefits for our target audience.")}
                        >
                          <ClipboardIcon className="h-4 w-4 mr-2" />
                          Product Launch
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="justify-start"
                          onClick={() => setPrompt("Analyze our audience data and suggest the optimal time to post content for maximum engagement across all our platforms.")}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Timing Strategy
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="justify-start"
                          onClick={() => setPrompt("Identify current trending topics in our industry and create viral content ideas that we can capitalize on.")}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Trend Analysis
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="justify-start"
                          onClick={() => setPrompt("Generate a series of posts for a week-long campaign that builds engagement and drives conversions for our latest offering.")}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Campaign Series
                        </Button>
                      </div>
                    </div>
                    


                    <div className="flex items-center justify-between mt-4">
                      <div className="w-48">
                        <Select 
                          value={contentType} 
                          onValueChange={setContentType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Content Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="content">Content Idea</SelectItem>
                            <SelectItem value="trend">Trending Topic</SelectItem>
                            <SelectItem value="timing">Posting Strategy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        onClick={handleGenerateContent}
                        disabled={!prompt.trim() || generateContentMutation.isPending}
                      >
                        <Wand2Icon className="h-4 w-4 mr-2" />
                        {generateContentMutation.isPending ? "Generating..." : "Generate Content"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Prompt Tips</CardTitle>
                    <CardDescription>Tips for better AI content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium mb-1">Be Specific</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          "Write a post about our new eco-friendly product line that highlights sustainability and targets millennials"
                        </p>
                      </div>
                      
                      <div className="p-3 rounded-md bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800">
                        <h4 className="font-medium mb-1">Define Tone</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          "Create a humorous yet informative post about digital marketing trends for small businesses"
                        </p>
                      </div>
                      
                      <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800">
                        <h4 className="font-medium mb-1">Include Call-to-Action</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          "Write a post announcing our summer sale with a strong call-to-action to visit our online store"
                        </p>
                      </div>
                      
                      <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800">
                        <h4 className="font-medium mb-1">Platform-Specific</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          "Create a post optimized for Instagram about workplace culture with relevant hashtags"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="scheduler">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Create & Schedule Post</CardTitle>
                    <CardDescription>Share your AI-generated content across platforms</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Post Content</label>
                      <Textarea
                        className="min-h-32 mt-1"
                        placeholder="Enter or paste your content here..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Select Platforms</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {accounts?.map((account: any) => (
                          <div key={account.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`platform-${account.id}`}
                              checked={selectedAccounts.includes(account.platformId)}
                              onCheckedChange={() => togglePlatform(account.platformId)}
                            />
                            <label 
                              htmlFor={`platform-${account.id}`} 
                              className="flex items-center cursor-pointer text-sm"
                            >
                              {getPlatformIcon(account.platform?.slug)}
                              <span className="ml-2">{account.platform?.name}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Schedule Post (Optional)
                      </label>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setPrompt("")}>
                      Clear
                    </Button>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setPrompt("");
                          setSelectedDate(undefined);
                          setSelectedAccounts([]);
                          setTab("suggestions");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => handleCreatePost({ content: prompt })}
                        disabled={!prompt.trim() || selectedAccounts.length === 0 || createPostMutation.isPending}
                      >
                        {createPostMutation.isPending ? "Creating..." : (selectedDate ? "Schedule Post" : "Create Post")}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Best Practices</CardTitle>
                    <CardDescription>Tips for effective social posts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="font-bold text-blue-600 dark:text-blue-300">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Keep it concise</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Short posts typically receive more engagement. Aim for 80-100 characters.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <span className="font-bold text-green-600 dark:text-green-300">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Use visuals</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Posts with images or videos get 2.3x more engagement than text-only posts.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <span className="font-bold text-purple-600 dark:text-purple-300">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Ask questions</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Posts that ask questions see 92% higher comment rates on average.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                          <span className="font-bold text-amber-600 dark:text-amber-300">4</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Optimal timing</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Post when your audience is most active. Use our AI timing suggestions.
                          </p>
                        </div>
                      </div>
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
