import homeImage from "@/homeImage.webp";

export type IssueRichTextSpan = {
  text: string;
  bold?: boolean;
  italic?: boolean;
};

export type IssueBodyBlock =
  | {
      type: "heading";
      level: 2 | 3;
      content: IssueRichTextSpan[];
    }
  | {
      type: "paragraph";
      content: IssueRichTextSpan[];
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

export const issueOneArticle = {
  title: "The Quiet Return Of Intentional Reading",
  issueNumber: 1,
  publishedAt: "January 15, 2026",
  isoPublishedAt: "2026-01-15T09:00:00.000Z",
  author: "Editorial Desk",
  slug: "issue-1",
  summary:
    "A long-form editorial opening on why better digital magazines are built through pacing, restraint, and attention-friendly design.",
  coverImageUrl: homeImage.src,
  coverImageAlt:
    "Issue 1 cover image framed as a premium editorial magazine cover.",
  body: [
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
        {
          text: ". The strongest new magazines are rediscovering what happens when interface design protects the reading experience instead of competing with it."
        }
      ]
    },
    {
      type: "paragraph",
      content: [
        {
          text: "The shift is subtle but important. Readers are not only responding to better stories; they are responding to better conditions for reading those stories. Spacious layouts, typographic confidence, and controlled visual rhythm all matter."
        }
      ]
    },
    {
      type: "image",
      imageUrl:
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1400/samples/landscapes/nature-mountains.jpg",
      alt: "Mountain landscape used as an editorial break in the article.",
      caption: "Visual pauses help long-form writing breathe."
    },
    {
      type: "heading",
      level: 3,
      content: [{ text: "Design That Makes Attention Possible" }]
    },
    {
      type: "paragraph",
      content: [
        {
          text: "A well-made magazine interface signals confidence by refusing to shout. It gives hierarchy to the headline, clarity to the supporting copy, and enough calm around images and quotations that the structure becomes legible at a glance."
        }
      ]
    },
    {
      type: "pullQuote",
      quote:
        "Good magazine design does not compete with the story. It builds the conditions for attention.",
      attribution: "Issue 1 editorial note"
    },
    {
      type: "paragraph",
      content: [
        {
          text: "That editorial restraint is also what makes a smaller MVP feel coherent. One issue can feel complete if the surrounding experience is thoughtfully composed: discover the publication, understand its point of view, read the story, then decide whether to subscribe."
        }
      ]
    },
    {
      type: "paragraph",
      content: [
        {
          text: "The result is not nostalgic print simulation. It is a digital reading experience that accepts the web for what it is while still insisting on pacing, comfort, and a sense of occasion."
        }
      ]
    }
  ] satisfies IssueBodyBlock[]
} as const;
