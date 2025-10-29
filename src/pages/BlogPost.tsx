import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { directusFetch, getDirectusAssetUrl, buildSrcSet } from '@/lib/directus';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, ArrowRight } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface Post {
  id: string;
  titles: string;
  slugs: string;
  content: string;
  featured_image: string;
  author: { id: string; first_name: string; last_name: string };
  category: { id: string; name: string };
  date_created: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
}

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [renderedContent, setRenderedContent] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState<number>(0);

  // Share article functionality
  const handleShareArticle = async () => {
    const url = window.location.href;
    const title = post?.titles || 'Check out this article';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Article URL copied to clipboard!');
      } catch (err) {
        console.log('Error copying to clipboard:', err);
      }
    }
  };

  // Navigate to blog listing
  const handleReadMoreArticles = () => {
    navigate('/blog');
  };

  // Reading progress calculation
  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  // Calculate reading time
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Fetch post function that can be called from both useEffect and pull-to-refresh
  const fetchPost = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await directusFetch(
        `/items/posts?filter[slugs][_eq]=${slug}&filter[status][_eq]=published&fields=*,author.first_name,author.last_name,category.name,tags.post_tags_id.name,titles`
      );
      if (response && response.data && response.data.length > 0) {
        const fetchedPost = response.data[0] as Post;
        setPost(fetchedPost);

        // Convert Markdown to HTML and sanitize
        const htmlContent = fetchedPost.content ? await marked.parse(fetchedPost.content) : '';
        setRenderedContent(DOMPurify.sanitize(htmlContent));

        // Update document head for SEO
        document.title = fetchedPost.meta_title || fetchedPost.titles || 'Blog Post';
        const metaDescriptionTag = document.querySelector('meta[name="description"]');
        if (metaDescriptionTag) {
          metaDescriptionTag.setAttribute('content', fetchedPost.meta_description || '');
        } else {
          const newMetaTag = document.createElement('meta');
          newMetaTag.name = 'description';
          newMetaTag.content = fetchedPost.meta_description || '';
          document.head.appendChild(newMetaTag);
        }

        // Open Graph tags
        const ogTitleTag = document.querySelector('meta[property="og:title"]');
        if (ogTitleTag) ogTitleTag.setAttribute('content', fetchedPost.meta_title || fetchedPost.titles || '');
        const ogDescriptionTag = document.querySelector('meta[property="og:description"]');
        if (ogDescriptionTag) ogDescriptionTag.setAttribute('content', fetchedPost.meta_description || '');
        const ogImageTag = document.querySelector('meta[property="og:image"]');
        if (ogImageTag) ogImageTag.setAttribute('content', getDirectusAssetUrl(fetchedPost.og_image, { width: 1200, quality: 85 }) || '');

      } else {
        setError('Post not found.');
      }
    } catch (err) {
      console.error('Failed to fetch post:', err);
      
      // Fallback data for development when API is not available
      if (import.meta.env.DEV) {
        console.log('Using fallback data for development');
        const fallbackPost: Post = {
          id: '1',
          titles: 'Weekly Streak: Maintained a 7-day activity streak',
          slugs: 'weekly-streak-maintained-7-day-activity-streak',
          content: '<h2>Introduction</h2><p>This is a sample blog post about maintaining a weekly streak. In this article, we\'ll explore the benefits of consistency and how it can help you achieve your goals.</p><h3>Key Benefits</h3><ul><li>Improved consistency</li><li>Better habit formation</li><li>Increased motivation</li></ul><h2>Getting Started</h2><p>Starting a weekly streak requires commitment and planning. Here are some tips to help you get started:</p><ol><li>Set clear, achievable goals</li><li>Track your progress daily</li><li>Celebrate small wins</li><li>Stay accountable to someone</li></ol><h2>Conclusion</h2><p>Remember, consistency is key to success in any endeavor. Start small and build momentum over time.</p>',
          featured_image: null,
          author: { id: '1', first_name: 'John', last_name: 'Doe' },
          category: { id: '1', name: 'Lifestyle' },
          date_created: '2024-01-15T10:00:00Z',
          meta_title: 'Weekly Streak: Maintained a 7-day activity streak',
          meta_description: 'Learn how to maintain a consistent weekly streak and build better habits.',
          og_image: null
        };
        setPost(fallbackPost);
      } else {
        setError('Failed to load blog post.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Pull-to-refresh hook
  usePullToRefresh({
    onRefresh: fetchPost,
    disabled: loading
  });

  useEffect(() => {
    fetchPost();
  }, [slug]); // Removed 'post' from dependency array to prevent infinite loop

  if (loading) {
    return (
      <div className="bg-background min-h-screen py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-12 w-12 rounded-xl mb-6" />
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-64 w-full rounded-lg mb-6" />
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-8">
              <CardContent className="space-y-4">
                <div className="text-6xl">😕</div>
                <h1 className="text-2xl font-bold text-red-600">Oops! Something went wrong</h1>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
  return (
    <div className="bg-background min-h-screen py-10">
      <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-8">
              <CardContent className="space-y-4">
                <div className="text-6xl">📝</div>
                <h1 className="text-2xl font-bold">Post Not Found</h1>
                <p className="text-muted-foreground">The blog post you're looking for doesn't exist or has been moved.</p>
                <BackButton />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 min-h-screen">
      {/* Floating Back Button */}
      <div className="fixed top-4 left-4 z-[60]">
        <Button 
          onClick={() => navigate(-1)}
          className="bg-[#e7cfb1]/90 backdrop-blur-sm border border-[#6B3F1D]/30 text-[#6B3F1D] hover:bg-[#e7cfb1] hover:border-[#6B3F1D] rounded-full px-4 py-2 shadow-elegant"
          aria-label="Go back"
        >
          <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
          Back
        </Button>
      </div>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-amber-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#6B3F1D] to-[#8B4513] transition-all duration-300 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Hero Section with Strandly Theme */}
      <div className="relative min-h-[60vh] flex items-center overflow-hidden"
        style={{
          clipPath: 'ellipse(120% 80% at 50% 0%)'
        }}
      >
        {/* Background Image with Strandly Brown Overlay */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://hips.hearstapps.com/cosmouk.cdnds.net/17/06/1486736459-gettyimages-455965570.jpg?resize=1200:*')`
            }}
          />
          <div className="absolute inset-0 bg-[#6B3F1D]/85" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Share Button */}
            <div className="flex items-center justify-end mb-12">
              <Button variant="ghost" size="sm" className="text-[#e7cfb1] hover:text-white hover:bg-white/10">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Article Header */}
            <div className="text-center mb-16">
              {post.category && (
                <Badge className="mb-6 bg-white/20 text-[#e7cfb1] border-[#e7cfb1]/30 hover:bg-white/30">
                  {post.category.name}
                </Badge>
              )}
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-8 text-white drop-shadow-2xl font-prata line-clamp-2">
                {post.titles}
              </h1>

              {/* Author and Meta Info */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-[#e7cfb1]">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 border-2 border-white/30">
                    <AvatarFallback className="bg-[#6B3F1D] text-white font-bold text-lg">
                      {post.author?.first_name?.[0]}{post.author?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold text-xl text-white">
                      {post.author?.first_name} {post.author?.last_name}
                    </p>
                    <p className="text-[#e7cfb1]/80">Author</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-8 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">{new Date(post.date_created).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">{calculateReadingTime(post.content)} min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-20 z-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Featured Image */}
          {post.featured_image && (
              <div className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={getDirectusAssetUrl(post.featured_image, { width: 1200, quality: 85, fit: 'cover', format: 'webp' })}
              srcSet={buildSrcSet(post.featured_image, [600, 900, 1200, 1600], { format: 'webp', quality: 85 }) || undefined}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
              alt={post.titles}
              loading="eager"
              decoding="async"
              className="w-full h-64 md:h-96 lg:h-[500px] object-cover"
              onError={(e) => {
                // Fallback to original URL if Directus transformation fails
                const target = e.target as HTMLImageElement;
                if (target.src !== post.featured_image) {
                  target.src = post.featured_image;
                }
              }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#6B3F1D]/20 to-transparent" />
              </div>
          )}

            {/* Article Content */}
            <div className="py-8">
              <article className="prose prose-lg max-w-none 
                prose-headings:text-[#6B3F1D] prose-headings:font-bold prose-headings:tracking-tight prose-headings:font-prata
                prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12 prose-h1:leading-tight prose-h1:font-prata
                prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-10 prose-h2:leading-tight prose-h2:font-prata
                prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:leading-tight prose-h3:font-prata
                prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6 prose-h4:leading-tight prose-h4:font-prata
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base
                prose-a:text-[#6B3F1D] prose-a:no-underline prose-a:font-semibold hover:prose-a:underline hover:prose-a:text-[#8B4513]
                prose-strong:text-[#6B3F1D] prose-strong:font-bold
                prose-ul:mb-6 prose-ul:pl-6 prose-ul:space-y-2
                prose-ol:mb-6 prose-ol:pl-6 prose-ol:space-y-2
                prose-li:text-gray-700 prose-li:leading-relaxed
                prose-img:rounded-2xl prose-img:shadow-xl prose-img:mx-auto prose-img:mb-8
                prose-blockquote:border-l-4 prose-blockquote:border-[#6B3F1D] prose-blockquote:bg-[#e7cfb1] 
                prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:rounded-r-2xl prose-blockquote:shadow-lg
                prose-blockquote:not-italic prose-blockquote:text-gray-700 prose-blockquote:font-medium
                prose-code:bg-[#e7cfb1] prose-code:text-[#6B3F1D] prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-[#e7cfb1] prose-pre:border prose-pre:border-[#6B3F1D]/30 prose-pre:rounded-2xl prose-pre:p-6 prose-pre:overflow-x-auto
                prose-pre:code:bg-transparent prose-pre:code:p-0 prose-pre:code:text-[#6B3F1D]
                prose-hr:border-[#6B3F1D]/30 prose-hr:my-8
                prose-table:text-sm prose-table:mb-6
                prose-th:bg-[#e7cfb1] prose-th:text-[#6B3F1D] prose-th:font-bold prose-th:px-4 prose-th:py-3
                prose-td:px-4 prose-td:py-3 prose-td:border prose-td:border-[#6B3F1D]/30
                [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                
                {post.content ? (
                  <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
                ) : (
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-600 mb-2 font-prata">Content Loading...</h3>
                      <p className="text-gray-500 text-lg">The article content is being prepared for display.</p>
                    </div>
                  </div>
                )}
              </article>
            </div>

            {/* Article Footer */}
            <div className="mt-16">
              <Card className="p-8 md:p-12 shadow-2xl border-0 bg-gradient-to-br from-[#6B3F1D] to-[#8B4513] text-white">
                <CardContent className="p-0">
                  <div className="text-center space-y-6">
                    <h3 className="text-3xl font-bold text-white">Enjoyed this article?</h3>
                    <p className="text-[#e7cfb1] text-lg max-w-2xl mx-auto">
                      Share it with others who might find it helpful! Help us spread the word about great hair care.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={handleShareArticle}
                        className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-[#6B3F1D] transition-all duration-300"
                      >
                        <Share2 className="h-5 w-5 mr-2" />
                        Share Article
                      </Button>
                      <Button 
                        size="lg" 
                        onClick={handleReadMoreArticles}
                        className="bg-white text-[#6B3F1D] hover:bg-[#e7cfb1] transition-all duration-300"
                      >
                        <BookOpen className="h-5 w-5 mr-2" />
                        Read More Articles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
