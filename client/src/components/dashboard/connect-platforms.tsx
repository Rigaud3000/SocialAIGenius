import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaPinterest, FaTiktok, FaDiscord } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

export default function ConnectPlatforms() {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);

  // Query to get all platforms
  const { data: platforms } = useQuery({
    queryKey: ["/api/platforms"],
  });

  // Query to get connected accounts
  const { data: accounts } = useQuery({
    queryKey: ["/api/accounts"],
  });

  // Connect new account mutation
  const connectAccountMutation = useMutation({
    mutationFn: async (platformId: number) => {
      const response = await apiRequest("POST", "/api/accounts", {
        platformId,
        accountName: "YourBrand",
        accountId: "yourbrand",
        userId: 1,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Account connected",
        description: "Your social account has been connected successfully",
      });
      setConnecting(null);
    },
    onError: () => {
      toast({
        title: "Connection failed",
        description: "Failed to connect account. Please try again.",
        variant: "destructive",
      });
      setConnecting(null);
    },
  });

  // Get platform icon based on slug
  const getPlatformIcon = (slug: string) => {
    switch (slug) {
      case 'facebook':
        return <FaFacebook className="h-6 w-6 text-blue-500 mr-2" />;
      case 'instagram':
        return <FaInstagram className="h-6 w-6 text-pink-500 mr-2" />;
      case 'twitter':
        return <FaTwitter className="h-6 w-6 text-blue-400 mr-2" />;
      case 'linkedin':
        return <FaLinkedin className="h-6 w-6 text-blue-700 mr-2" />;
      case 'youtube':
        return <FaYoutube className="h-6 w-6 text-red-600 mr-2" />;
      case 'pinterest':
        return <FaPinterest className="h-6 w-6 text-red-500 mr-2" />;
      case 'tiktok':
        return <FaTiktok className="h-6 w-6 text-black dark:text-white mr-2" />;
      case 'discord':
        return <FaDiscord className="h-6 w-6 text-indigo-600 mr-2" />;
      default:
        return null;
    }
  };

  // Filter platforms that aren't connected yet
  const getAvailablePlatforms = () => {
    if (!platforms || !accounts) return [];
    
    // Get IDs of connected platforms
    const connectedIds = accounts.map((account: any) => account.platformId);
    
    // Filter platforms that aren't connected
    return platforms
      .filter((platform: any) => !connectedIds.includes(platform.id))
      .slice(0, 4); // Limit to 4 for display
  };

  const handleConnect = (platformId: number, slug: string) => {
    setConnecting(slug);
    connectAccountMutation.mutate(platformId);
  };

  const availablePlatforms = getAvailablePlatforms();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect New Account</CardTitle>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add more social media platforms</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {availablePlatforms.map((platform: any) => (
            <Button
              key={platform.id}
              variant="outline"
              className="p-3 h-auto flex items-center justify-center border-2 border-dashed"
              disabled={connecting === platform.slug}
              onClick={() => handleConnect(platform.id, platform.slug)}
            >
              {getPlatformIcon(platform.slug)}
              {connecting === platform.slug ? 'Connecting...' : platform.name}
            </Button>
          ))}
          
          {availablePlatforms.length === 0 && (
            <div className="col-span-2 text-center text-sm text-gray-500 dark:text-gray-400 py-2">
              All platforms are connected
            </div>
          )}
        </div>
        {platforms && platforms.length > 4 && (
          <div className="mt-4 text-center">
            <Button variant="link" className="text-sm text-primary font-medium hover:text-primary/90">
              View more platforms
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
