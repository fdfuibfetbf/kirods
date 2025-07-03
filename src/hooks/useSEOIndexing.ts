import { useState, useCallback } from 'react';
import { Article } from '../types';

interface IndexingResult {
  success: boolean;
  message: string;
  indexedUrls?: string[];
  errors?: string[];
}

export const useSEOIndexing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Submit URL to Google Search Console for indexing
  const submitToGoogleIndexing = useCallback(async (url: string): Promise<IndexingResult> => {
    try {
      // In a real implementation, you would use Google's Indexing API
      // For now, we'll simulate the process and provide instructions
      
      console.log(`Submitting URL to Google for indexing: ${url}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: `URL submitted for indexing: ${url}`,
        indexedUrls: [url]
      };
    } catch (err) {
      return {
        success: false,
        message: `Failed to submit URL: ${err instanceof Error ? err.message : 'Unknown error'}`,
        errors: [err instanceof Error ? err.message : 'Unknown error']
      };
    }
  }, []);

  // Submit multiple URLs for indexing
  const submitMultipleUrls = useCallback(async (urls: string[]): Promise<IndexingResult> => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled(
        urls.map(url => submitToGoogleIndexing(url))
      );

      const successful = results
        .filter((result): result is PromiseFulfilledResult<IndexingResult> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value.indexedUrls?.[0])
        .filter(Boolean) as string[];

      const failed = results
        .filter((result): result is PromiseRejectedResult | PromiseFulfilledResult<IndexingResult> => 
          result.status === 'rejected' || 
          (result.status === 'fulfilled' && !result.value.success)
        )
        .map(result => 
          result.status === 'rejected' 
            ? result.reason 
            : (result as PromiseFulfilledResult<IndexingResult>).value.message
        );

      return {
        success: successful.length > 0,
        message: `Successfully submitted ${successful.length} URLs for indexing`,
        indexedUrls: successful,
        errors: failed
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit URLs';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      };
    } finally {
      setLoading(false);
    }
  }, [submitToGoogleIndexing]);

  // Submit article for indexing
  const submitArticleForIndexing = useCallback(async (article: Article): Promise<IndexingResult> => {
    const baseUrl = window.location.origin;
    const articleUrl = `${baseUrl}/article/${article.slug || article.id}`;
    
    return submitToGoogleIndexing(articleUrl);
  }, [submitToGoogleIndexing]);

  // Generate and submit sitemap
  const generateAndSubmitSitemap = useCallback(async (articles: Article[]): Promise<IndexingResult> => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = window.location.origin;
      const urls = [
        baseUrl, // Homepage
        `${baseUrl}/`, // Knowledge base
        ...articles.map(article => `${baseUrl}/article/${article.slug || article.id}`)
      ];

      // Submit all URLs
      const result = await submitMultipleUrls(urls);
      
      // Also ping search engines about sitemap
      await pingSearchEngines();

      return {
        ...result,
        message: `${result.message}. Sitemap submitted to search engines.`
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate sitemap';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      };
    } finally {
      setLoading(false);
    }
  }, [submitMultipleUrls]);

  // Ping search engines about sitemap updates
  const pingSearchEngines = useCallback(async (): Promise<void> => {
    const baseUrl = window.location.origin;
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    
    const searchEngines = [
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    ];

    // In a real implementation, you would make these requests from your backend
    // to avoid CORS issues
    console.log('Pinging search engines with sitemap:', sitemapUrl);
    console.log('Search engine ping URLs:', searchEngines);
  }, []);

  // Check indexing status (mock implementation)
  const checkIndexingStatus = useCallback(async (url: string): Promise<{
    indexed: boolean;
    lastCrawled?: string;
    issues?: string[];
  }> => {
    try {
      // In a real implementation, you would use Google Search Console API
      // or other tools to check indexing status
      
      console.log(`Checking indexing status for: ${url}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock response
      return {
        indexed: Math.random() > 0.3, // 70% chance of being indexed
        lastCrawled: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        issues: Math.random() > 0.8 ? ['Page load speed could be improved'] : []
      };
    } catch (err) {
      console.error('Error checking indexing status:', err);
      return {
        indexed: false,
        issues: ['Unable to check indexing status']
      };
    }
  }, []);

  // Generate robots.txt content
  const generateRobotsTxt = useCallback((): string => {
    const baseUrl = window.location.origin;
    
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-articles.xml
Sitemap: ${baseUrl}/sitemap-categories.xml

# Crawl-delay for polite crawling
Crawl-delay: 1

# Disallow admin areas
Disallow: /area51/
Disallow: /admin/
Disallow: /api/

# Allow important pages
Allow: /
Allow: /article/
Allow: /category/

# Block common bot traps
Disallow: /search?
Disallow: /*?utm_*
Disallow: /*?ref=*
Disallow: /*?source=*`;
  }, []);

  return {
    loading,
    error,
    submitToGoogleIndexing,
    submitMultipleUrls,
    submitArticleForIndexing,
    generateAndSubmitSitemap,
    pingSearchEngines,
    checkIndexingStatus,
    generateRobotsTxt
  };
};