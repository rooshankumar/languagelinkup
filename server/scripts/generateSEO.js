
const { generateSitemap, generateRobotsTxt } = require('../utils/seoUtils');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Base URL from environment (or default)
const BASE_URL = process.env.CLIENT_URL || 'https://mylanguageapp.replit.app';

// Generate SEO files
(async () => {
  console.log('Generating SEO files...');
  
  // Generate sitemap.xml
  const sitemapResult = await generateSitemap(BASE_URL);
  console.log('Sitemap generation:', sitemapResult ? 'Success' : 'Failed');
  
  // Generate robots.txt
  const robotsResult = generateRobotsTxt(BASE_URL);
  console.log('Robots.txt generation:', robotsResult ? 'Success' : 'Failed');
  
  console.log('SEO file generation complete.');
})();
