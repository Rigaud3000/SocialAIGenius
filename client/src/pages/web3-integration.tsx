import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Hash, Info, Leaf, Bitcoin, Wallet } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Import the smart contract interaction component
import SmartContractInteraction from "@/components/web3/smart-contract-interaction";

// Web3 platforms supported by our application
const web3Platforms = [
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    icon: <Hash className="h-5 w-5 text-purple-500" />,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'The original smart contract platform',
  },
  { 
    id: 'solana', 
    name: 'Solana', 
    icon: <Leaf className="h-5 w-5 text-green-500" />,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'High throughput blockchain for DeFi and NFTs',
  },
  { 
    id: 'bitcoin', 
    name: 'Bitcoin', 
    icon: <Bitcoin className="h-5 w-5 text-amber-500" />,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'The original cryptocurrency network',
  },
  { 
    id: 'metaverse', 
    name: 'Metaverse', 
    icon: <Wallet className="h-5 w-5 text-blue-500" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Virtual world platforms like Decentraland and The Sandbox',
  },
];

// Mock NFT collections for demonstration
const nftCollections = [
  {
    id: 1,
    name: 'Brand Ambassadors',
    platform: 'ethereum',
    items: 10000,
    floor: 0.5,
    volume: 120,
    holders: 4500,
  },
  {
    id: 2,
    name: 'Digital Wearables',
    platform: 'solana',
    items: 5000,
    floor: 12,
    volume: 450,
    holders: 2200,
  },
  {
    id: 3,
    name: 'Virtual Land',
    platform: 'metaverse',
    items: 1000,
    floor: 2.5,
    volume: 85,
    holders: 750,
  }
];

// Declare Ethereum provider for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Feature detection for wallet connectivity
const hasMetaMask = typeof window !== 'undefined' && window.ethereum !== undefined;

export default function Web3Integration() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['ethereum', 'metaverse']);
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');

  // Mock function to simulate connecting wallet
  const connectWallet = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Success toast
    toast({
      title: "Wallet Connected",
      description: "Successfully connected to your Web3 wallet.",
    });
    
    setWalletConnected(true);
    setLoading(false);
  };
  
  // Mock function to simulate disconnecting wallet
  const disconnectWallet = () => {
    setWalletConnected(false);
    toast({
      title: "Wallet Disconnected",
      description: "Your Web3 wallet has been disconnected.",
    });
  };

  // Mock function to post content to Web3 platforms
  const postToWeb3 = async () => {
    if (!postContent) {
      toast({
        title: "Error",
        description: "Please enter content to post",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Content Posted",
      description: `Successfully posted to ${selectedPlatforms.length} Web3 platforms.`,
    });
    
    setPostContent('');
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Web3 & Metaverse Integration</h2>
        <p className="text-muted-foreground mt-2">
          Connect your brand to Web3 platforms and the metaverse
        </p>
      </div>

      <Tabs defaultValue="dashboard" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="nft">NFT Collections</TabsTrigger>
          <TabsTrigger value="post">Post Content</TabsTrigger>
          <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {web3Platforms.map((platform) => (
              <Card key={platform.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {platform.icon}
                      <CardTitle className="text-md">{platform.name}</CardTitle>
                    </div>
                    <Switch 
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPlatforms([...selectedPlatforms, platform.id]);
                        } else {
                          setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                        }
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-500">{platform.description}</p>
                </CardContent>
                <div className={`h-2 w-full ${platform.color.split(' ')[0]}`}></div>
              </Card>
            ))}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="mr-2 h-5 w-5 text-primary" />
                  Web3 Wallet Connection
                </CardTitle>
                <CardDescription>
                  Connect your Web3 wallet to interact with blockchain platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                {walletConnected ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-md border border-green-200">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            Wallet successfully connected
                          </p>
                          <p className="mt-1 text-xs text-green-700">
                            0x1a2...3f4b
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={disconnectWallet}
                      className="w-full"
                    >
                      Disconnect Wallet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!hasMetaMask && (
                      <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
                        <Info className="h-4 w-4 mr-2" />
                        <AlertDescription>
                          No Web3 wallet detected. Install MetaMask or another Web3 wallet to enable full functionality.
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      onClick={connectWallet} 
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Connecting..." : "Connect Wallet"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hash className="mr-2 h-5 w-5 text-primary" />
                  Web3 Activity Overview
                </CardTitle>
                <CardDescription>
                  Summary of your brand's Web3 presence and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">NFT Collections</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">3 Active</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Holders</span>
                    <span className="font-semibold">7,450</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Trading Volume (30d)</span>
                    <span className="font-semibold">655 ETH</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Metaverse Events</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">2 Upcoming</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* NFT Collections Tab */}
        <TabsContent value="nft" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Hash className="mr-2 h-5 w-5 text-primary" />
                NFT Collections
              </CardTitle>
              <CardDescription>
                Manage your brand's NFT collections across Web3 platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {nftCollections.map((collection) => {
                    const platform = web3Platforms.find(p => p.id === collection.platform);
                    return (
                      <Card key={collection.id} className="overflow-hidden">
                        <div className={`h-2 w-full ${platform?.color.split(' ')[0]}`}></div>
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-md">{collection.name}</CardTitle>
                            {platform?.icon}
                          </div>
                          <Badge variant="outline" className={platform?.color || ''}>
                            {platform?.name}
                          </Badge>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Items:</span>
                              <span className="font-medium">{collection.items.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Floor Price:</span>
                              <span className="font-medium">{collection.floor} ETH</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Volume (30d):</span>
                              <span className="font-medium">{collection.volume} ETH</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Holders:</span>
                              <span className="font-medium">{collection.holders.toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 bg-gray-50">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              toast({
                                title: "Collection Selected",
                                description: `${collection.name} selected for posting`,
                              });
                              setSelectedCollection(collection.name);
                              setActiveTab('post');
                            }}
                          >
                            Post Update
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
                
                <Button variant="outline" className="w-full">
                  Create New NFT Collection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Post Content Tab */}
        <TabsContent value="post" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Hash className="mr-2 h-5 w-5 text-primary" />
                Post to Web3 & Metaverse
              </CardTitle>
              <CardDescription>
                Create and publish content to blockchain platforms and metaverse spaces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!walletConnected && (
                  <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
                    <Info className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      Connect your wallet first to post content to Web3 platforms.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label>Selected Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlatforms.map((platformId) => {
                      const platform = web3Platforms.find(p => p.id === platformId);
                      return platform ? (
                        <Badge key={platform.id} variant="outline" className={platform.color}>
                          <span className="flex items-center">
                            {platform.icon}
                            <span className="ml-1">{platform.name}</span>
                          </span>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>NFT Collection (Optional)</Label>
                  <Select
                    value={selectedCollection}
                    onValueChange={setSelectedCollection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a collection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {nftCollections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.name}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Content</Label>
                  <textarea
                    className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your Web3 announcement, NFT drop details, or metaverse event information..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Save as Draft</Button>
              <Button 
                onClick={postToWeb3} 
                disabled={!walletConnected || loading || !postContent}
              >
                {loading ? "Posting..." : "Post to Web3"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Smart Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          {!walletConnected && (
            <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
              <Info className="h-4 w-4 mr-2" />
              <AlertDescription>
                Connect your wallet first to deploy and interact with smart contracts.
              </AlertDescription>
            </Alert>
          )}
          
          <SmartContractInteraction />
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Hash className="mr-2 h-5 w-5 text-primary" />
                Web3 Analytics
              </CardTitle>
              <CardDescription>
                Track performance metrics for your Web3 and metaverse presence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
                  <Info className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    Analytics are only available for connected wallets. Connect your wallet to view complete data.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">NFT Engagement</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">82%</div>
                      <p className="text-xs text-green-500">↑ 12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Metaverse Visitors</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">5,280</div>
                      <p className="text-xs text-green-500">↑ 8% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Web3 Post Reach</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">12.5K</div>
                      <p className="text-xs text-green-500">↑ 24% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Token Holders</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">8,420</div>
                      <p className="text-xs text-green-500">↑ 5% from last month</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="pt-4">
                  <h3 className="font-medium mb-2">Performance by Platform</h3>
                  <div className="space-y-4">
                    {web3Platforms.map((platform) => (
                      <div key={platform.id}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            {platform.icon}
                            <span className="ml-2 text-sm font-medium">{platform.name}</span>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.floor(Math.random() * 40) + 60}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${platform.color.split(' ')[0]}`}
                            style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
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