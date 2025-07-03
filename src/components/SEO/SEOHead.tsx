import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Article, Category } from '../../types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  article?: Article;
  category?: Category;
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  article,
  category,
  structuredData
}) => {
  const siteUrl = window.location.origin;
  const currentUrl = window.location.href;
  
  // Default values
  const defaultTitle = 'Kirods Hosting Knowledge Base - Web Hosting Support & Guides';
  const defaultDescription = 'Comprehensive web hosting guides, tutorials, and support articles for cPanel, WordPress, domains, SSL certificates, and more.';
  const defaultImage = `${siteUrl}/og-image.jpg`;
  
  // Build final values
  const finalTitle = title || article?.meta_title || article?.title || defaultTitle;
  const finalDescription = description || article?.meta_description || 
    (article?.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : defaultDescription);
  const finalKeywords = keywords || article?.meta_keywords || 'web hosting, cPanel, WordPress, domains, SSL, hosting support';
  const finalCanonicalUrl = canonicalUrl || article?.canonical_url || currentUrl;
  const finalOgTitle = ogTitle || article?.og_title || finalTitle;
  const finalOgDescription = ogDescription || article?.og_description || finalDescription;
  const finalOgImage = ogImage || article?.og_image || defaultImage;

  // Generate structured data for articles
  const generateArticleStructuredData = () => {
    if (!article) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "description": finalDescription,
      "image": finalOgImage,
      "author": {
        "@type": "Organization",
        "name": "Kirods Hosting",
        "url": "https://kirods.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Kirods Hosting",
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.png`
        }
      },
      "datePublished": article.created_at,
      "dateModified": article.updated_at,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": finalCanonicalUrl
      },
      "articleSection": category?.name || article.category?.name || "Web Hosting",
      "keywords": article.tags.join(', '),
      "wordCount": article.content.replace(/<[^>]*>/g, '').split(' ').length,
      "inLanguage": "en-US"
    };
  };

  // Generate breadcrumb structured data
  const generateBreadcrumbData = () => {
    const breadcrumbs = [
      { name: "Home", url: siteUrl },
      { name: "Knowledge Base", url: `${siteUrl}/` }
    ];

    if (category || article?.category) {
      breadcrumbs.push({
        name: category?.name || article?.category?.name || "Category",
        url: `${siteUrl}/?category=${category?.id || article?.category_id}`
      });
    }

    if (article) {
      breadcrumbs.push({
        name: article.title,
        url: finalCanonicalUrl
      });
    }

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };
  };

  // Generate FAQ structured data if article has Q&A format
  const generateFAQData = () => {
    if (!article || !article.content.includes('?')) return null;

    // Extract Q&A pairs from content (simple heuristic)
    const content = article.content.replace(/<[^>]*>/g, '');
    const sections = content.split('\n\n');
    const faqs = [];

    for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].includes('?') && sections[i].length < 200) {
        faqs.push({
          "@type": "Question",
          "name": sections[i].trim(),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": sections[i + 1].trim()
          }
        });
      }
    }

    if (faqs.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs
    };
  };

  // Combine all structured data
  const allStructuredData = [
    generateBreadcrumbData(),
    generateArticleStructuredData(),
    generateFAQData(),
    structuredData
  ].filter(Boolean);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:site_name" content="Kirods Hosting Knowledge Base" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={finalOgImage} />

      {/* Article-specific meta tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.created_at} />
          <meta property="article:modified_time" content={article.updated_at} />
          <meta property="article:author" content="Kirods Hosting" />
          <meta property="article:section" content={article.category?.name || "Web Hosting"} />
          {article.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Additional SEO Meta Tags */}
      <meta name="author" content="Kirods Hosting" />
      <meta name="publisher" content="Kirods Hosting" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//google.com" />
      <link rel="dns-prefetch" href="//googletagmanager.com" />
      <link rel="dns-prefetch" href="//google-analytics.com" />
    </Helmet>
  );
};

export default SEOHead;