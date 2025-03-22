import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { BookOpen, Clock, ChevronLeft, Search } from 'lucide-react';
import AdBanner from '@/components/AdBanner';
import { trackPageView } from '@/utils/analytics';
import Sidebar from '@/components/Sidebar';

const BLOG_POSTS = [
  {
    id: '1',
    title: '10 Tips to Improve Your Language Learning',
    slug: '10-tips-to-improve-language-learning',
    excerpt: 'Discover proven strategies to accelerate your language learning journey and achieve fluency faster.',
    content: `
      <h2>1. Practice consistently</h2>
      <p>Regular practice, even for short periods, is more effective than occasional intensive study sessions. Aim for at least 20-30 minutes daily.</p>

      <h2>2. Immerse yourself</h2>
      <p>Surround yourself with the language through movies, music, podcasts, and books. This passive exposure complements your active learning.</p>
    `,
    author: 'Elena Rodriguez',
    authorTitle: 'Polyglot & Language Educator',
    authorAvatar: 'https://ui-avatars.com/api/?name=Elena+Rodriguez&background=random',
    publishDate: '2023-11-05',
    readTime: '6 min read',
    category: 'Learning',
    tags: ['practice', 'fluency', 'intermediate learners'],
    featuredImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
  },
];

// Blog List Page Component
const BlogList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  useEffect(() => {
    trackPageView('/blog');
  }, []);

  const filteredPosts = BLOG_POSTS.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Language Learning Blog</h1>
        <p className="text-muted-foreground">Tips, strategies and insights to enhance your language learning journey</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          type="text"
          placeholder="Search articles..."
          className="w-full pl-10 pr-4 py-2 border rounded-md bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <AdBanner adSlot="1234567890" className="mb-8" />

      {!searchTerm && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Featured Article</h2>
          <div className="bg-card rounded-xl overflow-hidden shadow-md border">
            <div className="h-64 overflow-hidden">
              <img 
                src={BLOG_POSTS[0].featuredImage} 
                alt={BLOG_POSTS[0].title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <p className="text-sm text-primary font-medium mb-2">{BLOG_POSTS[0].category}</p>
              <h3 className="text-2xl font-bold mb-2">
                <Link to={`/blog/${BLOG_POSTS[0].slug}`} className="hover:text-primary transition-colors">
                  {BLOG_POSTS[0].title}
                </Link>
              </h3>
              <p className="text-muted-foreground mb-4">{BLOG_POSTS[0].excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src={BLOG_POSTS[0].authorAvatar} 
                    alt={BLOG_POSTS[0].author}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <p className="text-sm font-medium">{BLOG_POSTS[0].author}</p>
                    <p className="text-xs text-muted-foreground">{BLOG_POSTS[0].authorTitle}</p>
                  </div>
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{BLOG_POSTS[0].readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post, index) => (
          (!searchTerm && index === 0) ? null : (
            <div key={post.id} className="bg-card rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-primary font-medium mb-1">{post.category}</p>
                <h3 className="text-lg font-bold mb-2 line-clamp-2">
                  <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={post.authorAvatar} 
                      alt={post.author}
                      className="w-6 h-6 rounded-full mr-1"
                    />
                    <p className="text-xs">{post.author}</p>
                  </div>
                  <div className="flex items-center text-muted-foreground text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      <AdBanner adSlot="9876543210" className="mt-12" />

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No articles found</h3>
          <p className="text-muted-foreground">
            No articles matching "{searchTerm}". Try another search term.
          </p>
        </div>
      )}
    </div>
  );
};

// Blog Post Detail Component
const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find(post => post.slug === slug);

  useEffect(() => {
    if (slug) {
      trackPageView(`/blog/${slug}`);
    }
  }, [slug]);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <p className="mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/blog" className="text-primary hover:underline">
          Return to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/blog" className="flex items-center text-muted-foreground hover:text-primary mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to all articles
      </Link>

      <div className="mb-6">
        <p className="text-sm text-primary font-medium mb-2">{post.category}</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img 
              src={post.authorAvatar} 
              alt={post.author}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p className="font-medium">{post.author}</p>
              <p className="text-xs text-muted-foreground">{post.authorTitle}</p>
            </div>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">{post.readTime}</span>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-xl overflow-hidden">
        <img 
          src={post.featuredImage} 
          alt={post.title}
          className="w-full h-auto"
        />
      </div>

      <AdBanner adSlot="3456789012" className="mb-8" />

      <div 
        className="prose prose-slate max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />

      <AdBanner adSlot="5678901234" className="mb-8" />

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-2">Tags:</h3>
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Blog component
const Blog = () => {
  const { slug } = useParams<{ slug?: string }>();

  return (
    <div className="flex min-h-screen">
      <Sidebar className="hidden md:flex" />
      <main className="flex-1 pb-16 md:pb-0 md:pl-64">
        {slug ? <BlogDetail /> : <BlogList />}
      </main>
    </div>
  );
};

export default Blog;