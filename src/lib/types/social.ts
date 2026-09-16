export interface SocialLink {
  id: string;        // required, must be unique
  platform: string;  // display name e.g. "LinkedIn"
  displayName: string;
  handle: string;    // e.g. "@fadlannoer"
  url: string;       // external URL
  icon: string;      // Simple Icons slug (lowercase) used as the /social card logo URL;
                    // falls back to the platform initial when the slug 404s
  description: string;
  stats: string;     // e.g. "500+ connections"
  category: string;  // "Tech & Code" | "Personal" | "Featured"
}