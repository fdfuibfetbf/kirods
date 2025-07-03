import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Globe, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useArticles } from '../../hooks/useArticles';
import { useCategories } from '../../hooks/useCategories';
import { useSEOIndexing } from '../../hooks/useSEOIndexing';
import { Article, Category } from '../../types';

const SitemapGenerator: React.FC = () => {
  const { articles } = useArticles();
  const { categories } = useCategories();
  const { 
    loading, 
    generateAndSubmitSitemap, 
    generateRobotsTxt,
    checkIndexingStatus 
  } = useSEOIndexing();
  
  const [sitemapXml, setSitemapXml] = useState<string>('');
  const [robotsTxt, setRobotsTxt] = useState<string>('');
  const [indexingStatus, setIndexingStatus] = useState<Record<string, any>>({});
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  // Generate XML sitemap
  const generateSitemapXml = (articles: Article[], categories: Category[]): string => {
    const baseUrl = window.location.origin;
    const now = new Date().toISOString();
    
    const urls = [
      // Homepage
      {
        loc: baseUrl,
        lastmod: now,
        changefreq: 'daily',
        priority: '1.0'
      },
      // Knowledge base main page
      {
        loc: `${baseUrl}/`,
        lastmod: now,
        changefreq: 'daily',
        priority: '0.9'
      },
      // Categories
      ...categories.map(category => ({
        loc: `${baseUrl}/?category=${category.id}`,
        lastmod: category.updated_at,
        changefreq: 'weekly',
        priority: '0.8'
      })),
      // Articles
      ...articles.map(article => ({
        loc: `${baseUrl}/article/${article.slug || article.id}`,
        lastmod: article.updated_at,
        changefreq: article.featured ? 'weekly' : 'monthly',
        priority: article.featured ? '0.9' : '0.7'
      }))
    ];

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return xmlContent;
  };

  // Generate sitemap on component mount and when data changes
  useEffect(() => {
    if (articles.length > 0 || categories.length > 0) {
      const xml = generateSitemapXml(articles, categories);
      setSitemapXml(xml);
      setRobotsTxt(generateRobotsTxt());
      setLastGenerated(new Date());
    }
  }, [articles, categories, generateRobotsTxt]);

  // Download sitemap file
  const downloadSitemap = () => {
    const blob = new Blob([sitemapXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download robots.txt file
  const downloadRobotsTxt = () => {
    const blob = new Blob([robotsTxt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Submit sitemap to search engines
  const handleSubmitSitemap = async () => {
    const result = await generateAndSubmitSitemap(articles);
    if (result.success) {
      alert(`✅ ${result.message}`);
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  // Check indexing status for sample URLs
  const checkSampleIndexing = async () => {
    const sampleUrls = [
      window.location.origin,
      ...articles.slice(0, 3).map(article => 
        `${window.location.origin}/article/${article.slug || article.id}`
      )
    ];

    const statuses: Record<string, any> = {};
    for (const url of sampleUrls) {
      statuses[url] = await checkIndexingStatus(url);
    }
    setIndexingStatus(statuses);
  };

  const totalUrls = 2 + categories.length + articles.length; // Homepage + KB + categories + articles

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-card rounded-2xl shadow-soft p-8 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SEO & Indexing</h1>
              <p className="text-gray-600">Manage sitemaps and search engine indexing</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{totalUrls}</div>
            <div className="text-sm text-gray-500">Total URLs</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pages</p>
              <p className="text-2xl font-bold text-gray-900">{totalUrls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Articles</p>
              <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-sm font-bold text-gray-900">
                {lastGenerated ? lastGenerated.toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sitemap Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sitemap Actions */}
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Globe className="h-5 w-5 text-primary-600" />
            <span>Sitemap Management</span>
          </h3>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-900 mb-2">XML Sitemap</h4>
              <p className="text-sm text-blue-700 mb-4">
                Generated sitemap with {totalUrls} URLs including all articles and categories.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={downloadSitemap}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm font-medium"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleSubmitSitemap}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  <span>Submit to Search Engines</span>
                </button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-medium text-green-900 mb-2">Robots.txt</h4>
              <p className="text-sm text-green-700 mb-4">
                Search engine crawling instructions and sitemap location.
              </p>
              <button
                onClick={downloadRobotsTxt}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                <span>Download robots.txt</span>
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h4 className="font-medium text-purple-900 mb-2">Indexing Status</h4>
              <p className="text-sm text-purple-700 mb-4">
                Check how your pages are performing in search engines.
              </p>
              <button
                onClick={checkSampleIndexing}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 text-sm font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Check Status</span>
              </button>
            </div>
          </div>
        </div>

        {/* SEO Guidelines */}
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-primary-600" />
            <span>SEO Best Practices</span>
          </h3>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">✅ Implemented Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>XML Sitemap generation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Structured data (JSON-LD)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Open Graph meta tags</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Canonical URLs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Meta descriptions & titles</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Breadcrumb navigation</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">🚀 Quick Indexing Tips</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Submit sitemap to Google Search Console</li>
                <li>• Add your site to Bing Webmaster Tools</li>
                <li>• Create high-quality, original content</li>
                <li>• Use internal linking between articles</li>
                <li>• Optimize page loading speed</li>
                <li>• Ensure mobile-friendly design</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⚡ Pro Tip</h4>
              <p className="text-sm text-yellow-700">
                After publishing new articles, use the "Submit to Search Engines" button to notify Google and Bing about your content updates for faster indexing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Indexing Status Results */}
      {Object.keys(indexingStatus).length > 0 && (
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Indexing Status Check</h3>
          <div className="space-y-4">
            {Object.entries(indexingStatus).map(([url, status]) => (
              <div key={url} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm truncate">{url}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {status.lastCrawled ? `Last crawled: ${new Date(status.lastCrawled).toLocaleDateString()}` : 'Never crawled'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {status.indexed ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Indexed</span>
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Not Indexed</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">🔧 Setup Instructions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-900 mb-3">Google Search Console</h4>
            <ol className="text-sm text-blue-700 space-y-2">
              <li>1. Visit <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline">Google Search Console</a></li>
              <li>2. Add your website property</li>
              <li>3. Verify ownership via HTML file or DNS</li>
              <li>4. Submit your sitemap URL</li>
              <li>5. Monitor indexing status and performance</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-3">Bing Webmaster Tools</h4>
            <ol className="text-sm text-blue-700 space-y-2">
              <li>1. Visit <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="underline">Bing Webmaster Tools</a></li>
              <li>2. Add your website</li>
              <li>3. Verify ownership</li>
              <li>4. Submit your sitemap</li>
              <li>5. Configure crawl settings</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapGenerator;