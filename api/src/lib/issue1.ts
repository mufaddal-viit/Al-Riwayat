export type RichTextSpan = {
  text: string;
  bold?: boolean;
  italic?: boolean;
};

export type MagazineBodyBlock =
  | {
      type: "heading";
      level: 2 | 3;
      content: RichTextSpan[];
    }
  | {
      type: "paragraph";
      content: RichTextSpan[];
    }
  | {
      type: "image";
      imageUrl: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "pullQuote";
      quote: string;
      attribution?: string;
    };

export const issue1Body: MagazineBodyBlock[] = [
  {
    type: "heading",
    level: 2,
    content: [{ text: "The Quiet Return Of Intentional Reading" }]
  },
  {
    type: "paragraph",
    content: [
      { text: "Digital publishing no longer has to mean " },
      { text: "short attention spans", bold: true },
      { text: ". The most compelling magazines on the web are rebuilding trust through deliberate pacing, strong editing, and a sense of place." }
    ]
  },
  {
    type: "paragraph",
    content: [
      { text: "This issue opens with a simple idea: readers stay longer when the interface gets out of the way. That means generous spacing, clear hierarchy, and moments of visual rest between dense passages." }
    ]
  },
  {
    type: "image",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1400/samples/landscapes/nature-mountains.jpg",
    alt: "A quiet mountain landscape used as an editorial divider image.",
    caption: "Visual pauses matter as much as the words around them."
  },
  {
    type: "heading",
    level: 3,
    content: [{ text: "A Magazine Can Feel Digital And Still Feel Human" }]
  },
  {
    type: "paragraph",
    content: [
      { text: "The modern editorial experience depends on restraint. A publication can be " },
      { text: "interactive", italic: true },
      { text: " without becoming noisy, and expressive without forcing every section into the same volume." }
    ]
  },
  {
    type: "pullQuote",
    quote: "Good magazine design does not compete with the story. It builds the conditions for attention.",
    attribution: "Issue 1 editorial note"
  },
  {
    type: "paragraph",
    content: [
      { text: "That principle shapes the rest of this MVP. The homepage highlights one issue instead of ten. The article page favors legibility over decoration. Forms are brief, direct, and respectful of the reader's time." }
    ]
  },
  {
    type: "paragraph",
    content: [
      { text: "The result is intentionally narrow in scope, but complete in flow: discover, read, subscribe, and respond. For an MVP, that clarity is more useful than breadth." }
    ]
  }
];

export const issue1MagazineSeed = {
  title: "Magazine",
  issueNumber: 1,
  slug: "issue-1",
  publishedAt: new Date("2026-01-15T09:00:00.000Z"),
  coverImageUrl: "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1600/sample.jpg",
  author: "Editorial Desk",
  body: issue1Body
};
