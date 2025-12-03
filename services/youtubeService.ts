
import { SearchedVideo, YouTubeSortOption, YouTubeSearchResponse } from "../types";
import { getYoutubeVideoId } from "../utils";

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const searchChannelVideos = async (
    query: string,
    pageToken?: string,
    order: YouTubeSortOption = 'relevance'
): Promise<YouTubeSearchResponse> => {
    if (!API_KEY) {
        throw new Error("API Key is missing.");
    }

    try {
        // Step 1: Search for the channel (or videos directly if query looks like a general search)
        // We'll do a general search for type=video to get the most relevant results for the query
        const searchUrl = new URL(`${BASE_URL}/search`);
        searchUrl.searchParams.append('part', 'snippet');
        searchUrl.searchParams.append('q', query);
        searchUrl.searchParams.append('type', 'video');
        searchUrl.searchParams.append('maxResults', '6');
        searchUrl.searchParams.append('key', API_KEY);
        searchUrl.searchParams.append('order', order);

        if (pageToken) {
            searchUrl.searchParams.append('pageToken', pageToken);
        }

        const response = await fetch(searchUrl.toString());

        if (!response.ok) {
            const errorData = await response.json();
            console.error("YouTube API Error Details:", errorData);

            if (response.status === 403) {
                const reason = errorData.error?.message || "Access Forbidden";
                throw new Error(`YouTube API 403: ${reason}`);
            }
            throw new Error(errorData.error?.message || "Failed to fetch from YouTube API");
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return { videos: [] };
        }

        // Step 2: Get video statistics (view counts)
        const videoIds = data.items.map((item: any) => item.id.videoId).filter((id: string) => id).join(',');
        let viewCounts: Record<string, string> = {};

        if (videoIds) {
            try {
                const statsUrl = new URL(`${BASE_URL}/videos`);
                statsUrl.searchParams.append('part', 'statistics');
                statsUrl.searchParams.append('id', videoIds);
                statsUrl.searchParams.append('key', API_KEY);

                const statsResponse = await fetch(statsUrl.toString());
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    statsData.items.forEach((item: any) => {
                        // Format view count
                        const views = parseInt(item.statistics.viewCount, 10);
                        if (views >= 1000000) viewCounts[item.id] = `${(views / 1000000).toFixed(1)}M`;
                        else if (views >= 1000) viewCounts[item.id] = `${(views / 1000).toFixed(1)}K`;
                        else viewCounts[item.id] = views.toString();
                    });
                }
            } catch (e) {
                console.error("Failed to fetch stats", e);
            }
        }

        // Map to our internal type
        const videos: SearchedVideo[] = data.items.map((item: any) => {
            const id = item.id.videoId;
            if (!id) return null;

            // Format relative time (approximate)
            const publishedAt = new Date(item.snippet.publishedAt);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - publishedAt.getTime()) / 1000);
            let timeString = '';

            if (diffInSeconds < 60) timeString = 'Just now';
            else if (diffInSeconds < 3600) timeString = `${Math.floor(diffInSeconds / 60)}m ago`;
            else if (diffInSeconds < 86400) timeString = `${Math.floor(diffInSeconds / 3600)}h ago`;
            else if (diffInSeconds < 604800) timeString = `${Math.floor(diffInSeconds / 86400)}d ago`;
            else if (diffInSeconds < 2592000) timeString = `${Math.floor(diffInSeconds / 604800)}w ago`;
            else if (diffInSeconds < 31536000) timeString = `${Math.floor(diffInSeconds / 2592000)}mo ago`;
            else timeString = `${Math.floor(diffInSeconds / 31536000)}y ago`;

            return {
                id,
                title: item.snippet.title,
                views: viewCounts[id] || 'N/A',
                publishedTime: timeString,
                thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url
            };
        }).filter((v): v is SearchedVideo => v !== null);

        return {
            videos,
            nextPageToken: data.nextPageToken
        };

    } catch (error: any) {
        console.error("YouTube API Error:", error);
        throw error;
    }
};
