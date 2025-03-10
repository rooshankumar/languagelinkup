
const fs = require('fs');
const path = require('path');
const BlogPost = require('../models/BlogPost');

// Generate sitemap.xml
const generateSitemap = async (baseUrl) => {
  try {
    // Get all published blog posts
    const posts = await BlogPost.find({ published: true })
      .select('slug updatedAt')
      .sort({ publishedAt: -1 });
    
    // Start building sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    const staticPages = [
      { url: '/', priority: '1.0' },
      { url: '/blog', priority: '0.8' },
      { url: '/auth', priority: '0.5' },
      { url: '/onboarding', priority: '0.5' },
      { url: '/community', priority: '0.7' }
    ];
    
    staticPages.forEach(page => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });
    
    // Add blog posts
    posts.forEach(post => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      sitemap += `    <lastmod>${post.updatedAt.toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += '    <changefreq>monthly</changefreq>\n';
      sitemap += '    <priority>0.6</priority>\n';
      sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    
    // Write sitemap to public directory
    fs.writeFileSync(
      path.join(__dirname, '../public/sitemap.xml'),
      sitemap
    );
    
    console.log('Sitemap.xml generated successfully');
    return true;
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return false;
  }
};

// Generate robots.txt
const generateRobotsTxt = (baseUrl) => {
  try {
    const robotsTxt = `# robots.txt for LinguaLink
User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;
    
    fs.writeFileSync(
      path.join(__dirname, '../public/robots.txt'),
      robotsTxt
    );
    
    console.log('Robots.txt generated successfully');
    return true;
  } catch (error) {
    console.error('Robots.txt generation error:', error);
    return false;
  }
};

// Generate structured data for rich snippets
const generateStructuredData = (post) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': post.title,
    'description': post.metaDescription || post.excerpt,
    'image': post.featuredImage,
    'author': {
      '@type': 'Person',
      'name': `${post.author.firstName} ${post.author.lastName}` || post.author.username
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'LinguaLink',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://mylanguageapp.replit.app/logo.png'
      }
    },
    'datePublished': post.publishedAt,
    'dateModified': post.updatedAt
  };
  
  return JSON.stringify(structuredData);
};

module.exports = {
  generateSitemap,
  generateRobotsTxt,
  generateStructuredData
};
