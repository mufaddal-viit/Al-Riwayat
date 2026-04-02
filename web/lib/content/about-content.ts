export const aboutStory = {
  eyebrow: "About Us",
  title: "A magazine built for readers who still want depth.",
  introduction:
    "Magazine is designed around deliberate reading rather than constant interruption. The publication moves slowly on purpose, pairing strong editorial framing with layouts that leave space for reflection.",
  paragraphs: [
    "The project began as a response to how much digital publishing now feels optimized for speed rather than substance. We wanted a format that still felt contemporary, but one that restored pacing, hierarchy, and trust.",
    "That means each issue is treated like a composed reading object. The homepage introduces one clear editorial direction. The article view uses a narrow, comfortable measure. Supporting pages remain direct and uncluttered.",
    "For an MVP, the goal is not maximal volume. It is a cohesive reading loop: discover the issue, understand the publication, and respond through subscription or contact."
  ],
  sideNote:
    "The interface is part of the editorial voice. Every spacing decision, image frame, and transition should make the reading experience feel calmer, not louder.",
  imageUrl:
    "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1200/samples/coffee.jpg"
} as const;

export const editorialTeam = [
  {
    name: "Amina Rahal",
    role: "Editor in Chief",
    bio: "Shapes the publication's voice, long-form direction, and editorial standards.",
    imageUrl:
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_900/samples/people/boy-snow-hoodie.jpg"
  },
  {
    name: "Daniel Mercer",
    role: "Features Editor",
    bio: "Develops issue structure and commissions essays with a strong narrative point of view.",
    imageUrl:
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_900/samples/people/jazz.jpg"
  },
  {
    name: "Nadia Karim",
    role: "Visual Editor",
    bio: "Builds the publication's image rhythm, cover treatments, and photo-led pacing.",
    imageUrl:
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_900/samples/people/kitchen-bar.jpg"
  }
] as const;
