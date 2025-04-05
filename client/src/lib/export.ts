import { saveAs } from 'file-saver';
import { Post as BasePost, Platform, PostPlatform as BasePostPlatform } from '@shared/schema';

// Extended Post interface with additional properties needed for export
interface Post extends BasePost {
  title: string;
  status: string;
}

// Extended PostPlatform interface with additional properties needed for export
interface PostPlatform extends BasePostPlatform {
  platformId: number;
  status: string;
  engagementStats: {
    engagement?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

// Export formats
export type ExportFormat = 'csv' | 'json' | 'pdf' | 'image';

// Export configuration options
export interface ExportOptions {
  format: ExportFormat;
  includeStats: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  platforms?: string[]; // platform slugs to include
}

/**
 * Generate formatted CSV content from posts data
 */
function generateCSV(posts: Post[], platforms: Platform[], postPlatforms: PostPlatform[]): string {
  // Create CSV header
  let csv = 'Post ID,Title,Content,Status,Created Date,Scheduled Date,Platform,Engagement,Likes,Comments,Shares\n';

  // Add data rows
  posts.forEach(post => {
    const postPlatformEntries = postPlatforms.filter(pp => pp.postId === post.id);
    
    if (postPlatformEntries.length === 0) {
      // Post without platforms
      csv += `${post.id},"${post.title.replace(/"/g, '""')}","${post.content.replace(/"/g, '""')}",${post.status},${post.createdAt},${post.scheduledAt || ''},,,,,\n`;
    } else {
      // Post with platforms
      postPlatformEntries.forEach(pp => {
        const platform = platforms.find(p => p.id === pp.platformId);
        const platformName = platform ? platform.name : 'Unknown';
        
        // Get engagement stats if available
        const engagement = pp.engagementStats?.engagement || 0;
        const likes = pp.engagementStats?.likes || 0;
        const comments = pp.engagementStats?.comments || 0;
        const shares = pp.engagementStats?.shares || 0;
        
        csv += `${post.id},"${post.title.replace(/"/g, '""')}","${post.content.replace(/"/g, '""')}",${post.status},${post.createdAt},${post.scheduledAt || ''},${platformName},${engagement},${likes},${comments},${shares}\n`;
      });
    }
  });

  return csv;
}

/**
 * Generate JSON content from posts data
 */
function generateJSON(posts: Post[], platforms: Platform[], postPlatforms: PostPlatform[]): string {
  const exportData = posts.map(post => {
    const platformEntries = postPlatforms
      .filter(pp => pp.postId === post.id)
      .map(pp => {
        const platform = platforms.find(p => p.id === pp.platformId);
        return {
          platform: platform?.name || 'Unknown',
          platformSlug: platform?.slug || 'unknown',
          status: pp.status,
          publishedUrl: pp.publishedUrl,
          stats: pp.engagementStats || null
        };
      });

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      status: post.status,
      createdAt: post.createdAt,
      scheduledAt: post.scheduledAt || null,
      platforms: platformEntries
    };
  });

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export posts data with various formats and options
 */
export async function exportPosts(
  basePosts: BasePost[],
  platforms: Platform[],
  basePostPlatforms: BasePostPlatform[],
  options: ExportOptions
): Promise<boolean> {
  // Cast the types to our extended interfaces
  const posts = basePosts as unknown as Post[];
  const postPlatforms = basePostPlatforms as unknown as PostPlatform[];
  try {
    // Apply date range filter if specified
    let filteredPosts = posts;
    if (options.dateRange) {
      const { start, end } = options.dateRange;
      filteredPosts = posts.filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate >= start && postDate <= end;
      });
    }

    // Apply platform filter if specified
    let filteredPostPlatforms = postPlatforms;
    if (options.platforms && options.platforms.length > 0) {
      const platformIds = platforms
        .filter(p => options.platforms!.includes(p.slug))
        .map(p => p.id);
      
      filteredPostPlatforms = postPlatforms.filter(pp => 
        platformIds.includes(pp.platformId)
      );
      
      // Only include posts that have matching platforms
      const postIdsWithPlatforms = new Set(filteredPostPlatforms.map(pp => pp.postId));
      filteredPosts = filteredPosts.filter(post => postIdsWithPlatforms.has(post.id));
    }

    // Generate content based on format
    let content: string;
    let fileExtension: string;
    let mimeType: string;
    
    switch (options.format) {
      case 'csv':
        content = generateCSV(filteredPosts, platforms, filteredPostPlatforms);
        fileExtension = 'csv';
        mimeType = 'text/csv;charset=utf-8';
        break;
      case 'json':
        content = generateJSON(filteredPosts, platforms, filteredPostPlatforms);
        fileExtension = 'json';
        mimeType = 'application/json;charset=utf-8';
        break;
      case 'pdf':
        // This would require a PDF generation library
        throw new Error('PDF export is not yet implemented');
      case 'image':
        // This would require canvas or image generation
        throw new Error('Image export is not yet implemented');
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `social-content-export-${timestamp}.${fileExtension}`;

    // Create blob and save file
    const blob = new Blob([content], { type: mimeType });
    saveAs(blob, filename);

    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
}

/**
 * Export analytics data 
 */
export async function exportAnalytics(
  analyticsData: any,
  options: ExportOptions
): Promise<boolean> {
  try {
    let content: string;
    let fileExtension: string;
    let mimeType: string;
    
    // Generate formatted content based on format
    switch (options.format) {
      case 'csv':
        content = generateAnalyticsCSV(analyticsData);
        fileExtension = 'csv';
        mimeType = 'text/csv;charset=utf-8';
        break;
      case 'json':
        content = JSON.stringify(analyticsData, null, 2);
        fileExtension = 'json';
        mimeType = 'application/json;charset=utf-8';
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `social-analytics-export-${timestamp}.${fileExtension}`;

    // Create blob and save file
    const blob = new Blob([content], { type: mimeType });
    saveAs(blob, filename);

    return true;
  } catch (error) {
    console.error('Analytics export failed:', error);
    return false;
  }
}

/**
 * Generate CSV content from analytics data
 */
function generateAnalyticsCSV(analyticsData: any): string {
  if (!analyticsData || typeof analyticsData !== 'object') {
    return 'No data available';
  }
  
  // Handle platform-specific analytics
  if (analyticsData.platforms && Array.isArray(analyticsData.platforms)) {
    let csv = 'Platform,Followers,Posts,Engagement Rate,Likes,Comments,Shares,Views\n';
    
    analyticsData.platforms.forEach((platform: any) => {
      csv += `${platform.name},${platform.followers || 0},${platform.posts || 0},${platform.engagementRate || '0%'},${platform.likes || 0},${platform.comments || 0},${platform.shares || 0},${platform.views || 0}\n`;
    });
    
    return csv;
  }
  
  // Handle general analytics
  let csv = 'Metric,Value\n';
  for (const [key, value] of Object.entries(analyticsData)) {
    if (typeof value !== 'object') {
      csv += `${key},${value}\n`;
    }
  }
  
  return csv;
}

/**
 * Export content as a template for future use
 */
export async function exportContentTemplate(
  content: string,
  title: string,
  platforms: string[]
): Promise<boolean> {
  try {
    const template = {
      title,
      content,
      platforms,
      createdAt: new Date().toISOString()
    };
    
    const content_json = JSON.stringify(template, null, 2);
    const filename = `content-template-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    
    const blob = new Blob([content_json], { type: 'application/json;charset=utf-8' });
    saveAs(blob, filename);
    
    return true;
  } catch (error) {
    console.error('Template export failed:', error);
    return false;
  }
}