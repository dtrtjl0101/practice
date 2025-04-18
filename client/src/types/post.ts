export type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  createdDate: Date;
  isDebate: boolean;
};

export const initialPosts: Post[] = [
  {
    id: 1,
    title: "첫 번째 글",
    content: "이것은 첫 번째 게시글의 내용입니다.",
    author: "김인성",
    createdDate: new Date(2025, 3, 1),
    isDebate: true,
  },
  {
    id: 2,
    title: "두 번째 글",
    content: "이것은 두 번째 게시글의 내용입니다.",
    author: "박원민",
    createdDate: new Date(2025, 3, 12),
    isDebate: false,
  },
  {
    id: 3,
    title: "세 번째 글",
    content: "이것은 세 번째 게시글의 내용입니다.",
    author: "고종환",
    createdDate: new Date(2025, 4, 1),
    isDebate: false,
  },
];

export function formattedDate(date: Date) {
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  return formattedDate;
}
