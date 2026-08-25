export interface SocialLink {
  id: string;        // required, must be unique
  platform: string;  // display name e.g. "LinkedIn"
  displayName: string;
  handle: string;    // e.g. "@fadlannoer"
  url: string;       // external URL
  icon: string;      // Lucide icon component name (PascalCase)
  description: string;
  stats: string;     // e.g. "500+ connections"
  category: string;  // "Tech & Code" | "Personal" | "Featured"
}