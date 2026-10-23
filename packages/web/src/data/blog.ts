export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  coverImage?: string;
  readingTime?: number;
}

export interface BlogMeta {
  totalPosts: number;
  tags: { name: string; count: number }[];
  recentPosts: Pick<BlogPost, 'slug' | 'title' | 'date'>[];
}

export interface BlogPostsProps {
  posts: BlogPost[];
  meta: BlogMeta;
}

export interface BlogPostProps {
  post: BlogPost;
  meta: BlogMeta;
}
