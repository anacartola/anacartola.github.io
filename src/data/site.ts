/** Global site constants + social links. Author fills the real handles. */
export const SITE = {
  domain: "anacartola.com",
  url: "https://anacartola.com",
  // {{ TODO: author — confirm/replace these }}
  email: "anacarolina.cartola@gmail.com",
  linkedin: "https://www.linkedin.com/in/{{ TODO: linkedin-handle }}",
  github: "https://github.com/{{ TODO: github-handle }}",
} as const;

export type SocialLink = { key: "email" | "linkedin" | "github"; href: string };

export const socialLinks: SocialLink[] = [
  { key: "email", href: `mailto:${SITE.email}` },
  { key: "linkedin", href: SITE.linkedin },
  { key: "github", href: SITE.github },
];
