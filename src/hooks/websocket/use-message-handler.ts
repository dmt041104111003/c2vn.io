import { useCallback } from 'react';
import { Comment } from '~/constants/comment';

interface WebSocketMessage {
  type: string;
  comment?: any;
  reply?: any;
  commentId?: string;
  message?: string;
  timestamp: string;
}

interface UseMessageHandlerProps {
  onNewComment?: (comment: Comment) => void;
  onNewReply?: (reply: Comment) => void;
  onCommentDeleted?: (commentId: string) => void;
  onCommentUpdated?: (comment: Comment) => void;
  onError?: (error: string) => void;
}

export function useMessageHandler({
  onNewComment,
  onNewReply,
  onCommentDeleted,
  onCommentUpdated,
  onError,
}: UseMessageHandlerProps) {
  const handleMessage = useCallback((message: WebSocketMessage) => {
    
    switch (message.type) {
      case 'connected':
        break;
      case 'pong':
        break;
        
      case 'new_comment':
        if (onNewComment && message.comment) {
          const comment: Comment = {
            id: message.comment.id,
            content: message.comment.content,
            userId: message.comment.userId,
            createdAt: message.comment.createdAt,
            user: message.comment.user,
            postId: message.comment.postId,
            parentCommentId: message.comment.parentCommentId,
            author: message.comment.user?.displayName || message.comment.user?.wallet || '',
            avatar: message.comment.user?.image || '',
            replies: [],
            isTemp: message.comment.isTemp || false,
          };
          onNewComment(comment);
        } else {
        }
        break;
        
      case 'new_reply':
        if (onNewReply && message.reply) {
          const reply: Comment = {
            id: message.reply.id,
            content: message.reply.content,
            userId: message.reply.userId,
            createdAt: message.reply.createdAt,
            user: message.reply.user,
            postId: message.reply.postId,
            parentCommentId: message.reply.parentCommentId,
            author: message.reply.user?.displayName || message.reply.user?.wallet || '',
            avatar: message.reply.user?.image || '',
            replies: [],
            isTemp: message.reply.isTemp || false,
            parentUserId: message.reply.parentComment?.userId,
            parentAuthor: message.reply.parentComment?.user?.displayName || message.reply.parentComment?.user?.name || message.reply.parentComment?.user?.wallet || 'Unknown',
          };
          onNewReply(reply);
        }
        break;
        
      case 'reply_updated':
        if (onCommentUpdated && message.reply) {
          const reply: Comment = {
            id: message.reply.id,
            content: message.reply.content,
            userId: message.reply.userId,
            createdAt: message.reply.createdAt,
            user: message.reply.user,
            postId: message.reply.postId,
            parentCommentId: message.reply.parentCommentId,
            author: message.reply.user?.displayName || message.reply.user?.wallet || '',
            avatar: message.reply.user?.image || '',
            replies: [],
            isTemp: message.reply.isTemp || false,
          };
          onCommentUpdated(reply);
        }
        break;
        
             case 'comment_deleted':
         if (onCommentDeleted && message.commentId) {
           onCommentDeleted(message.commentId);
         }
         break;
         
       case 'comment_deleted_sent':
         if (onCommentDeleted && message.commentId) {
           onCommentDeleted(message.commentId);
         }
         break;
        
      case 'comment_updated':
        if (onCommentUpdated && message.comment) {
          const comment: Comment = {
            id: message.comment.id,
            content: message.comment.content,
            userId: message.comment.userId,
            createdAt: message.comment.createdAt,
            user: message.comment.user,
            postId: message.comment.postId,
            parentCommentId: message.comment.parentCommentId,
            author: message.comment.user?.displayName || message.comment.user?.wallet || '',
            avatar: message.comment.user?.image || '',
            replies: [],
            isTemp: message.comment.isTemp || false,
          };
          onCommentUpdated(comment);
        }
        break;
        
      case 'comment_updated_sent':
        if (onCommentUpdated && message.comment) {
          const comment: Comment = {
            id: message.comment.id,
            content: message.comment.content,
            userId: message.comment.userId,
            createdAt: message.comment.createdAt,
            user: message.comment.user,
            postId: message.comment.postId,
            parentCommentId: message.comment.parentCommentId,
            author: message.comment.user?.displayName || message.comment.user?.wallet || '',
            avatar: message.comment.user?.image || '',
            replies: [],
            isTemp: message.comment.isTemp || false,
          };
          onCommentUpdated(comment);
        }
        break;
        
      case 'error':
        console.error('WebSocket server error:', message.message);
        onError?.(message.message || 'Unknown error');
        break;
        
      default:
    }
  }, [onNewComment, onNewReply, onCommentDeleted, onCommentUpdated, onError]);

  return { handleMessage };
}
