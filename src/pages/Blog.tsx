
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Clock, ChevronLeft, Search } from 'lucide-react';

// Mock blog data - this would come from your backend in a real implementation
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
      
      <h2>3. Speak from day one</h2>
      <p>Don't wait until you feel "ready" to speak. Start practicing conversation as early as possible, even if you make mistakes.</p>
      
      <h2>4. Focus on common vocabulary</h2>
      <p>Learn the most frequently used words first. In many languages, knowing just 1,000 words can help you understand about 80% of everyday conversations.</p>
      
      <h2>5. Use spaced repetition</h2>
      <p>Review vocabulary and concepts at increasing intervals to improve long-term retention.</p>
      
      <h2>6. Set specific goals</h2>
      <p>Rather than "learn Spanish," aim for something specific like "order food in Spanish" or "have a 5-minute conversation."</p>
      
      <h2>7. Find a language partner</h2>
      <p>Practicing with native speakers provides authentic conversation experience and cultural insights.</p>
      
      <h2>8. Learn phrases, not just words</h2>
      <p>Understanding how words fit together in common phrases is more valuable than memorizing isolated vocabulary.</p>
      
      <h2>9. Make mistakes</h2>
      <p>Embrace errors as learning opportunities. Being afraid to make mistakes will slow your progress.</p>
      
      <h2>10. Track your progress</h2>
      <p>Keep a record of your learning to stay motivated and see how far you've come.</p>
    `,
    author: 'Sarah Johnson',
    authorTitle: 'Language Learning Coach',
    authorAvatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random',
    publishDate: '2023-10-15',
    readTime: '8 min read',
    category: 'Learning Strategies',
    tags: ['tips', 'learning methods', 'fluency'],
    featuredImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: '2',
    title: 'The Science Behind Language Acquisition',
    slug: 'science-behind-language-acquisition',
    excerpt: 'Understanding how our brains learn languages can help us develop more effective learning strategies.',
    content: `
      <p>Language acquisition involves both conscious and unconscious processes. The brain forms neural pathways when we learn new words and grammar patterns, and these connections strengthen with repeated exposure and practice.</p>
      
      <h2>Critical Periods in Language Learning</h2>
      <p>Research suggests that children have a "critical period" for language acquisition that makes it easier for them to become fluent in new languages. However, adults still have many cognitive advantages that can aid in language learning.</p>
      
      <h2>The Role of Memory</h2>
      <p>Both short-term and long-term memory play crucial roles in language learning. Short-term memory helps us process immediate language input, while long-term memory stores vocabulary, grammar rules, and cultural knowledge.</p>
      
      <h2>Language Learning and Brain Plasticity</h2>
      <p>Learning a new language increases brain plasticity, which is the brain's ability to form new neural connections. This can have cognitive benefits beyond just knowing another language.</p>
      
      <h2>The Importance of Input</h2>
      <p>Comprehensible input—language that is just slightly above your current level—is crucial for progress. This idea, known as "i+1" in linguistics, suggests that you learn best when you're challenged but not overwhelmed.</p>
    `,
    author: 'Dr. Michael Chen',
    authorTitle: 'Neurolinguist',
    authorAvatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=random',
    publishDate: '2023-09-22',
    readTime: '12 min read',
    category: 'Language Science',
    tags: ['neuroscience', 'cognitive science', 'brain research'],
    featuredImage: 'https://images.unsplash.com/photo-1580894742597-87bc8789db3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: '3',
    title: 'How to Maintain Your Language Skills',
    slug: 'how-to-maintain-language-skills',
    excerpt: 'Reached a good level in your target language? Here\'s how to maintain and continue improving your skills.',
    content: `
      <p>Many language learners reach an intermediate or advanced level only to find their skills deteriorating over time due to lack of practice. Here are strategies to maintain and improve your language abilities:</p>
      
      <h2>1. Create a routine</h2>
      <p>Schedule regular practice sessions, even if they're short. Consistency is key to maintaining language skills.</p>
      
      <h2>2. Find authentic content you enjoy</h2>
      <p>Follow YouTubers, podcasts, or authors in your target language that align with your interests. This makes practice feel less like work.</p>
      
      <h2>3. Join language communities</h2>
      <p>Online forums, language exchange apps, and local meetups can provide opportunities for regular practice.</p>
      
      <h2>4. Set new challenges</h2>
      <p>Try writing a journal, participating in a debate, or explaining complex topics in your target language to push your boundaries.</p>
      
      <h2>5. Teach others</h2>
      <p>Explaining aspects of your target language to beginners reinforces your own knowledge and reveals gaps you might have missed.</p>
    `,
    author: 'Elena Rodriguez',
    authorTitle: 'Polyglot & Language Educator',
    authorAvatar: 'https://ui-avatars.com/api/?name=Elena+Rodriguez&background=random',
    publishDate: '2023-11-05',
    readTime: '6 min read',
    category: 'Maintenance',
    tags: ['practice', 'fluency', 'intermediate learners'],
    featuredImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
  }
];

// Blog List Page Component
const BlogList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
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
      
      {/* Search bar */}
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
      
      {/* Featured post */}
      {!searchTerm && (
        <div className="mb-10">
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
      
      {/* Blog posts grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post, index) => (
          // Skip the first post if we're showing featured and not searching
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
      
      <div 
        className="prose prose-slate max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />
      
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

// Main Blog component that handles routing between list and detail views
const Blog = () => {
  const { slug } = useParams<{ slug?: string }>();
  
  return slug ? <BlogDetail /> : <BlogList />;
};

export default Blog;
