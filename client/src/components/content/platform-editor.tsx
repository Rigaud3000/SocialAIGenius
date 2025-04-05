import React, { useState, useEffect } from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaTiktok, FaPinterest } from "react-icons/fa";
import { Check, AlertCircle, FileImage, Video, Link2, Smile, Hash, CalendarClock, BarChart3, Info, AlertTriangle, Lightbulb } from "lucide-react";
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
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    
    // Simulate AI-powered optimization process with progress
    const interval = setInterval(() => {
      setOptimizationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsOptimizing(false);
          
          // Apply advanced platform-specific optimizations
          const platformConfig = PLATFORMS_CONFIG[platformId];
          let optimizedContent = content;
          
          // Adapt content length with smart summarization
          if (content.length > platformConfig.limits.textLength) {
            const exceedsBy = content.length - platformConfig.limits.textLength;
            
            if (exceedsBy > 100) {
              // Smart summarization for significantly longer content
              const sentences = content.split(/[.!?]+/);
              let summary = "";
              let currentLength = 0;
              
              // Keep the first and last sentences, and smartly select middle content
              if (sentences.length > 3) {
                // Always include the first sentence (the hook)
                summary += sentences[0] + ". ";
                currentLength += sentences[0].length + 2;
                
                // Determine how many middle sentences we can include
                const availableLength = platformConfig.limits.textLength - currentLength - sentences[sentences.length - 1].length - 5;
                
                // Select most important middle sentences (simplified by taking every other one)
                for (let i = 1; i < sentences.length - 1; i += 2) {
                  if (currentLength + sentences[i].length + 2 < availableLength) {
                    summary += sentences[i] + ". ";
                    currentLength += sentences[i].length + 2;
                  } else {
                    break;
                  }
                }
                
                // Add the last sentence (the conclusion/call to action)
                summary += sentences[sentences.length - 1];
                
                optimizedContent = summary;
              } else {
                // For shorter content, just truncate
                optimizedContent = content.substring(0, platformConfig.limits.textLength - 3) + "...";
              }
            } else {
              // Minor truncation for slightly longer content
              optimizedContent = content.substring(0, platformConfig.limits.textLength - 3) + "...";
            }
          }
          
          // Add platform-specific advanced enhancements
          switch (platformId) {
            case "twitter":
              // Shorten URLs, optimize hashtags, condense message
              optimizedContent = optimizedContent.replace(/(https?:\/\/[^\s]+)/g, "shortlink");
              
              // Improve hashtag usage for Twitter
              const existingTwitterHashtags = optimizedContent.match(/#[\w]+/g) || [];
              if (existingTwitterHashtags.length === 0) {
                // Extract keywords and create relevant hashtags
                const keywords = optimizedContent
                  .toLowerCase()
                  .replace(/[^\w\s]/g, '')
                  .split(/\s+/)
                  .filter(word => word.length > 4)
                  .slice(0, 2);
                
                if (keywords.length > 0) {
                  optimizedContent += "\n\n" + keywords.map(k => `#${k}`).join(" ");
                }
              } else if (existingTwitterHashtags.length > 3) {
                // Twitter performs better with fewer, more targeted hashtags
                // Keep only the first 2-3 hashtags
                const hashtagsToKeep = existingTwitterHashtags.slice(0, 3);
                const hashtagsToRemove = existingTwitterHashtags.slice(3);
                
                hashtagsToRemove.forEach(hashtag => {
                  optimizedContent = optimizedContent.replace(hashtag, '');
                });
                
                // Clean up any double spaces created by removing hashtags
                optimizedContent = optimizedContent.replace(/\s+/g, ' ');
              }
              
              // Add question to increase engagement if none exists
              if (!optimizedContent.includes("?")) {
                optimizedContent += "\n\nWhat do you think?";
              }
              break;
              
            case "instagram":
              // Enhanced Instagram optimization
              const existingInstaHashtags = optimizedContent.match(/#[\w]+/g) || [];
              
              // Instagram performs best with 5-10 relevant hashtags
              if (existingInstaHashtags.length === 0) {
                // Extract themes from content to generate relevant hashtags
                const themes = ['content', 'social', 'trending', 'instagram', 'instagood', 'photooftheday'];
                const randomThemes = themes.sort(() => 0.5 - Math.random()).slice(0, 5);
                optimizedContent += "\n\n" + randomThemes.map(t => `#${t}`).join(" ") + " #instadaily";
              } else if (existingInstaHashtags.length < 5) {
                // Add a few more hashtags to reach the optimal range
                const additionalTags = ["#instagood", "#photooftheday", "#instadaily", "#picoftheday", "#love"];
                const tagsToAdd = additionalTags.slice(0, 5 - existingInstaHashtags.length);
                optimizedContent += " " + tagsToAdd.join(" ");
              }
              
              // Add line breaks for better readability on Instagram
              if (!optimizedContent.includes("\n\n") && optimizedContent.length > 80) {
                // Insert a line break after the first sentence or around character 80
                const firstSentence = optimizedContent.match(/^.*?[.!?]/);
                if (firstSentence) {
                  const breakPoint = firstSentence[0].length;
                  optimizedContent = optimizedContent.substring(0, breakPoint) + "\n\n" + optimizedContent.substring(breakPoint).trim();
                } else {
                  let breakPoint = Math.min(80, Math.floor(optimizedContent.length / 2));
                  while (breakPoint < optimizedContent.length && !/\s/.test(optimizedContent[breakPoint])) {
                    breakPoint++;
                  }
                  optimizedContent = optimizedContent.substring(0, breakPoint) + "\n\n" + optimizedContent.substring(breakPoint).trim();
                }
              }
              
              // Add emojis for better engagement if none exist
              if (!(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/).test(optimizedContent)) {
                const popularEmojis = ["✨", "🔥", "💯", "👉", "🙌", "📸", "❤️"];
                const selectedEmoji = popularEmojis[Math.floor(Math.random() * popularEmojis.length)];
                optimizedContent = selectedEmoji + " " + optimizedContent;
              }
              break;
              
            case "linkedin":
              // Advanced LinkedIn optimization for professional audience
              // Add professional tone for LinkedIn
              if (!optimizedContent.includes("professionals")) {
                optimizedContent = optimizedContent.replace(/you all/g, "professionals")
                                                  .replace(/you guys/g, "professionals")
                                                  .replace(/everyone/g, "professionals");
              }
              
              // LinkedIn performs best with a few targeted hashtags (3-5)
              const existingLinkedInHashtags = optimizedContent.match(/#[\w]+/g) || [];
              if (existingLinkedInHashtags.length === 0) {
                // Add relevant professional hashtags
                const professionalTags = ["#business", "#leadership", "#innovation", "#professionaldevelopment", "#networking"];
                const selectedTags = professionalTags.slice(0, 3);
                optimizedContent += "\n\n" + selectedTags.join(" ");
              }
              
              // Add a call to action for better engagement
              if (!optimizedContent.includes("comment") && !optimizedContent.includes("thoughts") && !optimizedContent.includes("agree")) {
                optimizedContent += "\n\nWhat are your thoughts on this? I'd appreciate your professional insights in the comments.";
              }
              
              // Structure with line breaks for readability
              if (!optimizedContent.includes("\n\n") && optimizedContent.length > 100) {
                const paragraphs = optimizedContent.split(/\n/);
                if (paragraphs.length === 1) {
                  // Split into multiple paragraphs for readability
                  const sentences = optimizedContent.split(/[.!?]+\s/);
                  if (sentences.length > 2) {
                    let structured = "";
                    let currentParagraph = "";
                    
                    sentences.forEach((sentence, i) => {
                      currentParagraph += sentence.trim() + ". ";
                      
                      // Create a new paragraph every 2-3 sentences
                      if ((i + 1) % 2 === 0 && i < sentences.length - 1) {
                        structured += currentParagraph.trim() + "\n\n";
                        currentParagraph = "";
                      }
                    });
                    
                    // Add the final paragraph
                    if (currentParagraph.trim().length > 0) {
                      structured += currentParagraph.trim();
                    }
                    
                    optimizedContent = structured;
                  }
                }
              }
              break;
              
            case "tiktok":
              // Enhanced TikTok optimization
              // Add trending hashtags for TikTok
              const existingTikTokHashtags = optimizedContent.match(/#[\w]+/g) || [];
              if (existingTikTokHashtags.length === 0) {
                // Add viral TikTok hashtags
                optimizedContent += "\n\n#fyp #foryoupage #viral #trending #tiktok";
              }
              
              // TikTok captions should be concise and catchy
              if (optimizedContent.length > 150) {
                // Extract the first 2 sentences or first 150 chars
                const firstSentences = optimizedContent.match(/^.*?[.!?].*?[.!?]/);
                if (firstSentences) {
                  const shortVersion = firstSentences[0];
                  // Keep hashtags if they exist
                  const hashtags = optimizedContent.match(/#[\w]+/g) || [];
                  optimizedContent = shortVersion + "\n\n" + hashtags.join(" ");
                } else {
                  optimizedContent = optimizedContent.substring(0, 147) + "...";
                }
              }
              
              // Add emojis for better engagement if none exist
              if (!(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/).test(optimizedContent)) {
                const tiktokEmojis = ["😂", "💃", "🔥", "✨", "🤩", "👀", "🎵"];
                const randomEmojis = tiktokEmojis.sort(() => 0.5 - Math.random()).slice(0, 2).join("");
                optimizedContent = randomEmojis + " " + optimizedContent;
              }
              break;
              
            case "facebook":
              // Enhanced Facebook optimization
              // Facebook posts perform better with questions and calls to action
              if (!optimizedContent.includes("?")) {
                optimizedContent += "\n\nWhat are your thoughts? Let me know in the comments!";
              }
              
              // Add emojis for better visibility in newsfeed
              if (!(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/).test(optimizedContent)) {
                const facebookEmojis = ["👉", "👍", "💯", "💪", "😊"];
                const selectedEmoji = facebookEmojis[Math.floor(Math.random() * facebookEmojis.length)];
                optimizedContent = selectedEmoji + " " + optimizedContent;
              }
              
              // Structure with line breaks for readability
              if (!optimizedContent.includes("\n\n") && optimizedContent.length > 120) {
                const sentences = optimizedContent.split(/[.!?]+\s/);
                if (sentences.length > 2) {
                  // Insert line breaks between paragraphs
                  let structured = sentences[0] + ".\n\n";
                  for (let i = 1; i < sentences.length - 1; i++) {
                    structured += sentences[i] + ". ";
                    if (i % 2 === 0) {
                      structured += "\n\n";
                    }
                  }
                  structured += sentences[sentences.length - 1];
                  optimizedContent = structured;
                }
              }
              break;
              
            case "youtube":
              // Enhanced YouTube optimization
              // YouTube descriptions need keywords at the beginning
              const keywords = optimizedContent
                .toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(word => word.length > 4)
                .slice(0, 5);
                
              if (keywords.length > 0) {
                const keywordText = "Keywords: " + keywords.join(", ");
                if (!optimizedContent.includes("Keywords:")) {
                  optimizedContent += "\n\n" + keywordText;
                }
              }
              
              // Add timestamps for video navigation
              if (!optimizedContent.includes(":")) {
                optimizedContent += "\n\nTimestamps:\n0:00 Introduction\n1:30 Main Content\n5:00 Summary\n7:00 Call to Action";
              }
              
              // Add subscribe reminder
              if (!optimizedContent.includes("subscribe")) {
                optimizedContent += "\n\nDon't forget to like, comment, and subscribe for more content!";
              }
              
              // Add links to related content
              if (!optimizedContent.includes("http")) {
                optimizedContent += "\n\nCheck out my other videos: [link]\nFollow me on social media: [links]";
              }
              break;
              
            case "pinterest":
              // Enhanced Pinterest optimization
              // Pinterest descriptions should include keywords and be concise
              if (optimizedContent.length > 300) {
                // Keep first 300 characters but preserve hashtags
                const hashtags = optimizedContent.match(/#[\w]+/g) || [];
                optimizedContent = optimizedContent.substring(0, 297) + "...";
                
                // Add hashtags back if they were truncated
                if (hashtags.length > 0 && !optimizedContent.includes("#")) {
                  optimizedContent += "\n\n" + hashtags.slice(0, 3).join(" ");
                }
              }
              
              // Add Pin-specific call to action
              if (!optimizedContent.includes("Save") && !optimizedContent.includes("Pin")) {
                optimizedContent += "\n\nSave this Pin for later!";
              }
              
              // Add relevant keywords for searchability
              const pinterestKeywords = ["DIY", "ideas", "inspiration", "how to", "tips", "tutorial"];
              const relevantKeywords = pinterestKeywords.filter(kw => 
                optimizedContent.toLowerCase().includes(kw.toLowerCase())
              );
              
              if (relevantKeywords.length === 0 && !optimizedContent.includes("Keywords:")) {
                optimizedContent += "\n\nKeywords: home, decor, ideas, inspiration";
              }
              break;
          }
          
          // Update content for this platform
          handleContentChange(platformId, optimizedContent);
          
          toast({
            title: "AI-Powered Optimization Complete",
            description: `Content has been intelligently optimized for ${platformConfig.name}`,
          });
          
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    
    return () => clearInterval(interval);
  };

  const [analysisResults, setAnalysisResults] = useState<{type: string, message: string}[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analyzedPlatform, setAnalyzedPlatform] = useState<string>("");
  
  const handleAnalyze = (platformId: string) => {
    const content = platformContents[platformId] || "";
    const analysis = getContentAnalysis(platformId, content);
    
    setAnalysisResults(analysis);
    setShowAnalysis(true);
    setAnalyzedPlatform(platformId);
    
    if (onAnalyze) {
      onAnalyze(platformId);
    } else {
      toast({
        title: "Content Analysis Complete",
        description: `Analysis completed for ${PLATFORMS_CONFIG[platformId]?.name || platformId}`,
      });
    }
  };
  
  // Content Analyzer Component
  const ContentAnalyzer = ({ analysis, onClose, platformName }: { analysis: {type: string, message: string}[], onClose: () => void, platformName: string }) => {
    if (analysis.length === 0) {
      return (
        <Alert className="mt-4 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-400">Perfect Content</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            Your content is optimized and ready to publish on {platformName}! No issues were found.
          </AlertDescription>
        </Alert>
      );
    }
    
    // Count issues by type
    const errorCount = analysis.filter(item => item.type === "error").length;
    const warningCount = analysis.filter(item => item.type === "warning").length;
    const tipCount = analysis.filter(item => item.type === "tip").length;
    
    return (
      <div className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                Content Analysis for {platformName}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
            <div className="flex space-x-3 mt-1">
              {errorCount > 0 && (
                <Badge variant="destructive" className="flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="outline" className="flex items-center bg-yellow-50 text-yellow-700 border-yellow-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}
                </Badge>
              )}
              {tipCount > 0 && (
                <Badge variant="outline" className="flex items-center bg-blue-50 text-blue-700 border-blue-200">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  {tipCount} {tipCount === 1 ? 'Tip' : 'Tips'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {errorCount > 0 && (
                <AccordionItem value="errors">
                  <AccordionTrigger className="text-red-500 font-medium">
                    Critical Issues
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {analysis.filter(item => item.type === "error").map((item, i) => (
                        <Alert key={i} variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>
                            {item.message}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {warningCount > 0 && (
                <AccordionItem value="warnings">
                  <AccordionTrigger className="text-yellow-500 font-medium">
                    Warnings
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {analysis.filter(item => item.type === "warning").map((item, i) => (
                        <Alert key={i} className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <AlertTitle className="text-yellow-800 dark:text-yellow-400">Warning</AlertTitle>
                          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                            {item.message}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {tipCount > 0 && (
                <AccordionItem value="tips" className="border-blue-100 dark:border-blue-800">
                  <AccordionTrigger className="text-blue-500 font-medium">
                    Optimization Tips
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {analysis.filter(item => item.type === "tip").map((item, i) => (
                        <Alert key={i} className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <AlertTitle className="text-blue-800 dark:text-blue-400">Tip</AlertTitle>
                          <AlertDescription className="text-blue-700 dark:text-blue-400">
                            {item.message}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    );
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const getContentScore = (platformId: string, text: string) => {
    if (!PLATFORMS_CONFIG[platformId]) return 0;
    
    const platform = PLATFORMS_CONFIG[platformId];
    let score = 0;
    
    // Length scoring (optimal vs too long or too short)
    const idealLength = platform.slug === "twitter" ? 220 : 
                        platform.slug === "instagram" ? 1200 :
                        platform.slug === "linkedin" ? 1500 :
                        platform.slug === "tiktok" ? 150 :
                        platform.slug === "pinterest" ? 300 :
                        platform.limits.textLength / 3;
                        
    // Calculate score based on optimal length
    const lengthRatio = Math.min(text.length / idealLength, 1.5);
    score += Math.max(0, 30 - (Math.abs(1 - lengthRatio) * 30));
    
    // Hashtag scoring with platform-specific ideal counts
    const hashtagMatches = text.match(/#[\w]+/g);
    const hashtagCount = hashtagMatches ? hashtagMatches.length : 0;
    const idealHashtags = platform.slug === "instagram" ? 8 : 
                         platform.slug === "twitter" ? 2 : 
                         platform.slug === "linkedin" ? 3 :
                         platform.slug === "tiktok" ? 5 :
                         platform.slug === "pinterest" ? 3 : 
                         platform.slug === "youtube" ? 4 : 3;
    
    score += Math.max(0, 20 - (Math.abs(hashtagCount - idealHashtags) * 4));
    
    // Emoji scoring (simplified emoji check to avoid flag compatibility issues)
    const hasEmojis = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/.test(text);
    
    // Platform-specific emoji scoring
    if (platform.slug === "instagram" || platform.slug === "tiktok") {
      score += hasEmojis ? 10 : 0;
    } else if (platform.slug === "linkedin") {
      score += hasEmojis ? 5 : 0; // LinkedIn is more professional, so emoji impact is lower
    } else {
      score += hasEmojis ? 8 : 0;
    }
    
    // Features scoring
    if (platform.features.links && text.includes("http")) score += 5;
    if (platform.features.mentions && text.includes("@")) score += 5;
    
    // Engagement elements
    const hasQuestion = text.includes("?");
    if (hasQuestion) score += 15; // Questions boost engagement significantly
    
    const hasCTA = /comment|share|like|follow|subscribe|save|check out|try|click|visit|read more/i.test(text);
    if (hasCTA) score += 10; // Call to actions improve conversion
    
    // Readability scoring
    const hasMultipleParagraphs = text.includes("\n\n");
    if (text.length > 100 && hasMultipleParagraphs) score += 10;
    
    // Platform-specific checks
    switch (platform.slug) {
      case "youtube":
        if (text.includes("timestamps") || text.includes(":")) score += 5;
        if (text.includes("subscribe")) score += 5;
        break;
      case "instagram":
        // Instagram posts with 5-10 hashtags perform better
        if (hashtagCount >= 5 && hashtagCount <= 10) score += 10;
        break;
      case "twitter":
        // Twitter posts with 1-2 hashtags perform better
        if (hashtagCount >= 1 && hashtagCount <= 2) score += 10;
        // Shorter tweets (under 240 chars) often get more engagement
        if (text.length <= 240) score += 5;
        break;
      case "linkedin":
        // LinkedIn posts with professional language
        if (/professional|business|industry|career|network|leadership/i.test(text)) score += 5;
        break;
      case "facebook":
        // Facebook posts with questions and personal tone
        if (hasQuestion && text.length < 400) score += 5;
        break;
      case "tiktok":
        // TikTok posts with trending hashtags
        if (text.includes("#fyp") || text.includes("#foryoupage")) score += 10;
        break;
    }
    
    // Penalize content issues
    if (text.length < 40) score -= 15; // Too short
    if (platform.slug !== "instagram" && hashtagCount > 10) score -= 10; // Too many hashtags
    
    // Analyze repetition and keyword stuffing
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const repetitionRatio = uniqueWords.size / words.length;
    
    if (repetitionRatio < 0.6 && words.length > 20) {
      score -= 10; // Penalize excessive repetition
    }
    
    // Check for excessive capitalization (yelling)
    const capsLetters = text.match(/[A-Z]/g)?.length || 0;
    const capsRatio = capsLetters / text.length;
    
    if (capsRatio > 0.3 && text.length > 15) {
      score -= 10; // Penalize excessive caps
    }
    
    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, Math.round(score)));
  };
  
  // Advanced content analysis function
  const getContentAnalysis = (platformId: string, text: string) => {
    if (!PLATFORMS_CONFIG[platformId]) return [];
    
    const platform = PLATFORMS_CONFIG[platformId];
    const analysis = [];
    
    // Check text length
    if (text.length > platform.limits.textLength) {
      analysis.push({
        type: "error",
        message: `Content exceeds ${platform.name}'s ${platform.limits.textLength} character limit by ${text.length - platform.limits.textLength} characters`
      });
    } else if (text.length < 40) {
      analysis.push({
        type: "warning",
        message: "Content is very short. Consider adding more details for better engagement"
      });
    }
    
    // Check hashtag usage
    const hashtagMatches = text.match(/#[\w]+/g) || [];
    const idealHashtags = platform.slug === "instagram" ? "5-10" : 
                         platform.slug === "twitter" ? "1-2" : 
                         platform.slug === "linkedin" ? "3-5" :
                         platform.slug === "tiktok" ? "4-6" : "2-5";
                         
    if (hashtagMatches.length === 0 && platform.features.hashtags) {
      analysis.push({
        type: "tip",
        message: `Consider adding ${idealHashtags} relevant hashtags to increase discoverability`
      });
    } else if (hashtagMatches.length > 0 && platform.slug === "instagram" && hashtagMatches.length < 5) {
      analysis.push({
        type: "tip",
        message: `Instagram posts perform better with ${idealHashtags} hashtags for optimal reach`
      });
    } else if (hashtagMatches.length > 10 && platform.slug !== "instagram") {
      analysis.push({
        type: "warning",
        message: `Too many hashtags. For ${platform.name}, limit to ${idealHashtags} for best results`
      });
    }
    
    // Check for emojis (using simplified regex check)
    const hasEmojis = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/.test(text);
    if (!hasEmojis && (platform.slug === "instagram" || platform.slug === "tiktok" || platform.slug === "facebook")) {
      analysis.push({
        type: "tip",
        message: `Adding relevant emojis can increase engagement on ${platform.name}`
      });
    }
    
    // Check engagement elements
    const hasQuestion = text.includes("?");
    if (!hasQuestion && text.length > 80) {
      analysis.push({
        type: "tip",
        message: "Adding a question can significantly increase comment engagement"
      });
    }
    
    const hasCTA = /comment|share|like|follow|subscribe|save|click|visit|check out/i.test(text);
    if (!hasCTA && text.length > 100) {
      analysis.push({
        type: "tip",
        message: "Include a clear call-to-action to improve audience interaction"
      });
    }
    
    // Check readability
    const hasMultipleParagraphs = text.includes("\n\n");
    if (!hasMultipleParagraphs && text.length > 150) {
      analysis.push({
        type: "tip",
        message: "Breaking text into paragraphs improves readability"
      });
    }
    
    // Platform-specific analysis
    switch (platform.slug) {
      case "youtube":
        if (!text.includes("timestamps") && !text.includes(":") && text.length > 100) {
          analysis.push({
            type: "tip",
            message: "YouTube descriptions perform better with timestamps (e.g., 0:00 Introduction)"
          });
        }
        if (!text.includes("subscribe") && text.length > 120) {
          analysis.push({
            type: "tip",
            message: "Remember to add a subscribe reminder in your description"
          });
        }
        break;
        
      case "linkedin":
        if (!/professional|industry|business|career|insights/i.test(text) && text.length > 100) {
          analysis.push({
            type: "tip",
            message: "LinkedIn content performs better with professional terminology and insights"
          });
        }
        break;
        
      case "tiktok":
        if (!text.includes("#fyp") && !text.includes("#foryoupage")) {
          analysis.push({
            type: "tip",
            message: "Consider adding #fyp or #foryoupage to improve discoverability"
          });
        }
        if (text.length > 150) {
          analysis.push({
            type: "warning",
            message: "TikTok captions perform best when kept short (under 150 characters)"
          });
        }
        break;
        
      case "pinterest":
        if (!text.includes("DIY") && !text.includes("how to") && !text.includes("ideas") && 
            !text.includes("tips") && !text.includes("tutorial") && text.length > 80) {
          analysis.push({
            type: "tip",
            message: "Pinterest descriptions perform better with keywords like 'DIY', 'how to', 'ideas', 'tips'"
          });
        }
        break;
    }
    
    return analysis;
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
                  
                  {/* Display the content analysis results when showAnalysis is true */}
                  {showAnalysis && analyzedPlatform === platform && (
                    <ContentAnalyzer 
                      analysis={analysisResults} 
                      onClose={() => setShowAnalysis(false)} 
                      platformName={platformConfig.name} 
                    />
                  )}
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