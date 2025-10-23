import React, { useEffect, useState, useMemo } from 'react';
import { directusFetch, getDirectusAssetUrl, buildSrcSet } from '@/lib/directus';
import { fallbackPosts, fallbackTags } from '@/lib/fallback-data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  TrendingUp,
  ArrowRight,
  Grid3X3,
  List,
  SortAsc,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  titles: string;
  slugs: string;
  content: string | null;
  featured_image: string | null;
  tags: { post_tags_id: { name: string } }[];
  meta_description: string | null;
  author: { id: string; first_name: string; last_name: string };
  date_created: string;
  category?: { id: string; name: string };
  reading_time?: number;
}

interface PostTag {
  id: number;
  name: string;
}

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postTags, setPostTags] = useState<PostTag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [tagSearchQuery, setTagSearchQuery] = useState<string>('');
  const postsPerPage = 9;

  // Calculate reading time
  const calculateReadingTime = (content: string | null | undefined) => {
    if (!content) return 1; // Default to 1 minute if no content
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Filter tags based on search query
  const filteredTags = useMemo(() => {
    if (!tagSearchQuery.trim()) return postTags;
    return postTags.filter(tag => 
      tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
    );
  }, [postTags, tagSearchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch posts and tags in parallel
        const [postsResponse, tagsResponse] = await Promise.all([
          directusFetch(
            // fetch only published posts; order by newest
            '/items/posts?fields=id,titles,slugs,content,featured_image,tags.post_tags_id.name,meta_description,author.first_name,author.last_name,date_created,category.name&filter[status][_eq]=published&sort=-date_created&limit=1000'
          ),
          directusFetch('/items/post_tags')
        ]);
        
        const getLocalizedString = (value: unknown): string => {
          if (typeof value === 'string') return value;
          if (value && typeof value === 'object') {
            const obj = value as Record<string, unknown>;
            const preferred = obj['en'];
            if (typeof preferred === 'string') return preferred;
            const first = Object.values(obj).find(v => typeof v === 'string');
            if (typeof first === 'string') return first;
          }
          return '';
        };

        if (postsResponse && postsResponse.data) {
          const normalized = (postsResponse.data as any[]).map((raw) => {
            const normalizedPost: Post = {
              id: String(raw.id),
              titles: getLocalizedString(raw.titles),
              slugs: getLocalizedString(raw.slugs),
              content: ((): string | null => {
                const c = raw.content;
                const str = getLocalizedString(c);
                return str || (typeof c === 'string' ? c : null);
              })(),
              featured_image: raw.featured_image ? String(raw.featured_image) : null,
              tags: Array.isArray(raw.tags) ? raw.tags : [],
              meta_description: ((): string | null => {
                const md = getLocalizedString(raw.meta_description);
                return md || null;
              })(),
              author: {
                id: raw.author?.id ? String(raw.author.id) : '0',
                first_name: raw.author?.first_name || '',
                last_name: raw.author?.last_name || ''
              },
              date_created: raw.date_created || new Date().toISOString(),
              category: raw.category?.name ? { id: raw.category.id ? String(raw.category.id) : '0', name: raw.category.name } : undefined,
            };
            return {
              ...normalizedPost,
              reading_time: calculateReadingTime(normalizedPost.content)
            };
          });
          setPosts(normalized);
        } else {
          setError('No posts found.');
        }

        if (tagsResponse && tagsResponse.data) {
          setPostTags(tagsResponse.data as PostTag[]);
        }
      } catch (err: any) {
        console.groupCollapsed('%cBlog data fetch failed', 'color:#b45309');
        console.error('Reason:', err?.message || err);
        if (err && typeof err === 'object') {
          if (err.endpoint || err.url || err.status) {
            console.table([{ endpoint: err.endpoint, url: err.url, status: err.status }]);
            if (err.details) console.debug('Details:', err.details);
          }
        }
        console.groupEnd();
        console.warn('⚠️ Using fallback data due to API failure');
        
        // Use fallback data when API is completely unavailable
        setPosts(fallbackPosts.data as unknown as Post[]);
        setPostTags(fallbackTags.data as PostTag[]);
        setError(null); // Clear error since we have fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = posts.map(post => post.category?.name).filter(Boolean);
    return ['all', ...Array.from(new Set(cats))];
  }, [posts]);

  // Helper function to extract text from multilingual objects
  const getText = (v: string | object | null | undefined) => {
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object' && 'en' in v) return (v as any).en || '';
    return '';
  };

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    const safeLower = (v: string | object | null | undefined) => {
      if (typeof v === 'string') return v.toLowerCase();
      if (v && typeof v === 'object' && 'en' in v) return (v as any).en?.toLowerCase() || '';
      return '';
    };
    let filtered = posts.filter(post => {
      const matchesSearch = safeLower(post.titles).includes(safeLower(searchQuery)) ||
                           safeLower(post.meta_description).includes(safeLower(searchQuery)) ||
                           safeLower(post.content || '').includes(safeLower(searchQuery));
      const matchesCategory = selectedCategory === 'all' || post.category?.name === selectedCategory;
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(selectedTag => 
                           post.tags.some(tag => tag?.post_tags_id?.name === selectedTag)
                         );
      return matchesSearch && matchesCategory && matchesTags;
    });

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date_created).getTime() - new Date(a.date_created).getTime();
        case 'oldest':
          return new Date(a.date_created).getTime() - new Date(b.date_created).getTime();
        case 'title':
          return (a.titles || '').localeCompare(b.titles || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [posts, searchQuery, selectedCategory, selectedTags, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage);
  const paginatedPosts = filteredAndSortedPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  if (loading) {
    return (
      <div className="bg-[#e7cfb1] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-8">
          {/* Animated Logo */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6B3F1D] to-[#8B4513] rounded-full flex items-center justify-center shadow-elegant mx-auto animate-pulse">
              <span className="text-white font-bold text-2xl font-display">S</span>
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-[#6B3F1D] to-[#8B4513] rounded-full animate-ping opacity-20"></div>
          </div>
          
          {/* Loading Text */}
          <div className="space-y-4">
            <h2 className="font-display text-3xl md:text-4xl text-[#1a0f0a]">
              Loading Articles
            </h2>
            <p className="font-body text-lg text-[#1a0f0a]/70">
              Fetching the latest insights...
            </p>
          </div>
          
          {/* Loading Dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-[#6B3F1D] rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-[#6B3F1D] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-[#6B3F1D] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#e7cfb1] min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center px-4">
          <Card className="p-8 md:p-12 bg-[#e7cfb1] border-[#6B3F1D]/20 shadow-elegant">
            <CardContent className="space-y-8">
              {/* Error Icon */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-elegant mx-auto">
                  <span className="text-white text-4xl">⚠️</span>
                </div>
                <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-ping opacity-20"></div>
              </div>
              
              {/* Error Content */}
              <div className="space-y-4">
                <h1 className="font-display text-3xl md:text-4xl text-[#1a0f0a]">
                  Oops! Something went wrong
                </h1>
                <p className="font-body text-lg text-[#1a0f0a]/70">
                  We're having trouble loading the articles right now.
                </p>
                <div className="bg-[#6B3F1D]/10 border border-[#6B3F1D]/20 rounded-lg p-4">
                  <p className="font-body text-sm text-[#6B3F1D] font-medium">
                    {error}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-[#6B3F1D] hover:bg-[#8B4513] text-white font-body px-8 py-3"
                >
                  Try Again
                </Button>
                <Button 
                  variant="hero-outline"
                  onClick={() => window.location.href = '/'}
                  className="border-[#6B3F1D]/30 text-[#6B3F1D] hover:bg-[#6B3F1D]/10 font-body px-8 py-3"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#e7cfb1] min-h-screen">
      {/* Hero Sliver Section */}
      <div className="relative min-h-[450px] md:min-h-[550px] lg:min-h-[650px] flex items-center overflow-hidden"
        style={{
          clipPath: 'ellipse(120% 70% at 50% 0%)'
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
          {/* Strandly Brown overlay */}
          <div className="absolute inset-0 bg-[#6B3F1D]/80" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white drop-shadow-2xl font-prata">
              Our Blog
            </h1>
            <p className="text-lg md:text-xl text-[#F5F0E8] mb-8 max-w-2xl mx-auto drop-shadow-lg">
              Discover insights, tips, and stories from our team. Stay updated with the latest trends and best practices in afro hair care.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-[#F5F0E8]/80">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>{posts.length} Articles</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Updated Weekly</span>
              </div>
            </div>
          </div>
        </div>
      </div>

       <div className="py-0 -mt-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="pl-10 h-12 text-lg bg-background border-[#6B3F1D]/30 focus:border-[#6B3F1D] focus:ring-[#6B3F1D] text-[#6B3F1D]"
                />
              </div>
            </div>

            {/* Controls Bar */}
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters((s) => !s)}
                  className="text-[#6B3F1D] border-[#6B3F1D]/30 hover:bg-[#6B3F1D]/10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`transition-all duration-300 ${
                    viewMode === "grid" 
                      ? "bg-[#6B3F1D] text-white hover:bg-[#8B4513]" 
                      : "text-[#6B3F1D] border-[#6B3F1D]/30 hover:bg-[#6B3F1D]/10"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`transition-all duration-300 ${
                    viewMode === "list" 
                      ? "bg-[#6B3F1D] text-white hover:bg-[#8B4513]" 
                      : "text-[#6B3F1D] border-[#6B3F1D]/30 hover:bg-[#6B3F1D]/10"
                  }`}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>

            {/* Content Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              {showFilters && (
                <div className="w-full lg:w-80 flex-shrink-0 mb-6 lg:mb-0">
                  <Card className="sticky top-8 bg-[#e7cfb1] border-[#6B3F1D]/30 shadow-elegant">
                    <CardHeader 
                      className="cursor-pointer hover:bg-[#6B3F1D]/5 transition-colors duration-200 rounded-t-lg"
                      onClick={() => setShowFilters(false)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-display text-[#6B3F1D]">Filters</CardTitle>
                        <ChevronUp className="h-5 w-5 text-[#6B3F1D]" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Category Filter */}
                      <div className="space-y-3">
                        <label className="text-[#6B3F1D] font-medium">Categories</label>
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <Button
                              key={category}
                              variant={selectedCategory === category ? "default" : "ghost"}
                              onClick={() => setSelectedCategory(category)}
                              className={`w-full justify-start capitalize ${
                                selectedCategory === category 
                                  ? "bg-[#6B3F1D] text-white hover:bg-[#8B4513]" 
                                  : "text-[#6B3F1D] hover:bg-[#6B3F1D]/10"
                              }`}
                            >
                              {category}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Tag Filter Section */}
                      {postTags.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[#6B3F1D] font-medium">Filter by tags</label>
                            {selectedTags.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTags([])}
                                className="text-xs text-[#6B3F1D]/70 hover:text-[#6B3F1D] hover:bg-[#6B3F1D]/10"
                              >
                                Clear all
                              </Button>
                            )}
                          </div>
                          
                          {/* Tag Search */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B3F1D]/60 h-4 w-4" />
                            <Input
                              placeholder="Search tags..."
                              value={tagSearchQuery}
                              onChange={(e) => setTagSearchQuery(e.target.value)}
                              className="pl-10 h-10 bg-background border-[#6B3F1D]/30 focus:border-[#6B3F1D] text-[#6B3F1D]"
                            />
                          </div>
                          
                          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                            <div className="space-y-2">
                              {filteredTags.map((tag) => (
                                <button
                                  key={tag.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTags(prev => 
                                      prev.includes(tag.name) 
                                        ? prev.filter(t => t !== tag.name)
                                        : [...prev, tag.name]
                                    );
                                  }}
                                  className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                                    selectedTags.includes(tag.name)
                                      ? "bg-[#6B3F1D] text-white border-[#6B3F1D]"
                                      : "bg-background text-[#6B3F1D] border-[#6B3F1D]/30 hover:border-[#6B3F1D]/50"
                                  }`}
                                >
                                  {tag.name}
                                </button>
                              ))}
                            </div>
                            {filteredTags.length === 0 && tagSearchQuery && (
                              <div className="text-center text-[#6B3F1D]/60 py-4">
                                No tags found matching "{tagSearchQuery}"
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Sort */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-[#6B3F1D]">Sort by:</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                          className="w-full px-3 py-2 border border-[#6B3F1D]/30 rounded-md text-sm bg-background text-[#6B3F1D] focus:border-[#6B3F1D] focus:ring-[#6B3F1D]"
                        >
                          <option value="newest">Newest</option>
                          <option value="oldest">Oldest</option>
                          <option value="title">Title</option>
                        </select>
                      </div>

                      {/* Clear Filters */}
                      {(searchQuery || selectedCategory !== 'all' || selectedTags.length > 0) && (
                        <Button 
                          variant="outline"
                          className="w-full text-[#6B3F1D] border-[#6B3F1D]/30 hover:bg-[#6B3F1D]/10 font-body"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                            setSelectedTags([]);
                          }}
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Main Content */}
              <div className="flex-1 min-h-[600px]">
                {/* Results Header */}
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-[#6B3F1D]">
                        {filteredAndSortedPosts.length} of {posts.length} articles
                      </h2>
                      {(searchQuery || selectedCategory !== 'all' || selectedTags.length > 0) && (
                        <p className="text-sm text-[#6B3F1D]/70 mt-1">
                          {searchQuery && `Searching for "${searchQuery}"`}
                          {selectedCategory !== 'all' && ` • Category: ${selectedCategory}`}
                          {selectedTags.length > 0 && ` • Tags: ${selectedTags.join(', ')}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Posts Grid/List */}
                {paginatedPosts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold mb-2">No articles found</h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your search or filter criteria
                    </p>
                    <Button 
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedTags([]);
                      }}
                      className="bg-[#6B3F1D] text-white hover:bg-[#8B4513]"
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? (showFilters ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4')
                      : 'grid-cols-1 max-w-4xl mx-auto'
                  }`}>
                    {paginatedPosts.map((post) => (
                      <Link to={`/blog/${getText(post.slugs)}`} key={post.id} className="group">
                        <Card className={`h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-[#e7cfb1] border-[#6B3F1D]/30 ${
                          viewMode === 'list' ? 'flex-row' : ''
                        }`}>
                          {/* Featured Image */}
                          <div className={`relative overflow-hidden ${
                            viewMode === 'list' ? 'w-80 h-48' : 'h-48'
                          }`}>
                            {post.featured_image ? (
                              <img
                                src={getDirectusAssetUrl(post.featured_image, { width: 800, quality: 80, fit: 'cover', format: 'webp' })}
                                srcSet={buildSrcSet(post.featured_image, [400, 600, 800, 1200], { format: 'webp', quality: 80 }) || undefined}
                                sizes={viewMode === 'list' ? '(min-width: 1024px) 320px, 100vw' : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'}
                                alt={post.titles}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  // Fallback to original URL if Directus transformation fails
                                  const target = e.target as HTMLImageElement;
                                  if (target.src !== post.featured_image) {
                                    target.src = post.featured_image || '';
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-[#e7cfb1] flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-[#6B3F1D]" />
                              </div>
                            )}
                            <div className="absolute top-4 left-4">
                              {post.category && (
                                <Badge className="bg-[#6B3F1D]/10 text-[#6B3F1D] hover:bg-[#6B3F1D]/20 border-[#6B3F1D]/30">
                                  {post.category.name}
                                </Badge>
                              )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          <div className="flex-1 flex flex-col">
                            <CardHeader className="pb-2">
                              <CardTitle className="line-clamp-2 group-hover:text-[#8B4513] transition-colors duration-200 font-prata">
                                {getText(post.titles)}
                              </CardTitle>
                              
                              {/* Tags */}
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {post.tags
                                    .filter(tag => tag?.post_tags_id?.name)
                                    .slice(0, 3)
                                    .map((tag, index) => (
                                    <Badge key={tag.post_tags_id?.name || index} className="text-xs bg-[#6B3F1D] text-white hover:bg-[#8B4513] rounded-full px-3 py-1 font-medium">
                                      {tag.post_tags_id.name}
                                    </Badge>
                                  ))}
                                  {post.tags.filter(tag => tag?.post_tags_id?.name).length > 3 && (
                                    <Badge className="text-xs bg-[#e7cfb1] text-[#6B3F1D] border-[#6B3F1D]/30 hover:bg-[#6B3F1D]/10 rounded-full px-3 py-1 font-medium">
                                      +{post.tags.filter(tag => tag?.post_tags_id?.name).length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </CardHeader>

                            <CardContent className="flex-1 pb-1 min-h-[80px]">
                              <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                                {getText(post.meta_description) || (getText(post.content) ? getText(post.content).replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'No description available')}
                              </p>
                            </CardContent>

                            <CardFooter className="pt-3 pb-4">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarFallback className="text-xs bg-[#6B3F1D] text-white font-semibold">
                                      {post.author?.first_name?.[0]}{post.author?.last_name?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="text-sm min-w-0 flex-1">
                                    <p className="font-medium truncate">{post.author?.first_name} {post.author?.last_name}</p>
                                    <p className="text-muted-foreground text-xs">
                                      {new Date(post.date_created).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground flex-shrink-0">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{post.reading_time} min</span>
                                  </div>
                                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                                </div>
                              </div>
                            </CardFooter>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="bg-[#e7cfb1] border-[#6B3F1D]/30 text-[#6B3F1D] hover:bg-[#6B3F1D]/10 disabled:opacity-50"
                        >
                          Previous
                        </Button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 ${
                              currentPage === page 
                                ? "bg-[#6B3F1D] text-white hover:bg-[#8B4513]" 
                                : "bg-[#e7cfb1] border-[#6B3F1D]/30 text-[#6B3F1D] hover:bg-[#6B3F1D]/10"
                            }`}
                          >
                            {page}
                          </Button>
                        ))}
                        
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="bg-[#e7cfb1] border-[#6B3F1D]/30 text-[#6B3F1D] hover:bg-[#6B3F1D]/10 disabled:opacity-50"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
