export type Post = {
  postId: number; // 자동으로 생성
  groupId: number; // url에서 가져옴
  activityId: number; // url에서 가져옴
  title: string;
  content: string;
  author: string; // header에서 자동으로 기
  createdDate: Date; // 서버에서 자동으로 기록
  updatedDate?: Date; // 서버에서 자동으로 기록
  isDebate: boolean;
};
