import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, Loader2, ExternalLink, Plus, Trash2, RefreshCw } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaTiktok, FaPinterest, FaDiscord, FaTelegram } from "react-icons/fa";
import { SiThreads } from "react-icons/si";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PLATFORM_MAP = {
  facebook: {
    name: "Facebook",
    icon: <FaFacebook className="h-5 w-5 text-blue-600" />,
    color: "bg-blue-600",
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    scopes: ["pages_manage_posts", "pages_read_engagement", "public_profile", "instagram_basic"],
  },
  instagram: {
    name: "Instagram",
    icon: <FaInstagram className="h-5 w-5 text-pink-500" />,
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    authUrl: "https://api.instagram.com/oauth/authorize",
    scopes: ["user_profile", "user_media"],
  },
  twitter: {
    name: "Twitter",
    icon: <FaTwitter className="h-5 w-5 text-blue-400" />,
    color: "bg-blue-400",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    scopes: ["tweet.read", "tweet.write", "users.read"],
  },
  linkedin: {
    name: "LinkedIn",
    icon: <FaLinkedin className="h-5 w-5 text-blue-700" />,
    color: "bg-blue-700",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    scopes: ["r_liteprofile", "r_emailaddress", "w_member_social"],
  },
  youtube: {
    name: "YouTube",
    icon: <FaYoutube className="h-5 w-5 text-red-600" />,
    color: "bg-red-600",
    authUrl: "https://accounts.google.com/o/oauth2/auth",
    scopes: ["https://www.googleapis.com/auth/youtube", "https://www.googleapis.com/auth/youtube.upload"],
  },
  tiktok: {
    name: "TikTok",
    icon: <FaTiktok className="h-5 w-5" />,
    color: "bg-black",
    authUrl: "https://www.tiktok.com/auth/authorize/",
    scopes: ["user.info.basic", "video.publish"],
  },
  pinterest: {
    name: "Pinterest",
    icon: <FaPinterest className="h-5 w-5 text-red-500" />,
    color: "bg-red-500",
    authUrl: "https://www.pinterest.com/oauth/",
    scopes: ["boards:read", "pins:read", "pins:write"],
  },
  threads: {
    name: "Threads",
    icon: <SiThreads className="h-5 w-5" />,
    color: "bg-black",
    authUrl: "https://www.threads.net/login", // Note: Threads doesn't have public API yet
    scopes: [],
  },
  discord: {
    name: "Discord",
    icon: <FaDiscord className="h-5 w-5 text-indigo-500" />,
    color: "bg-indigo-500",
    authUrl: "https://discord.com/api/oauth2/authorize",
    scopes: ["identify", "guilds", "webhook.incoming"],
  },
  telegram: {
    name: "Telegram",
    icon: <FaTelegram className="h-5 w-5 text-blue-500" />,
    color: "bg-blue-500",
    authUrl: "https://oauth.telegram.org/auth",
    scopes: [],
  },
};

export default function ConnectAccounts() {
  const { toast } = useToast();
  const [connectDialog, setConnectDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [accountName, setAccountName] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [advancedMode, setAdvancedMode] = useState(false);
  const [refreshing, setRefreshing] = useState<number | null>(null);

  // Get all platforms
  const { data: platforms } = useQuery({
    queryKey: ["/api/platforms"],
  });

  // Get user's connected accounts
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/accounts"],
  });

  // Connect account mutation
  const connectAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/accounts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      setConnectDialog(false);
      setSelectedPlatform("");
      setAccountName("");
      setAccessToken("");
      toast({
        title: "Account connected",
        description: "Your social media account has been connected successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to connect",
        description: "There was an error connecting your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Disconnect account mutation
  const disconnectAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/accounts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Account disconnected",
        description: "Your social media account has been disconnected",
      });
    },
    onError: () => {
      toast({
        title: "Failed to disconnect",
        description: "There was an error disconnecting your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Refresh account stats mutation
  const refreshAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/accounts/${id}/refresh`);
      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      setRefreshing(null);
      toast({
        title: "Account refreshed",
        description: "Your account statistics have been updated",
      });
    },
    onError: () => {
      setRefreshing(null);
      toast({
        title: "Failed to refresh",
        description: "There was an error refreshing your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle connecting an account
  const handleConnect = () => {
    if (!selectedPlatform) {
      toast({
        title: "Platform required",
        description: "Please select a platform to connect",
        variant: "destructive",
      });
      return;
    }

    if (!accountName) {
      toast({
        title: "Account name required",
        description: "Please enter your account name",
        variant: "destructive",
      });
      return;
    }

    // In advanced mode, also validate access token
    if (advancedMode && !accessToken) {
      toast({
        title: "Access token required",
        description: "Please enter your access token",
        variant: "destructive",
      });
      return;
    }

    // Find platform ID
    const platform = platforms?.find((p: any) => p.slug === selectedPlatform);
    
    if (!platform) {
      toast({
        title: "Invalid platform",
        description: "The selected platform is not available",
        variant: "destructive",
      });
      return;
    }

    // Connect the account
    connectAccountMutation.mutate({
      userId: 1, // For demo
      platformId: platform.id,
      accountName,
      accessToken: advancedMode ? accessToken : undefined,
      connected: true,
    });
  };

  // Handle disconnecting an account
  const handleDisconnect = (id: number) => {
    disconnectAccountMutation.mutate(id);
  };

  // Handle refreshing account stats
  const handleRefresh = (id: number) => {
    setRefreshing(id);
    refreshAccountMutation.mutate(id);
  };

  // Handle OAuth authorization
  const handleOAuthAuthorize = (platform: string) => {
    if (!PLATFORM_MAP[platform as keyof typeof PLATFORM_MAP]) return;
    
    const { authUrl, scopes } = PLATFORM_MAP[platform as keyof typeof PLATFORM_MAP];
    
    // In a real implementation, you would:
    // 1. Generate a state parameter for CSRF protection
    // 2. Store the state in localStorage or sessionStorage
    // 3. Redirect to the OAuth URL with proper parameters
    
    // For this demo, we'll just show a success toast and manually open the dialog
    toast({
      title: "OAuth Authorization",
      description: `In a production app, you would be redirected to ${platform}'s authorization page.`,
    });
    
    setSelectedPlatform(platform);
    setConnectDialog(true);
  };

  // Group accounts by platform
  const groupedAccounts = accounts?.reduce((acc: any, account: any) => {
    const platform = account.platform?.slug || "other";
    if (!acc[platform]) acc[platform] = [];
    acc[platform].push(account);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Accounts</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Connect your social media accounts to manage them all in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(PLATFORM_MAP).map(([key, platform]) => {
            const connected = groupedAccounts?.[key]?.length > 0;
            const connectedAccounts = groupedAccounts?.[key] || [];
            
            return (
              <Card key={key} className={connected ? "border-green-200 dark:border-green-900" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {platform.icon}
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                    </div>
                    {connected ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {connected
                      ? `${connectedAccounts.length} account${connectedAccounts.length > 1 ? "s" : ""} connected`
                      : `Connect your ${platform.name} account to post and analyze content`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {connected ? (
                    <div className="space-y-3">
                      {connectedAccounts.map((account: any) => (
                        <div key={account.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full bg-green-500`}></div>
                              <span className="font-medium">{account.accountName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                disabled={refreshing === account.id}
                                onClick={() => handleRefresh(account.id)}
                              >
                                {refreshing === account.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDisconnect(account.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          {account.stats && (
                            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <div>
                                <div className="font-medium">Followers</div>
                                <div>{account.stats.followers.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="font-medium">Engagement</div>
                                <div>{account.stats.engagement}</div>
                              </div>
                              <div>
                                <div className="font-medium">Posts</div>
                                <div>{account.stats.posts.toLocaleString()}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Share, schedule, and analyze your {platform.name} content
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {!connected ? (
                    <Button 
                      className={`w-full text-white ${platform.color}`}
                      onClick={() => handleOAuthAuthorize(key)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Connect {platform.name}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => handleOAuthAuthorize(key)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Account
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Connect Account Dialog */}
        <Dialog open={connectDialog} onOpenChange={setConnectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect {selectedPlatform ? PLATFORM_MAP[selectedPlatform as keyof typeof PLATFORM_MAP]?.name : ""} Account</DialogTitle>
              <DialogDescription>
                Enter your account details to connect your {selectedPlatform} account.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  placeholder="Enter your account name or handle"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="advanced-mode"
                    checked={advancedMode}
                    onCheckedChange={setAdvancedMode}
                  />
                  <Label htmlFor="advanced-mode">Advanced Mode</Label>
                </div>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Documentation",
                      description: "In a production app, this would link to API docs",
                    });
                  }}
                  className="text-xs text-blue-500 hover:underline"
                >
                  How to get an access token?
                </a>
              </div>
              
              {advancedMode && (
                <div className="space-y-2">
                  <Label htmlFor="access-token">Access Token</Label>
                  <Input
                    id="access-token"
                    type="password"
                    placeholder="Enter your API access token"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Manually enter your access token if you already have one
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setConnectDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConnect}
                disabled={connectAccountMutation.isPending}
              >
                {connectAccountMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Connect Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}