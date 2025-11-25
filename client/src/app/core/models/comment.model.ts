export interface Comment {
  _id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentApiResponse {
  success: boolean;
  data: Comment | Comment[];
  message?: string;
}
