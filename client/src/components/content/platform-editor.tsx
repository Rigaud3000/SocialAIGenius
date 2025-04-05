import React, { useState, useEffect } from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaTiktok, FaPinterest } from "react-icons/fa";
import { Check, AlertCircle, FileImage, Video, Link2, Smile, Hash, CalendarClock, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface PlatformEditorProps {
  content: string;
  platforms: string[];
  onChange: (platformId: string, content: string) => void;
  onAnalyze?: (platformId: string) => void;
}

interface PlatformConfig {
  name: string;
  slug: string;
  icon: React.ReactNode;
  color: string;
  limits: {
    textLength: number;
    mediaCount: number;
    hashtagLimit: number;
  };
  features: {
    images: boolean;
    videos: boolean;
    links: boolean;
    hashtags: boolean;
    mentions: boolean;
    polls: boolean;
    carousels: boolean;
  };
  recommendations: string[];
}

const PLATFORMS_CONFIG: Record<string, PlatformConfig> = {
  facebook: {
    name: "Facebook",
    slug: "facebook",
    icon: <FaFacebook className="h-5 w-5" />,
    color: "text-blue-600",
    limits: {
      textLength: 63206,
      mediaCount: 10,
      hashtagLimit: 30
    },
    features: {
      images: true,
      videos: true,
      links: true,
      hashtags: true,
      mentions: true,
      polls: true,
      carousels: true
    },
    recommendations: [
      "Use 1-2 hashtags for best engagement",
      "Videos perform better than images",
      "Include a clear call-to-action",
      "Keep captions under 80 characters for mobile"
    ]
  },
  instagram: {
    name: "Instagram",
    slug: "instagram",
    icon: <FaInstagram className="h-5 w-5" />,
    color: "text-pink-500",
    limits: {
      textLength: 2200,
      mediaCount: 10,
      hashtagLimit: 30
    },
    features: {
      images: true,
      videos: true,
      links: false,
      hashtags: true,
      mentions: true,
      polls: false,
      carousels: true
    },
    recommendations: [
      "Use 5-10 focused hashtags",
      "Include a strong visual element",
      "Post square images (1:1 ratio)",
      "Ask a question to increase comments"
    ]
  },
  twitter: {
    name: "Twitter",
    slug: "twitter",
    icon: <FaTwitter className="h-5 w-5" />,
    color: "text-blue-400",
    limits: {
      textLength: 280,
      mediaCount: 4,
      hashtagLimit: 5
    },
    features: {
      images: true,
      videos: true,
      links: true,
      hashtags: true,
      mentions: true,
      polls: true,
      carousels: false
    },
    recommendations: [
      "Use 1-2 relevant hashtags",
      "Keep tweets under 250 characters",
      "Images get 35% more engagement",
      "Ask questions to encourage replies"
    ]
  },
  linkedin: {
    name: "LinkedIn",
    slug: "linkedin",
    icon: <FaLinkedin className="h-5 w-5" />,
    color: "text-blue-700",
    limits: {
      textLength: 3000,
      mediaCount: 9,
      hashtagLimit: 5
    },
    features: {
      images: true,
      videos: true,
      links: true,
      hashtags: true,
      mentions: true,
      polls: true,
      carousels: true
    },
    recommendations: [
      "Use professional tone",
      "3-5 focused hashtags",
      "First 2-3 lines are critical",
      "Include insights from professional experience"
    ]
  },
  youtube: {
    name: "YouTube",
    slug: "youtube",
    icon: <FaYoutube className="h-5 w-5" />,
    color: "text-red-600",
    limits: {
      textLength: 5000,
      mediaCount: 1,
      hashtagLimit: 15
    },
    features: {
      images: true,
      videos: true,
      links: true,
      hashtags: true,
      mentions: true,
      polls: false,
      carousels: false
    },
    recommendations: [
      "First 100 characters appear in search",
      "Add timestamps for longer videos",
      "Include relevant keywords",
      "Use end screen CTAs"
    ]
  },
  tiktok: {
    name: "TikTok",
    slug: "tiktok",
    icon: <FaTiktok className="h-5 w-5" />,
    color: "text-black dark:text-white",
    limits: {
      textLength: 2200,
      mediaCount: 1,
      hashtagLimit: 20
    },
    features: {
      images: false,
      videos: true,
      links: false,
      hashtags: true,
      mentions: true,
      polls: false,
      carousels: false
    },
    recommendations: [
      "Use trending hashtags (3-5)",
      "First 3 seconds crucial for retention",
      "Add captions for accessibility",
      "Keep videos 15-30 seconds for highest completion"
    ]
  },
  pinterest: {
    name: "Pinterest",
    slug: "pinterest",
    icon: <FaPinterest className="h-5 w-5" />,
    color: "text-red-500",
    limits: {
      textLength: 500,
      mediaCount: 1,
      hashtagLimit: 5
    },
    features: {
      images: true,
      videos: true,
      links: true,
      hashtags: true,
      mentions: false,
      polls: false,
      carousels: false
    },
    recommendations: [
      "Vertical images (2:3 ratio) perform best",
      "Include detailed description with keywords",
      "Add destination links",
      "Less is more with hashtags (2-3 max)"
    ]
  }
};

export default function PlatformEditor({ content, platforms, onChange, onAnalyze }: PlatformEditorProps) {
  const { toast } = useToast();
  const [platformContents, setPlatformContents] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("original");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  useEffect(() => {
    // Initialize platform contents with original content
    const initialContents: Record<string, string> = { original: content };
    platforms.forEach(platform => {
      initialContents[platform] = content;
    });
    setPlatformContents(initialContents);
  }, [content, platforms]);

  const handleContentChange = (platformId: string, newContent: string) => {
    setPlatformContents(prev => ({
      ...prev,
      [platformId]: newContent
    }));
    onChange(platformId, newContent);
  };

  const handleOptimize = (platformId: string) => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    
    // Simulate optimization process with progress
    const interval = setInterval(() => {
      setOptimizationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsOptimizing(false);
          
          // Apply platform-specific optimizations
          const platformConfig = PLATFORMS_CONFIG[platformId];
          let optimizedContent = content;
          
          // Adapt content length
          if (content.length > platformConfig.limits.textLength) {
            optimizedContent = content.substring(0, platformConfig.limits.textLength - 3) + "...";
          }
          
          // Add platform-specific enhancements
          switch (platformId) {
            case "twitter":
              // Shorten URLs, condense message
              optimizedContent = optimizedContent.replace(/(https?:\/\/[^\s]+)/g, "shortlink");
              break;
            case "instagram":
              // Add relevant hashtags for Instagram
              if (!optimizedContent.includes("#")) {
                optimizedContent += "\n\n#content #social #trending";
              }
              break;
            case "linkedin":
              // Add professional tone for LinkedIn
              if (!optimizedContent.includes("professionals")) {
                optimizedContent = optimizedContent.replace(/you/g, "professionals");
              }
              break;
            case "tiktok":
              // Add trending hashtags for TikTok
              if (!optimizedContent.includes("#")) {
                optimizedContent += "\n\n#fyp #viral #trending";
              }
              break;
          }
          
          // Update content for this platform
          handleContentChange(platformId, optimizedContent);
          
          toast({
            title: "Content Optimized",
            description: `Content has been optimized for ${platformConfig.name}`,
          });
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    return () => clearInterval(interval);
  };

  const handleAnalyze = (platformId: string) => {
    if (onAnalyze) {
      onAnalyze(platformId);
    } else {
      toast({
        title: "Content Analysis",
        description: `Analyzing content for ${PLATFORMS_CONFIG[platformId]?.name || platformId}`,
      });
    }
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const getContentScore = (platformId: string, text: string) => {
    if (!PLATFORMS_CONFIG[platformId]) return 0;
    
    const platform = PLATFORMS_CONFIG[platformId];
    let score = 0;
    
    // Length scoring (optimal vs too long or too short)
    const idealLength = platform.limits.textLength / 3;
    const lengthRatio = Math.min(text.length / idealLength, 1.5);
    score += Math.max(0, 40 - (Math.abs(1 - lengthRatio) * 40));
    
    // Hashtag scoring
    const hashtagMatches = text.match(/#[\w]+/g);
    const hashtagCount = hashtagMatches ? hashtagMatches.length : 0;
    const idealHashtags = platform.slug === "instagram" ? 10 : 
                         platform.slug === "twitter" ? 2 : 
                         platform.slug === "linkedin" ? 3 : 5;
    
    score += Math.max(0, 30 - (Math.abs(hashtagCount - idealHashtags) * 5));
    
    // Features scoring
    if (platform.features.links && text.includes("http")) score += 5;
    if (platform.features.mentions && text.includes("@")) score += 5;
    if (text.includes("?")) score += 10; // Questions often boost engagement
    if (text.length < 50) score -= 10; // Penalize very short content
    
    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, score));
  };

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="original" className="flex-1">
            Original Content
          </TabsTrigger>
          {platforms.map(platform => (
            <TabsTrigger key={platform} value={platform} className="flex-1 flex items-center space-x-2">
              <span className={PLATFORMS_CONFIG[platform]?.color}>
                {PLATFORMS_CONFIG[platform]?.icon}
              </span>
              <span>{PLATFORMS_CONFIG[platform]?.name || platform}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="original">
          <Card>
            <CardHeader>
              <CardTitle>Original Content</CardTitle>
              <CardDescription>
                This is your original content that will be adapted for each platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-32"
                value={platformContents.original || ""}
                onChange={(e) => handleContentChange("original", e.target.value)}
                placeholder="Enter your content here..."
              />
              <div className="mt-2 flex justify-between text-sm text-gray-500">
                <span>{getCharacterCount(platformContents.original || "")} characters</span>
                <span>Original version</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                <span>This content will be optimized for each platform</span>
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  // Copy original content to all platforms
                  const newContents = { ...platformContents };
                  platforms.forEach(platform => {
                    newContents[platform] = platformContents.original || "";
                    onChange(platform, platformContents.original || "");
                  });
                  setPlatformContents(newContents);
                  toast({
                    title: "Content Synced",
                    description: "Original content copied to all platforms",
                  });
                }}
              >
                Sync to All Platforms
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {platforms.map(platform => {
          const platformConfig = PLATFORMS_CONFIG[platform];
          if (!platformConfig) return null;
          
          const contentLength = getCharacterCount(platformContents[platform] || "");
          const isOverLimit = contentLength > platformConfig.limits.textLength;
          const contentScore = getContentScore(platform, platformContents[platform] || "");
          
          return (
            <TabsContent key={platform} value={platform}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <span className={platformConfig.color + " mr-2"}>
                        {platformConfig.icon}
                      </span>
                      {platformConfig.name} Content
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              <span className="text-sm mr-2">Content Score:</span>
                              <Progress value={contentScore} className="h-2 w-24" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="w-80">
                            <p>Score: {contentScore}/100</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Based on optimal length, hashtag usage, and platform-specific features
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <CardDescription>
                    Optimize your content specifically for {platformConfig.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    className={`min-h-32 ${isOverLimit ? "border-red-500 focus:ring-red-500" : ""}`}
                    value={platformContents[platform] || ""}
                    onChange={(e) => handleContentChange(platform, e.target.value)}
                    placeholder={`Enter your ${platformConfig.name} content...`}
                  />
                  
                  <div className="flex justify-between text-sm">
                    <div className={isOverLimit ? "text-red-500" : "text-gray-500"}>
                      {contentLength} / {platformConfig.limits.textLength} characters
                      {isOverLimit && (
                        <span className="ml-2 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Exceeds limit
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500">
                      {contentLength === 0 ? "No content" : contentScore >= 80 ? "Excellent" : contentScore >= 60 ? "Good" : contentScore >= 40 ? "Average" : "Needs improvement"}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Platform Specifications</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="flex items-center">
                        <CalendarClock className="h-3 w-3 mr-1" />
                        {platformConfig.limits.textLength.toLocaleString()} chars
                      </Badge>
                      
                      <Badge variant="outline" className="flex items-center">
                        <FileImage className="h-3 w-3 mr-1" />
                        {platformConfig.limits.mediaCount} media items
                      </Badge>
                      
                      <Badge variant="outline" className="flex items-center">
                        <Hash className="h-3 w-3 mr-1" />
                        {platformConfig.limits.hashtagLimit} hashtags
                      </Badge>
                      
                      {Object.entries(platformConfig.features).map(([feature, enabled]) => 
                        enabled ? (
                          <Badge key={feature} variant="outline" className="flex items-center bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            {feature.charAt(0).toUpperCase() + feature.slice(1)}
                          </Badge>
                        ) : null
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Optimization Tips</h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md p-3">
                      <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1.5 list-disc list-inside">
                        {platformConfig.recommendations.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => handleContentChange(platform, platformContents.original || "")}
                  >
                    Reset to Original
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleAnalyze(platform)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyze
                    </Button>
                    <Button
                      onClick={() => handleOptimize(platform)}
                      disabled={isOptimizing}
                    >
                      {isOptimizing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Optimizing ({optimizationProgress}%)
                        </>
                      ) : (
                        <>
                          Auto-Optimize
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}