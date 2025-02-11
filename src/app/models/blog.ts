export interface BlogPost {
  id: number;
  author: number;               // ID of the author
  username: string;             // Username of the author
  equipo: string | null;        // Team name (group), nullable
  title: string;                // Title of the post
  content: string;              // Full content of the post
  excerpt: string;              // First 200 characters of the content
  post_permissions: any;        // Permissions (you can refine this type)
  created_at: string;           // Date when the post was created
  likes_count: number;          // Number of likes
  comments_count: number;       // Number of comments    // Array of comments
}

export interface Comment {
  id: number;
  author: number;
  username: string;
  content: string;
  created_at: string;
}
