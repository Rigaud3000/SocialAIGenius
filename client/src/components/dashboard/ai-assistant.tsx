import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { ZapIcon, ClipboardIcon, ClockIcon } from "lucide-react";
import { generateContent } from "@/lib/openai";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AiAssistant() {
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["/api/ai-suggestions"],
  });

  const createContentMutation = useMutation({
    mutationFn: generateContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-suggestions"] });
      setPrompt("");
      toast({
        title: "Content generated",
        description: "Your AI content has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAskAi = async () => {
    if (!prompt.trim()) return;
    createContentMutation.mutate({ prompt, type: "content" });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>AI Assistant</CardTitle>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get help with your social media</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="ml-3 w-full">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full mt-1" />
                    <Skeleton className="h-3 w-full mt-1" />
                    <div className="mt-2">
                      <Skeleton className="h-8 w-28" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 relative">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <ZapIcon className="h-5 w-5 text-primary" />;
      case 'content':
        return <ClipboardIcon className="h-5 w-5 text-secondary" />;
      case 'timing':
        return <ClockIcon className="h-5 w-5 text-amber-600" />;
      default:
        return <ZapIcon className="h-5 w-5 text-primary" />;
    }
  };

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

  // Filter to get only unused suggestions and limit to 3
  const activeSuggestions = suggestions?.filter((s: any) => !s.used).slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>AI Assistant</CardTitle>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get help with your social media</p>
          </div>
          <ZapIcon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeSuggestions?.map((suggestion: any) => (
            <div key={suggestion.id} className={`p-3 bg-gradient-to-r ${getSuggestionClass(suggestion.type)} rounded-lg`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getSuggestionIcon(suggestion.type)}
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{suggestion.title}</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{suggestion.content}</p>
                  <div className="mt-2">
                    <Button size="sm" className={getButtonClass(suggestion.type)}>
                      {suggestion.type === 'trend' ? 'Generate Post' : 
                       suggestion.type === 'content' ? 'Create Content' : 'Schedule Post'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 relative">
          <div className="flex rounded-md shadow-sm">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask AI for content ideas, analytics insights..."
              className="flex-1"
              disabled={createContentMutation.isPending}
            />
            <Button 
              className="ml-3"
              onClick={handleAskAi}
              disabled={!prompt.trim() || createContentMutation.isPending}
            >
              {createContentMutation.isPending ? "Generating..." : "Ask AI"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
