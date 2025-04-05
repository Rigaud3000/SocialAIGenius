import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageCircle } from "lucide-react";

export default function RecentPosts() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recently Published Posts</CardTitle>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your last published posts across platforms</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array(4).fill(0).map((_, i) => (
              <li key={i}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-3 w-48 mt-1" />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-6 w-16 rounded-full mr-2" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  // Get platform icon based on platform slug
  const getPlatformIcon = (slug: string) => {
    switch (slug) {
      case 'facebook':
        return <FaFacebook className="h-4 w-4 text-blue-500 mr-1" />;
      case 'instagram':
        return <FaInstagram className="h-4 w-4 text-pink-500 mr-1" />;
      case 'twitter':
        return <FaTwitter className="h-4 w-4 text-blue-400 mr-1" />;
      case 'linkedin':
        return <FaLinkedin className="h-4 w-4 text-blue-700 mr-1" />;
      case 'youtube':
        return <FaYoutube className="h-4 w-4 text-red-600 mr-1" />;
      default:
        return null;
    }
  };

  // Calculate how long ago a post was published
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const publishedDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - publishedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  };

  // Filter posts to only show published ones, and limit to 4
  const publishedPosts = posts?.filter((post: any) => post.status === 'published').slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recently Published Posts</CardTitle>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your last {publishedPosts?.length || 0} published posts across platforms</p>
          </div>
          <a href="#" className="text-sm font-medium text-primary hover:text-primary/90">
            View all posts
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
          {publishedPosts?.map((post: any) => (
            <li key={post.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
                      <img 
                        className="h-10 w-10 object-cover" 
                        src={`https://picsum.photos/seed/${post.id}/200`} 
                        alt="Post" 
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{post.content}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span>Published {getTimeAgo(post.publishedAt)} on</span>
                        {post.platforms?.map((platform: any) => (
                          <span key={platform.id} className="inline-flex items-center ml-1">
                            {getPlatformIcon(platform.platform?.slug)}
                            {platform.platform?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Badge variant="secondary" className="flex items-center mr-2">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {Math.floor(Math.random() * 500)}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center mr-2">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      {Math.floor(Math.random() * 50)}
                    </Badge>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
