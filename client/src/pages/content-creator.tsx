import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Image, Wand2Icon } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";
import { generateContent } from "@/lib/openai";

// Define schema for post creation
const postSchema = z.object({
  content: z.string().min(1, "Content is required"),
  platforms: z.array(z.number()).min(1, "Select at least one platform"),
  status: z.enum(["draft", "scheduled", "published"]),
  scheduledAt: z.date().optional(),
  mediaUrls: z.array(z.string()).optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function ContentCreator() {
  const { toast } = useToast();
  const [tab, setTab] = useState("editor");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Query to get all connected accounts
  const { data: accounts } = useQuery({
    queryKey: ["/api/accounts"],
  });

  // Form definition
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      platforms: [],
      status: "draft",
      mediaUrls: [],
    },
  });

  // Mutation to create new post
  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormValues) => {
      const response = await apiRequest("POST", "/api/posts", {
        ...data,
        userId: 1, // For demo purposes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created",
        description: form.getValues("status") === "scheduled" 
          ? "Your post has been scheduled successfully" 
          : "Your post has been created successfully",
      });
      form.reset({
        content: "",
        platforms: [],
        status: "draft",
        mediaUrls: [],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for AI content generation
  const aiGenerateMutation = useMutation({
    mutationFn: generateContent,
    onSuccess: (data) => {
      form.setValue("content", data.content);
      setAiPrompt("");
      setAiLoading(false);
      toast({
        title: "Content generated",
        description: "AI has generated content for your post",
      });
    },
    onError: () => {
      setAiLoading(false);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit form handler
  const onSubmit = (data: PostFormValues) => {
    createPostMutation.mutate(data);
  };

  // AI content generation handler
  const handleGenerateContent = () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for the AI",
        variant: "destructive",
      });
      return;
    }
    
    setAiLoading(true);
    aiGenerateMutation.mutate({ prompt: aiPrompt });
  };

  // Platform icon mapping
  const getPlatformIcon = (slug: string) => {
    switch (slug) {
      case 'facebook':
        return <FaFacebook className="h-5 w-5 mr-2" />;
      case 'instagram':
        return <FaInstagram className="h-5 w-5 mr-2" />;
      case 'twitter':
        return <FaTwitter className="h-5 w-5 mr-2" />;
      case 'linkedin':
        return <FaLinkedin className="h-5 w-5 mr-2" />;
      case 'youtube':
        return <FaYoutube className="h-5 w-5 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Creator</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Create and schedule posts for your social media platforms</p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="editor">Post Editor</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Post</CardTitle>
                    <CardDescription>Compose your content and select platforms to publish to</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Content field */}
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What's on your mind?" 
                              className="min-h-32"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Media upload */}
                    <div>
                      <FormLabel>Media (optional)</FormLabel>
                      <div className="mt-2 flex items-center">
                        <Button type="button" variant="outline" className="w-full">
                          <Image className="h-4 w-4 mr-2" />
                          Add Images or Videos
                        </Button>
                      </div>
                    </div>
                    
                    {/* Platform selection */}
                    <FormField
                      control={form.control}
                      name="platforms"
                      render={() => (
                        <FormItem>
                          <FormLabel>Select Platforms</FormLabel>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {accounts?.map((account: any) => (
                              <FormField
                                key={account.id}
                                control={form.control}
                                name="platforms"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(account.platformId)}
                                        onCheckedChange={(checked) => {
                                          const updatedPlatforms = checked
                                            ? [...field.value, account.platformId]
                                            : field.value.filter((id) => id !== account.platformId);
                                          field.onChange(updatedPlatforms);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="flex items-center cursor-pointer">
                                      {getPlatformIcon(account.platform?.slug)}
                                      {account.platform?.name}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Schedule settings */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posting Options</FormLabel>
                          <div className="mt-2 space-y-2">
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === "draft"}
                                  onChange={() => {
                                    field.onChange("draft");
                                  }}
                                  className="h-4 w-4 text-primary"
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer">Save as draft</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === "published"}
                                  onChange={() => {
                                    field.onChange("published");
                                  }}
                                  className="h-4 w-4 text-primary"
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer">Publish now</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === "scheduled"}
                                  onChange={() => {
                                    field.onChange("scheduled");
                                  }}
                                  className="h-4 w-4 text-primary"
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer">Schedule for later</FormLabel>
                            </FormItem>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Schedule date/time picker - only shown when schedule is selected */}
                    {form.watch("status") === "scheduled" && (
                      <FormField
                        control={form.control}
                        name="scheduledAt"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Schedule Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="w-full pl-3 text-left font-normal flex justify-between"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => form.reset()}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createPostMutation.isPending}
                    >
                      {createPostMutation.isPending ? "Creating..." : (form.watch("status") === "scheduled" ? "Schedule Post" : "Create Post")}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI Content Generator</CardTitle>
                <CardDescription>Let AI help you create engaging content for your posts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>What would you like to post about?</FormLabel>
                  <Textarea
                    placeholder="E.g., Write a post about our new product launch with key features..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="min-h-32"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleGenerateContent}
                    disabled={!aiPrompt.trim() || aiLoading}
                  >
                    <Wand2Icon className="h-4 w-4 mr-2" />
                    {aiLoading ? "Generating..." : "Generate Content"}
                  </Button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md space-y-2 border">
                  <h3 className="text-sm font-medium">Examples</h3>
                  <ul className="space-y-1 text-sm">
                    <li>"Write a post announcing our summer sale with 40% off all products"</li>
                    <li>"Create content about the benefits of remote work for our team"</li>
                    <li>"Draft a customer testimonial highlight for our software"</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
