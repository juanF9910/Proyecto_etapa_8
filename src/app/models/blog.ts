export interface BlogPost {
  liked_by: { id: number; username: string; }[];
  id: number;
  author: number;               // ID of the author
  username: string;             // Username of the author
  title: string;                // Title of the post
  content: string;              // Full content of the post
  excerpt: string;              // First 200 characters of the content
  public: string;              // Public or private post
  authenticated: string;       // Authenticated or not
  team: string;          // Team name (group), nullable
  owner: string;                // Owner of the post
  created_at: string;           // Date when the post was created
  updated_at: string;           // Date when the post was last updated
  likes_count: number;          // Number of likes
  comments_count: number;       // Number of comments    // Array of comments
  equipo: string | null;        // Team name (group), nullable
}

export interface BlogComment {
  id: number;
  post: number;
  username: string;
  content: string;
  created_at: string;
}

export interface BlogLikes{
  id: number;
  post: number;
  username: string;
  created_at: string;
}


export interface BlogLikesResponse {
  current_page: number;
  total_pages: number;
  total_count: number;
  next_page_url: string | null;
  previous_page_url: string | null;
  results: BlogLikes[];
}
