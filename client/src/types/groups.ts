export enum GroupMembershipStatus {
  OWNED = "OWNED",
  PENDING = "PENDING",
  JOINED = "JOINED",
  NONE = "NONE",
}

export type GroupInfo = {
  groupId: number;
  name: string;
  description: string;
  tags: string[];
  groupImageURL: string;
  leaderId: number;
  leaderNickname: string;
  leaderProfileImageURL: string;
  myMemberShipStatus: GroupMembershipStatus;
  isAutoApproval: boolean;
  memberCount: number;
};
