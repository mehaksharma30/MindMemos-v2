export interface Post {
  _id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  tags: string[];
  isPublic: boolean;
  imageUrl?: string;
  likeCount: number;
  likedBy: string[];
  commentCount?: number;
  comments?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
