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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, ChevronsUpDown, Compass, Globe, Info, Loader2, MessageCircle, Paperclip, SendHorizontal, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Define supported virtual world/metaverse platforms
const virtualWorlds = [
  {
    id: 'decentraland',
    name: 'Decentraland',
    description: 'A decentralized virtual world built on the Ethereum blockchain',
    logo: 'https://cryptologos.cc/logos/decentraland-mana-logo.png',
    color: 'bg-blue-500',
    website: 'https://decentraland.org',
    connected: false,
    userCount: '650,000+',
    hasMessaging: true,
    hasPosts: true,
    hasEvents: true
  },
  {
    id: 'sandbox',
    name: 'The Sandbox',
    description: 'A community-driven platform where creators can monetize voxel assets and gaming experiences',
    logo: 'https://cryptologos.cc/logos/the-sandbox-sand-logo.png',
    color: 'bg-blue-400',
    website: 'https://www.sandbox.game',
    connected: false,
    userCount: '2,500,000+',
    hasMessaging: true,
    hasPosts: true,
    hasEvents: true
  },
  {
    id: 'roblox',
    name: 'Roblox',
    description: 'An immersive multiplayer platform where millions of users create and share experiences',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Roblox_player_icon_black.svg/1200px-Roblox_player_icon_black.svg.png',
    color: 'bg-red-500',
    website: 'https://www.roblox.com',
    connected: false,
    userCount: '202,000,000+',
    hasMessaging: true,
    hasPosts: false,
    hasEvents: true
  },
  {
    id: 'meta',
    name: 'Meta Horizon Worlds',
    description: 'An immersive social experience where users can explore, create and connect',
    logo: 'https://cdn.iconscout.com/icon/free/png-256/free-meta-6562140-5445993.png',
    color: 'bg-blue-600',
    website: 'https://www.meta.com/horizon-worlds',
    connected: false,
    userCount: '300,000+',
    hasMessaging: true,
    hasPosts: true,
    hasEvents: true
  },
  {
    id: 'cryptovoxels',
    name: 'Voxels (formerly Cryptovoxels)',
    description: 'A virtual world powered by the Ethereum blockchain',
    logo: 'https://pbs.twimg.com/profile_images/1492964166418714630/Fcsv1IB1_400x400.jpg',
    color: 'bg-purple-500',
    website: 'https://www.voxels.com',
    connected: false,
    userCount: '125,000+',
    hasMessaging: true,
    hasPosts: true,
    hasEvents: true
  },
  {
    id: 'somnium',
    name: 'Somnium Space',
    description: 'An open, social and persistent VR world built on blockchain',
    logo: 'https://avatars.githubusercontent.com/u/26794383',
    color: 'bg-cyan-500',
    website: 'https://somniumspace.com',
    connected: false,
    userCount: '80,000+',
    hasMessaging: true,
    hasPosts: true,
    hasEvents: true
  }
];

export default function VirtualWorldConnector() {
  const [connectedWorlds, setConnectedWorlds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('platforms');
  const [currentWorld, setCurrentWorld] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasAttachment, setHasAttachment] = useState(false);
  const [activeConversation, setActiveConversation] = useState<null | string>(null);

  // Sample conversations for demo
  const conversations = [
    { 
      id: 'conv1', 
      user: 'CryptoCreator', 
      avatar: 'C',
      lastMessage: 'Hey! I saw your brand in Decentraland. Cool design!',
      world: 'decentraland',
      time: '2h ago' 
    },
    { 
      id: 'conv2', 
      user: 'MetaBuilder',
      avatar: 'M',
      lastMessage: 'Let me know when you want to collaborate on the event.',
      world: 'sandbox',
      time: '1d ago' 
    },
    { 
      id: 'conv3', 
      user: 'VoxelArtist', 
      avatar: 'V',
      lastMessage: 'I can help you design a virtual space for your brand.',
      world: 'cryptovoxels',
      time: '3d ago' 
    }
  ];

  // Filter worlds by search query
  const filteredWorlds = virtualWorlds.filter(world => 
    world.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    world.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Connect to a virtual world
  const connectWorld = async (worldId: string) => {
    if (connectedWorlds.includes(worldId)) {
      toast({ 
        title: "Already Connected", 
        description: `You're already connected to this virtual world.`
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setConnectedWorlds(prev => [...prev, worldId]);
    setIsLoading(false);
    
    toast({ 
      title: "Connection Successful", 
      description: `Successfully connected to ${virtualWorlds.find(w => w.id === worldId)?.name}.`
    });
  };

  // Disconnect from a virtual world
  const disconnectWorld = async (worldId: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setConnectedWorlds(prev => prev.filter(id => id !== worldId));
    setIsLoading(false);
    
    toast({ 
      title: "Disconnected", 
      description: `Successfully disconnected from ${virtualWorlds.find(w => w.id === worldId)?.name}.`
    });
  };

  // Send a message in a virtual world
  const sendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }

    if (!currentWorld && !activeConversation) {
      toast({
        title: "Error",
        description: "Please select a virtual world or conversation to send to.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ 
      title: "Message Sent", 
      description: `Your message was sent successfully.`
    });
    
    setMessage('');
    setHasAttachment(false);
    setIsLoading(false);
  };

  // Post content to a virtual world
  const postToWorld = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter content to post.",
        variant: "destructive",
      });
      return;
    }

    if (!currentWorld) {
      toast({
        title: "Error",
        description: "Please select a virtual world to post to.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({ 
      title: "Post Published", 
      description: `Your content was posted to ${virtualWorlds.find(w => w.id === currentWorld)?.name}.`
    });
    
    setPostContent('');
    setHasAttachment(false);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Compass className="mr-2 h-5 w-5 text-primary" />
            Virtual Worlds & Metaverse
          </CardTitle>
          <CardDescription>
            Connect to virtual worlds and metaverse platforms to expand your social media presence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="platforms" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
              <TabsTrigger value="messages">Messaging</TabsTrigger>
              <TabsTrigger value="post">Post Content</TabsTrigger>
            </TabsList>
            
            {/* Platforms Tab */}
            <TabsContent value="platforms">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Search virtual worlds..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredWorlds.map((world) => (
                    <Card key={world.id} className="overflow-hidden border-t-4" style={{ borderTopColor: world.color }}>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={world.logo} alt={world.name} />
                              <AvatarFallback>{world.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{world.name}</CardTitle>
                              <CardDescription className="text-xs">Users: {world.userCount}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Switch
                              checked={connectedWorlds.includes(world.id)}
                              disabled={isLoading}
                              onCheckedChange={() => {
                                if (connectedWorlds.includes(world.id)) {
                                  disconnectWorld(world.id);
                                } else {
                                  connectWorld(world.id);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {world.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {world.hasMessaging && (
                            <Badge variant="outline" className="text-xs">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Messaging
                            </Badge>
                          )}
                          {world.hasPosts && (
                            <Badge variant="outline" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              Social Posts
                            </Badge>
                          )}
                          {world.hasEvents && (
                            <Badge variant="outline" className="text-xs">
                              <Compass className="h-3 w-3 mr-1" />
                              Events
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 bg-gray-50 dark:bg-gray-800">
                        {connectedWorlds.includes(world.id) ? (
                          <div className="flex space-x-2 w-full">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setCurrentWorld(world.id);
                                setActiveTab('messages');
                              }}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                setCurrentWorld(world.id);
                                setActiveTab('post');
                              }}
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              Post
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => connectWorld(world.id)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Connect
                              </>
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                {filteredWorlds.length === 0 && (
                  <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed">
                    <Globe className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium">No results found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search terms.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Messaging Tab */}
            <TabsContent value="messages">
              {connectedWorlds.length === 0 ? (
                <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                  <Info className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    You need to connect to a virtual world first to access messaging.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Conversations List */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-3 border-b bg-gray-50 dark:bg-gray-800">
                      <h3 className="font-medium">Conversations</h3>
                    </div>
                    <div className="divide-y max-h-[400px] overflow-y-auto">
                      {conversations.map((conv) => (
                        <div 
                          key={conv.id}
                          className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${activeConversation === conv.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                          onClick={() => {
                            setActiveConversation(conv.id);
                            setCurrentWorld(conv.world);
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>{conv.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline">
                                <p className="font-medium truncate">{conv.user}</p>
                                <span className="text-xs text-gray-500">{conv.time}</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {virtualWorlds.find(w => w.id === conv.world)?.name}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {conversations.length === 0 && (
                        <div className="p-6 text-center">
                          <p className="text-sm text-gray-500">No conversations yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Chat Area */}
                  <div className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col h-[500px]">
                    <div className="p-3 border-b bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                      {activeConversation ? (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {conversations.find(c => c.id === activeConversation)?.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-medium">
                            {conversations.find(c => c.id === activeConversation)?.user}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {virtualWorlds.find(w => w.id === conversations.find(c => c.id === activeConversation)?.world)?.name}
                          </Badge>
                        </div>
                      ) : currentWorld ? (
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">New Message</h3>
                          <Badge variant="outline" className="text-xs">
                            {virtualWorlds.find(w => w.id === currentWorld)?.name}
                          </Badge>
                        </div>
                      ) : (
                        <h3 className="font-medium">Select a conversation</h3>
                      )}
                    </div>
                    
                    <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 flex flex-col justify-end">
                      {/* Message placeholder - would contain actual messages in a real app */}
                      {(activeConversation || currentWorld) ? (
                        <div className="space-y-3">
                          <div className="flex justify-start">
                            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 max-w-[70%] shadow-sm">
                              <p className="text-sm">
                                {activeConversation 
                                  ? conversations.find(c => c.id === activeConversation)?.lastMessage
                                  : `Welcome to ${virtualWorlds.find(w => w.id === currentWorld)?.name}! How can I help?`}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">10:30 AM</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <p>Select a conversation to start messaging</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 border-t">
                      <div className="flex items-center space-x-2">
                        <Input 
                          placeholder="Type your message..." 
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          disabled={!activeConversation && !currentWorld}
                        />
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={() => setHasAttachment(!hasAttachment)}
                          disabled={!activeConversation && !currentWorld}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon"
                          onClick={sendMessage}
                          disabled={!message.trim() || (!activeConversation && !currentWorld) || isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <SendHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {hasAttachment && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm flex items-center justify-between">
                          <span>image.png</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">✕</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Post Content Tab */}
            <TabsContent value="post">
              {connectedWorlds.length === 0 ? (
                <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                  <Info className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    You need to connect to a virtual world first to post content.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Platform</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={currentWorld || ""}
                      onChange={(e) => setCurrentWorld(e.target.value)}
                    >
                      <option value="">Select a virtual world</option>
                      {virtualWorlds
                        .filter(world => connectedWorlds.includes(world.id) && world.hasPosts)
                        .map((world) => (
                          <option key={world.id} value={world.id}>
                            {world.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Post Content</Label>
                    <Textarea
                      placeholder="What would you like to share in the metaverse?"
                      className="min-h-32"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      disabled={!currentWorld}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={hasAttachment}
                        onChange={() => setHasAttachment(!hasAttachment)}
                        disabled={!currentWorld}
                      />
                      <span>Add Media (3D model, image, or video)</span>
                    </Label>
                    
                    {hasAttachment && (
                      <div className="mt-2">
                        <Input 
                          type="file" 
                          disabled={!currentWorld}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Supported formats: GLB, GLTF, PNG, JPG, MP4, WebM
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={postToWorld}
                    disabled={!postContent.trim() || !currentWorld || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <SendHorizontal className="h-4 w-4 mr-2" />
                        Publish to {virtualWorlds.find(w => w.id === currentWorld)?.name}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}