export const contactContent = {
  badge: "Contact Us",
  title: "Drop a note",
  description:
    "Feedback, questions, or story ideas — every note is read by a real person.",
  form: {
    namePlaceholder: "Your name",
    emailPlaceholder: "you@example.com",
    messagePlaceholder:
      "Tell us what you are reading, thinking, or proposing.",
    submitLabel: "Send message",
    submittingLabel: "Sending…",
  },
  validation: {
    nameMin: "Enter at least 2 characters.",
    emailInvalid: "Enter a valid email address.",
    messageMin:
      "Write at least 20 characters so your note feels clear.",
  },
  success: {
    title: "Message received.",
    description:
      "Your note has reached the editorial desk. We read everything and reply when we can.",
    cta: "Send another",
  },
  fallbackError:
    "Unable to send your message right now. Please try again.",
} as const;
