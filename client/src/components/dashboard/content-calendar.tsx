import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, getDay, startOfMonth, endOfMonth, isToday, isSameMonth } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { data: scheduledPosts, isLoading } = useQuery({
    queryKey: ["/api/scheduled-posts"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Content Calendar</CardTitle>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upcoming scheduled posts</p>
            </div>
            <div className="flex space-x-1">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-32 mx-auto mb-4" />
          <div className="grid grid-cols-7 text-center text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array(35).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-ratio-1 h-8" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calendar navigation
  const nextMonth = () => {
    setCurrentMonth(addDays(currentMonth, 30));
  };

  const prevMonth = () => {
    setCurrentMonth(addDays(currentMonth, -30));
  };

  // Calendar generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = monthStart;
  const endDate = monthEnd;

  const dateFormat = "MMMM yyyy";
  const days = [];
  let day = startDate;
  let formattedDate = "";

  // Create days for the calendar
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, "d");
      const cloneDay = day;
      
      // Check if there are any scheduled posts for this day
      const postsToday = scheduledPosts?.filter((post: any) => {
        const postDate = new Date(post.scheduledAt);
        return (
          postDate.getDate() === cloneDay.getDate() &&
          postDate.getMonth() === cloneDay.getMonth() &&
          postDate.getFullYear() === cloneDay.getFullYear()
        );
      });
      
      // Determine dot colors based on platforms
      const dotColors: Record<string, boolean> = {};
      postsToday?.forEach((post: any) => {
        post.platforms?.forEach((platform: any) => {
          const slug = platform.platform?.slug;
          if (slug) dotColors[slug] = true;
        });
      });

      days.push(
        <div
          key={day.toString()}
          className={cn(
            "calendar-date text-gray-900 dark:text-gray-100 relative",
            !isSameMonth(day, monthStart) && "text-gray-400 dark:text-gray-600",
            isToday(day) && "bg-primary/10 rounded-md font-medium"
          )}
        >
          {formattedDate}
          
          {/* Dots for scheduled posts */}
          {postsToday && postsToday.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-1">
              {dotColors['facebook'] && (
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              )}
              {dotColors['twitter'] && (
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              )}
              {dotColors['instagram'] && (
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
              )}
              {dotColors['linkedin'] && (
                <div className="w-1.5 h-1.5 bg-blue-700 rounded-full"></div>
              )}
              {!dotColors['facebook'] && !dotColors['twitter'] && 
               !dotColors['instagram'] && !dotColors['linkedin'] && (
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              )}
            </div>
          )}
        </div>
      );
      day = addDays(day, 1);
    }
  }

  // Get upcoming posts - next 7 days
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  const upcomingPosts = scheduledPosts?.filter((post: any) => {
    const postDate = new Date(post.scheduledAt);
    return postDate >= today && postDate <= nextWeek;
  }).sort((a: any, b: any) => {
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Content Calendar</CardTitle>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upcoming scheduled posts</p>
          </div>
          <div className="flex space-x-1">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Month header */}
        <div className="flex items-center justify-center mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {format(currentMonth, dateFormat)}
          </h4>
        </div>
        
        {/* Calendar header */}
        <div className="grid grid-cols-7 text-center text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
        
        {/* Upcoming posts */}
        <div className="mt-4 space-y-2">
          <h5 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 pb-1 border-b border-gray-200 dark:border-gray-700">
            Upcoming Posts
          </h5>
          
          {upcomingPosts?.length > 0 ? (
            upcomingPosts.slice(0, 3).map((post: any) => {
              // Get the platforms for this post
              const platforms = post.platforms?.map((p: any) => p.platform?.slug).filter(Boolean);
              let dotColor = "bg-primary";
              
              if (platforms?.includes('facebook')) dotColor = "bg-blue-500";
              else if (platforms?.includes('twitter')) dotColor = "bg-blue-400";
              else if (platforms?.includes('instagram')) dotColor = "bg-pink-500";
              else if (platforms?.includes('linkedin')) dotColor = "bg-blue-700";
              
              const postDate = new Date(post.scheduledAt);
              const isToday = new Date().toDateString() === postDate.toDateString();
              
              return (
                <div key={post.id} className="flex items-center text-sm">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full ${dotColor} mr-2`}></div>
                  <span className="font-medium text-gray-900 dark:text-white mr-2">
                    {isToday ? 'Today' : format(postDate, 'MMM d')}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 truncate">
                    {post.content.length > 30 ? `${post.content.substring(0, 30)}...` : post.content}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              No upcoming posts scheduled
            </div>
          )}
          
          {upcomingPosts?.length > 0 && (
            <div className="mt-3 text-center">
              <a href="#" className="text-sm text-primary font-medium hover:text-primary/90">
                View all scheduled posts
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
