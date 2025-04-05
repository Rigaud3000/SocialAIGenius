import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, Trophy, Zap, Star, AlertTriangle, LineChart, Lightbulb, Lock } from "lucide-react";
import { SiHootsuite, SiBuffer, SiSpring, SiLinkedin, SiSocialblade } from "react-icons/si";

// Types for competitor feature comparison
interface Competitor {
  name: string;
  icon: React.ReactNode;
  features: {
    [key: string]: {
      supported: boolean;
      quality?: "basic" | "average" | "good" | "excellent";
      notes?: string;
    };
  };
  pricing: {
    starter: number;
    professional: number;
    enterprise: number;
  };
  platforms: string[];
  strengths: string[];
  weaknesses: string[];
}

// Types for feature categories
interface FeatureCategory {
  id: string;
  name: string;
  description: string;
  features: {
    id: string;
    name: string;
    description: string;
    isAdvanced: boolean;
  }[];
}

// Define competitors
const competitors: Competitor[] = [
  {
    name: "Hootsuite",
    icon: <SiHootsuite className="text-[#143059] w-6 h-6" />,
    features: {
      scheduling: { supported: true, quality: "good" },
      analytics: { supported: true, quality: "average" },
      aiContent: { supported: true, quality: "basic", notes: "Very limited AI capabilities" },
      teamCollaboration: { supported: true, quality: "good" },
      viralPrediction: { supported: false },
      platformOptimization: { supported: true, quality: "basic" },
      dmManagement: { supported: true, quality: "average" },
      web3Support: { supported: false },
      contentRecycling: { supported: true, quality: "basic" },
      competitorIntelligence: { supported: true, quality: "basic" },
    },
    pricing: {
      starter: 99,
      professional: 249,
      enterprise: 739,
    },
    platforms: ["Facebook", "Instagram", "Twitter", "LinkedIn", "YouTube", "Pinterest"],
    strengths: [
      "Well-established with large customer base",
      "Good team collaboration features",
      "Reliable scheduling system"
    ],
    weaknesses: [
      "Limited AI capabilities",
      "Expensive pricing tiers",
      "Outdated user interface",
      "No viral prediction",
      "Limited platform-specific optimization"
    ]
  },
  {
    name: "Buffer",
    icon: <SiBuffer className="text-[#2C4BFF] w-6 h-6" />,
    features: {
      scheduling: { supported: true, quality: "good" },
      analytics: { supported: true, quality: "basic" },
      aiContent: { supported: true, quality: "basic" },
      teamCollaboration: { supported: true, quality: "average" },
      viralPrediction: { supported: false },
      platformOptimization: { supported: false },
      dmManagement: { supported: false },
      web3Support: { supported: false },
      contentRecycling: { supported: false },
      competitorIntelligence: { supported: false },
    },
    pricing: {
      starter: 15,
      professional: 99,
      enterprise: 199,
    },
    platforms: ["Facebook", "Instagram", "Twitter", "LinkedIn", "Pinterest"],
    strengths: [
      "User-friendly interface",
      "Affordable pricing",
      "Good mobile app"
    ],
    weaknesses: [
      "Very limited analytics",
      "No AI content generation",
      "No cross-platform optimization",
      "Limited feature set overall",
      "No direct messaging support"
    ]
  },
  {
    name: "Sprout Social",
    icon: <SiSpring className="text-[#75DD66] w-6 h-6" />,
    features: {
      scheduling: { supported: true, quality: "excellent" },
      analytics: { supported: true, quality: "good" },
      aiContent: { supported: true, quality: "average" },
      teamCollaboration: { supported: true, quality: "excellent" },
      viralPrediction: { supported: false },
      platformOptimization: { supported: true, quality: "average" },
      dmManagement: { supported: true, quality: "good" },
      web3Support: { supported: false },
      contentRecycling: { supported: true, quality: "average" },
      competitorIntelligence: { supported: true, quality: "average" },
    },
    pricing: {
      starter: 249,
      professional: 399,
      enterprise: 599,
    },
    platforms: ["Facebook", "Instagram", "Twitter", "LinkedIn", "YouTube", "Pinterest", "TikTok"],
    strengths: [
      "Comprehensive analytics",
      "Strong CRM functionality",
      "Excellent team workflows",
      "Good reporting capabilities"
    ],
    weaknesses: [
      "Very expensive pricing",
      "Complex interface for beginners",
      "Limited AI capabilities",
      "No automated content optimization",
      "No viral prediction features"
    ]
  },
  {
    name: "Later",
    icon: <SiLinkedin className="text-[#F59502] w-6 h-6" />,
    features: {
      scheduling: { supported: true, quality: "good" },
      analytics: { supported: true, quality: "basic" },
      aiContent: { supported: false },
      teamCollaboration: { supported: true, quality: "basic" },
      viralPrediction: { supported: false },
      platformOptimization: { supported: true, quality: "basic", notes: "Instagram-focused only" },
      dmManagement: { supported: false },
      web3Support: { supported: false },
      contentRecycling: { supported: false },
      competitorIntelligence: { supported: false },
    },
    pricing: {
      starter: 18,
      professional: 40,
      enterprise: 80,
    },
    platforms: ["Instagram", "Facebook", "Twitter", "Pinterest", "TikTok"],
    strengths: [
      "Great visual planning tools",
      "Instagram-focused features",
      "Link in bio functionality",
      "Affordable pricing"
    ],
    weaknesses: [
      "Very limited platform support",
      "Basic analytics only",
      "No AI capabilities",
      "Limited automation features",
      "No direct messaging management"
    ]
  },
  {
    name: "SocialPilot",
    icon: <SiSocialblade className="text-[#EE3D57] w-6 h-6" />,
    features: {
      scheduling: { supported: true, quality: "good" },
      analytics: { supported: true, quality: "average" },
      aiContent: { supported: false },
      teamCollaboration: { supported: true, quality: "average" },
      viralPrediction: { supported: false },
      platformOptimization: { supported: false },
      dmManagement: { supported: false },
      web3Support: { supported: false },
      contentRecycling: { supported: true, quality: "basic" },
      competitorIntelligence: { supported: false },
    },
    pricing: {
      starter: 30,
      professional: 50,
      enterprise: 100,
    },
    platforms: ["Facebook", "Instagram", "Twitter", "LinkedIn", "Pinterest"],
    strengths: [
      "Very affordable pricing",
      "White-label reporting",
      "Good scheduling features",
      "Bulk scheduling capabilities"
    ],
    weaknesses: [
      "No AI capabilities",
      "Basic analytics only",
      "No viral prediction",
      "No platform-specific optimization",
      "Limited integration options"
    ]
  },
  {
    name: "Our Platform",
    icon: <Trophy className="text-yellow-500 w-6 h-6" />,
    features: {
      scheduling: { supported: true, quality: "excellent" },
      analytics: { supported: true, quality: "excellent" },
      aiContent: { supported: true, quality: "excellent" },
      teamCollaboration: { supported: true, quality: "excellent" },
      viralPrediction: { supported: true, quality: "excellent" },
      platformOptimization: { supported: true, quality: "excellent" },
      dmManagement: { supported: true, quality: "excellent" },
      web3Support: { supported: true, quality: "excellent" },
      contentRecycling: { supported: true, quality: "excellent" },
      competitorIntelligence: { supported: true, quality: "excellent" },
    },
    pricing: {
      starter: 49,
      professional: 149,
      enterprise: 399,
    },
    platforms: [
      "Facebook", "Instagram", "Twitter", "LinkedIn", "YouTube", 
      "Pinterest", "TikTok", "Discord", "Telegram", "Web3/Metaverse"
    ],
    strengths: [
      "Cutting-edge AI content generation",
      "Viral trend prediction engine",
      "Platform-specific content optimization",
      "Self-healing API connections",
      "Web3 & metaverse integration",
      "Comprehensive analytics suite",
      "Cross-platform DM management with AI"
    ],
    weaknesses: [
      "New platform (less established)"
    ]
  }
];

// Define feature categories
const featureCategories: FeatureCategory[] = [
  {
    id: "ai-content",
    name: "AI Content Creation",
    description: "Generate, optimize, and enhance content using artificial intelligence",
    features: [
      {
        id: "multi-modal-ai",
        name: "Multi-modal AI Generation",
        description: "Generate text, images, and video content using advanced AI models",
        isAdvanced: true
      },
      {
        id: "platform-optimization",
        name: "Platform-specific Optimization",
        description: "Automatically adapt content for each platform's unique requirements",
        isAdvanced: true
      },
      {
        id: "ai-editing",
        name: "AI-powered Editing Suggestions",
        description: "Smart recommendations to improve engagement for each platform",
        isAdvanced: true
      },
      {
        id: "voice-customization",
        name: "Voice and Tone Customization",
        description: "Train AI on brand voice for consistent messaging",
        isAdvanced: true
      }
    ]
  },
  {
    id: "predictive-analytics",
    name: "Predictive Analytics",
    description: "Forecast trends, engagement, and optimal posting strategies",
    features: [
      {
        id: "viral-prediction",
        name: "Viral Trend Prediction Engine",
        description: "Identify trending topics before they peak using AI analysis",
        isAdvanced: true
      },
      {
        id: "optimal-timing",
        name: "Optimal Posting Time Prediction",
        description: "AI-determined best times to post based on audience activity",
        isAdvanced: true
      },
      {
        id: "engagement-forecast",
        name: "Engagement Forecasting",
        description: "Predict content performance before posting",
        isAdvanced: true
      },
      {
        id: "content-simulation",
        name: "Content Performance Simulation",
        description: "Test content variations with AI before posting",
        isAdvanced: true
      }
    ]
  },
  {
    id: "advanced-automation",
    name: "Advanced Automation",
    description: "Streamline workflows with intelligent automation",
    features: [
      {
        id: "self-healing",
        name: "Self-healing API Connections",
        description: "Automatically recover from API failures",
        isAdvanced: true
      },
      {
        id: "dm-management",
        name: "Cross-platform DM Management",
        description: "Manage messages across platforms with AI-suggested replies",
        isAdvanced: true
      },
      {
        id: "ab-testing",
        name: "Automated A/B Testing",
        description: "Test different content variations automatically",
        isAdvanced: true
      },
      {
        id: "content-recycling",
        name: "Smart Content Recycling",
        description: "Repurpose top-performing content with AI-generated variations",
        isAdvanced: true
      }
    ]
  },
  {
    id: "analytics-reporting",
    name: "Analytics & Reporting",
    description: "Gain deep insights into performance and audience",
    features: [
      {
        id: "real-time-analytics",
        name: "Real-time Engagement Analytics",
        description: "Live performance metrics across all platforms",
        isAdvanced: true
      },
      {
        id: "competitor-intelligence",
        name: "Competitor Intelligence",
        description: "Track competitors' performance and content strategies",
        isAdvanced: true
      },
      {
        id: "roi-calculation",
        name: "ROI Calculation",
        description: "Direct business impact metrics tied to social activities",
        isAdvanced: true
      },
      {
        id: "audience-modeling",
        name: "Predictive Audience Growth Modeling",
        description: "AI forecast of audience growth based on activity",
        isAdvanced: true
      }
    ]
  },
  {
    id: "next-gen-platforms",
    name: "Next-Gen Platform Support",
    description: "Support for emerging platforms and technologies",
    features: [
      {
        id: "web3-integration",
        name: "Web3 & Metaverse Integration",
        description: "Support for NFT platforms and decentralized social networks",
        isAdvanced: true
      },
      {
        id: "early-adoption",
        name: "Emerging Platform Early Adoption",
        description: "Quick integration of new platforms before competitors",
        isAdvanced: true
      },
      {
        id: "universal-adapters",
        name: "Universal API Adapters",
        description: "Connect to any platform with our universal adapter system",
        isAdvanced: true
      },
      {
        id: "future-proof",
        name: "Future-proof Architecture",
        description: "Designed to adapt to evolving social media landscape",
        isAdvanced: true
      }
    ]
  },
  {
    id: "enterprise-collaboration",
    name: "Enterprise-Grade Collaboration",
    description: "Powerful tools for team coordination and workflow",
    features: [
      {
        id: "team-workflows",
        name: "Advanced Team Workflows",
        description: "Custom approval processes with role-based permissions",
        isAdvanced: true
      },
      {
        id: "ai-suggestions",
        name: "AI-powered Team Suggestions",
        description: "Smart content recommendations based on team expertise",
        isAdvanced: true
      },
      {
        id: "real-time-collab",
        name: "Real-time Collaboration",
        description: "Simultaneous editing with instant feedback",
        isAdvanced: true
      },
      {
        id: "performance-insights",
        name: "Team Performance Insights",
        description: "Analytics on team productivity and content quality",
        isAdvanced: true
      }
    ]
  }
];

// Get quality score as a number for sorting
const getQualityScore = (quality?: "basic" | "average" | "good" | "excellent") => {
  switch (quality) {
    case "excellent": return 4;
    case "good": return 3;
    case "average": return 2;
    case "basic": return 1;
    default: return 0;
  }
};

// Render quality badge with appropriate color
const QualityBadge = ({ quality }: { quality?: "basic" | "average" | "good" | "excellent" }) => {
  if (!quality) return null;
  
  let color = "";
  switch (quality) {
    case "excellent":
      color = "bg-green-100 text-green-800 border-green-200";
      break;
    case "good":
      color = "bg-blue-100 text-blue-800 border-blue-200";
      break;
    case "average":
      color = "bg-yellow-100 text-yellow-800 border-yellow-200";
      break;
    case "basic":
      color = "bg-orange-100 text-orange-800 border-orange-200";
      break;
  }
  
  return (
    <Badge variant="outline" className={`${color} ml-2`}>
      {quality}
    </Badge>
  );
};

export default function CompetitiveAnalysis() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Competitive Analysis</h2>
        <p className="text-muted-foreground mt-2">
          See how our platform compares to the top competitors in the market
        </p>
      </div>

      <Tabs defaultValue="feature-comparison" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="feature-comparison">Feature Comparison</TabsTrigger>
          <TabsTrigger value="platform-coverage">Platform Coverage</TabsTrigger>
          <TabsTrigger value="pricing-analysis">Pricing Analysis</TabsTrigger>
          <TabsTrigger value="our-advantages">Our Advantages</TabsTrigger>
        </TabsList>
        
        {/* Feature Comparison Tab */}
        <TabsContent value="feature-comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="mr-2 h-5 w-5 text-primary" />
                Feature Comparison Matrix
              </CardTitle>
              <CardDescription>
                Compare key features across major social media management platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Feature</TableHead>
                      {competitors.map((competitor) => (
                        <TableHead key={competitor.name} className="text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="mb-1">{competitor.icon}</div>
                            <div className="text-sm font-medium">
                              {competitor.name}
                              {competitor.name === "Our Platform" && (
                                <Badge variant="default" className="ml-1 bg-amber-500 hover:bg-amber-600">
                                  Best
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Content Scheduling</TableCell>
                      {competitors.map((competitor) => (
                        <TableCell key={`${competitor.name}-scheduling`} className="text-center">
                          {competitor.features.scheduling?.supported ? (
                            <div className="flex justify-center items-center">
                              <Check className="h-5 w-5 text-green-500" />
                              <QualityBadge quality={competitor.features.scheduling.quality} />
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Analytics & Reporting</TableCell>
                      {competitors.map((competitor) => (
                        <TableCell key={`${competitor.name}-analytics`} className="text-center">
                          {competitor.features.analytics?.supported ? (
                            <div className="flex justify-center items-center">
                              <Check className="h-5 w-5 text-green-500" />
                              <QualityBadge quality={competitor.features.analytics.quality} />
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">AI Content Creation</TableCell>
                      {competitors.map((competitor) => (
                        <TableCell key={`${competitor.name}-aiContent`} className="text-center">
                          {competitor.features.aiContent?.supported ? (
                            <div className="flex justify-center items-center">
                              <Check className="h-5 w-5 text-green-500" />
                              <QualityBadge quality={competitor.features.aiContent.quality} />
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Team Collaboration</TableCell>
                      {competitors.map((competitor) => (
                        <TableCell key={`${competitor.name}-teamCollaboration`} className="text-center">
                          {competitor.features.teamCollaboration?.supported ? (
                            <div className="flex justify-center items-center">
                              <Check className="h-5 w-5 text-green-500" />
                              <QualityBadge quality={competitor.features.teamCollaboration.quality} />
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium flex items-center">
                        Viral Prediction
                        <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                          Advanced
                        </Badge>
                      </TableCell>
                      {competitors.map((competitor) => (
                        <TableCell key={`${competitor.name}-viralPrediction`} className="text-center">
                          {competitor.features.viralPrediction?.supported ? (
                            <div className="flex justify-center items-center">
                              <Check className="h-5 w-5 text-green-500" />
                              <QualityBadge quality={competitor.features.viralPrediction.quality} />
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium flex items-center">
                        Platform-specific Optimization
                        <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                          Advanced
                        </Badge>
                      </TableCell>
                      {competitors.map((competitor) => (
                        <TableCell key={`${competitor.name}-platformOptimization`} className="text-center">
                          {competitor.features.platformOptimization?.supported ? (
                            <div className="flex justify-center items-center">
                              <Check className="h-5 w-5 text-green-500" />
                              <QualityBadge quality={competitor.features.platformOptimization.quality} />
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium flex items-center">
                        DM Management with AI
                        <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                          Advanced
                        </Badge>
                      </TableCell>
                      {competitors.map((competitor) => (
                        <TableCell key={`${competitor.name}-dmManagement`} className="text-center">
                          {competitor.features.dmManagement?.supported ? (
                            <div className="flex justify-center items-center">
                              <Check className="h-5 w-5 text-green-500" />
                              <QualityBadge quality={competitor.features.dmManagement.quality} />
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium flex items-center">
                        Web3 & Metaverse Support
                        <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                          Advanced
                        </Badge>
                      </TableCell>
                      {competitors.map((competitor) => (
                        <TableCell key={`${competitor.name}-web3Support`} className="text-center">
                          {competitor.features.web3Support?.supported ? (
                            <div className="flex justify-center items-center">
                              <Check className="h-5 w-5 text-green-500" />
                              <QualityBadge quality={competitor.features.web3Support.quality} />
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Smart Content Recycling</TableCell>
                      {competitors.map((competitor) => (
                        <TableCell key={`${competitor.name}-contentRecycling`} className="text-center">
                          {competitor.features.contentRecycling?.supported ? (
                            <div className="flex justify-center items-center">
                              <Check className="h-5 w-5 text-green-500" />
                              <QualityBadge quality={competitor.features.contentRecycling.quality} />
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Competitor Intelligence</TableCell>
                      {competitors.map((competitor) => (
                        <TableCell key={`${competitor.name}-competitorIntelligence`} className="text-center">
                          {competitor.features.competitorIntelligence?.supported ? (
                            <div className="flex justify-center items-center">
                              <Check className="h-5 w-5 text-green-500" />
                              <QualityBadge quality={competitor.features.competitorIntelligence.quality} />
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Platform Coverage Tab */}
        <TabsContent value="platform-coverage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-primary" />
                Platform Coverage
              </CardTitle>
              <CardDescription>
                Compare social media platform support across competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Competitor</TableHead>
                      <TableHead>Supported Platforms</TableHead>
                      <TableHead className="text-right">Coverage Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...competitors].sort((a, b) => b.platforms.length - a.platforms.length).map((competitor) => (
                      <TableRow key={competitor.name}>
                        <TableCell className="font-medium flex items-center">
                          <span className="mr-2">{competitor.icon}</span>
                          {competitor.name}
                          {competitor.name === "Our Platform" && (
                            <Badge variant="default" className="ml-1 bg-amber-500 hover:bg-amber-600">
                              Best
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {competitor.platforms.map((platform) => (
                              <Badge 
                                key={`${competitor.name}-${platform}`} 
                                variant="outline"
                                className={platform.includes("Web3") ? "bg-purple-100 text-purple-800 border-purple-200" : ""}>
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <span className="mr-2 font-medium">
                              {Math.round((competitor.platforms.length / 10) * 100)}%
                            </span>
                            <Progress value={(competitor.platforms.length / 10) * 100} className="w-24" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pricing Analysis Tab */}
        <TabsContent value="pricing-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5 text-primary" />
                Pricing Comparison
              </CardTitle>
              <CardDescription>
                Compare monthly pricing across competitors (billed annually)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Competitor</TableHead>
                      <TableHead>Starter Plan</TableHead>
                      <TableHead>Professional Plan</TableHead>
                      <TableHead>Enterprise Plan</TableHead>
                      <TableHead className="text-right">Value Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...competitors].sort((a, b) => {
                      // Calculate average price per feature
                      const avgPriceA = a.pricing.professional / Object.values(a.features).filter(f => f.supported).length;
                      const avgPriceB = b.pricing.professional / Object.values(b.features).filter(f => f.supported).length;
                      return avgPriceA - avgPriceB;
                    }).map((competitor) => {
                      // Calculate value score (features divided by professional price, normalized)
                      const featureCount = Object.values(competitor.features).filter(f => f.supported).length;
                      const valueScore = (featureCount / competitor.pricing.professional) * 100;
                      const normalizedValue = Math.min(100, Math.round(valueScore * 3)); // Scale for better visualization
                      
                      return (
                        <TableRow key={competitor.name}>
                          <TableCell className="font-medium flex items-center">
                            <span className="mr-2">{competitor.icon}</span>
                            {competitor.name}
                            {competitor.name === "Our Platform" && (
                              <Badge variant="default" className="ml-1 bg-amber-500 hover:bg-amber-600">
                                Best Value
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            ${competitor.pricing.starter}/month
                          </TableCell>
                          <TableCell>
                            ${competitor.pricing.professional}/month
                          </TableCell>
                          <TableCell>
                            ${competitor.pricing.enterprise}/month
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <span className="mr-2 font-medium">{normalizedValue}%</span>
                              <Progress value={normalizedValue} className="w-24" />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Our Advantages Tab */}
        <TabsContent value="our-advantages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                Our Competitive Advantages
              </CardTitle>
              <CardDescription>
                Key features that make our platform the best in the world
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featureCategories.map((category) => (
                  <Card key={category.id} className="overflow-hidden border-t-4 border-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.features.map((feature) => (
                          <li key={feature.id} className="flex items-start">
                            <div className="mt-0.5 mr-2 text-green-500 flex-shrink-0">
                              <Check className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {feature.name}
                                {feature.isAdvanced && (
                                  <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                    Exclusive
                                  </Badge>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <h3 className="text-xl font-bold flex items-center mb-4">
                  <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                  Why We're Better Than Every Competitor
                </h3>
                <p className="text-muted-foreground mb-4">
                  Our platform has been built from the ground up with next-generation features that simply don't exist in other solutions. We've analyzed every competitor in the market to ensure our product exceeds them in every dimension.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3 text-green-500 flex-shrink-0">
                      <Zap className="h-5 w-5" />
                    </div>
                    <p><strong>Advanced AI Integration:</strong> Our platform uses cutting-edge multi-modal AI that generates text, images, and video content optimized for each platform's specific requirements.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3 text-green-500 flex-shrink-0">
                      <Zap className="h-5 w-5" />
                    </div>
                    <p><strong>Predictive Capabilities:</strong> Only our platform can predict viral trends before they happen, giving you a significant edge over competitors.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3 text-green-500 flex-shrink-0">
                      <Zap className="h-5 w-5" />
                    </div>
                    <p><strong>Future-Proof:</strong> We're the only platform with built-in support for Web3, NFTs, and metaverse platforms, ensuring you're ready for the next evolution of social media.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3 text-green-500 flex-shrink-0">
                      <Zap className="h-5 w-5" />
                    </div>
                    <p><strong>Superior Value:</strong> Our platform offers more features at a lower price point than any competitor, providing exceptional ROI for businesses of all sizes.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}