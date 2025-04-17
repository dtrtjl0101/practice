export type Comment = {
  id: number;
  author: string;
  content: string;
  createdDate: Date;
  updatedDate?: Date;
  edited?: boolean;
  stance?: "agree" | "disagree";
  parentId?: number;
  replied?: Comment[];
};
