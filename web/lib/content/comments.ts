export type CommentItem = {
  id: string;
  author: string;
  role?: string;
  postedAt: string;
  chipLabel: string;
  body: string;
};

export const previewComments: readonly CommentItem[] = [
  {
    id: "comment-1",
    author: "Husaina A.",
    role: "Reader",
    postedAt: "2 hours ago",
    chipLabel: "Reader Note",
    body: "The pacing here feels intentional in the best way. The long-form layout gives each paragraph room to breathe instead of forcing the reading experience to compete with the interface.",
  },
  {
    id: "comment-2",
    author: "Murtaza S.",
    role: "Subscriber",
    postedAt: "Yesterday",
    chipLabel: "Loved This",
    body: "That pull quote lands well. It feels less like a social post and more like the kind of observation you stay with after closing the page.",
  },
  {
    id: "comment-3",
    author: "Zahra J.",
    role: "Guest Reader",
    postedAt: "This week",
    chipLabel: "Discussion",
    body: "Would love to see future issues keep this same editorial restraint. The calmer design makes the comments feel like part of the magazine instead of a noisy add-on.",
  },
];
