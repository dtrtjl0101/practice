export enum NotificationType {
  GROUP_JOIN_REQUEST = "GROUP_JOIN_REQUEST",
  GROUP_JOIN_APPROVED = "GROUP_JOIN_APPROVED",
  GROUP_JOIN_REJECTED = "GROUP_JOIN_REJECTED",
  PUBLISHER_JOIN_REQUEST = "PUBLISHER_JOIN_REQUEST",
  PUBLISHER_APPROVED = "PUBLISHER_APPROVED",
  PUBLISHER_REJECTED = "PUBLISHER_REJECTED",
  DISCUSSION_COMMENT = "DISCUSSION_COMMENT",
  COMMENT_REPLY = "COMMENT_REPLY",
  HIGHLIGHT_COMMENT = "HIGHLIGHT_COMMENT",
  HIGHLIGHT_COMMENT_REPLY = "HIGHLIGHT_COMMENT_REPLY",
  GROUP_BANNED = "GROUP_BANNED",
}

type NotificationCommon = {
  id: number;
  createdAt: string;
  isRead: boolean;
  message: string;
};

export type Notification =
  | (NotificationCommon & {
      type: NotificationType.GROUP_JOIN_REQUEST;
      receiverId: number;
      senderId: number;
      senderNickname: string;
      groupId: number;
      groupName: string;
    })
  | (NotificationCommon & {
      type: NotificationType.GROUP_JOIN_APPROVED;
      receiverId: number;
      senderId: number;
      groupId: number;
      groupName: string;
    })
  | (NotificationCommon & {
      type: NotificationType.GROUP_JOIN_REJECTED;
      receiverId: number;
      senderId: number;
      groupId: number;
      groupName: string;
    })
  | (NotificationCommon & {
      type: NotificationType.PUBLISHER_JOIN_REQUEST;
      receiverId?: number;
      senderId: number;
      publisherId: number;
      publisherName: string;
    })
  | (NotificationCommon & {
      type: NotificationType.PUBLISHER_APPROVED;
      receiverId: number;
      senderId?: number;
      publisherId: number;
      publisherName: string;
    })
  | (NotificationCommon & {
      type: NotificationType.PUBLISHER_REJECTED;
      receiverId?: number;
      senderId: number;
      publisherId: number;
      publisherName: string;
    })
  | (NotificationCommon & {
      type: NotificationType.DISCUSSION_COMMENT;
      receiverId: number;
      senderId: number;
      senderNickname: string;
      discussionId: number;
      discussionTitle: string;
    })
  | (NotificationCommon & {
      type: NotificationType.COMMENT_REPLY;
      receiverId: number;
      senderId: number;
      senderNickname: string;
      discussionId: number;
      discussionTitle: string;
      discussionCommentId: number;
      discussionCommentContent: string;
    })
  | (NotificationCommon & {
      type: NotificationType.HIGHLIGHT_COMMENT;
      receiverId: number;
      senderId: number;
      senderNickname: string;
      highlightId: number;
      highlightMemo: string;
    })
  | (NotificationCommon & {
      type: NotificationType.HIGHLIGHT_COMMENT_REPLY;
      receiverId: number;
      senderId: number;
      senderNickname: string;
      highlightId: number;
      highlightMemo: string;
    })
  | (NotificationCommon & {
      type: NotificationType.GROUP_BANNED;
      receiverId: number;
      senderId: number;
      groupId: number;
      groupName: string;
      message: string;
    });
