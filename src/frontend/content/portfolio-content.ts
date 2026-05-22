export type PortfolioCategory = string;

export type PortfolioProject = {
  id: string;
  title: string;
  category: PortfolioCategory;
  rating: string;
  imageUrl: string;
  shootDate: string;
  description: string;
  tags: string[];
};

export type EditorialNote = {
  id: string;
  author: string;
  date: string;
  text: string;
};

export const portfolioCategoryOptions = [
  "Africa Night",
  "Animal",
  "Eritrea",
  "Weddings",
  "Street",
  "Cars",
  "Graduation",
  "Nature",
  "Portraits",
  "Sport",
  "Events",
  "Commercial"
] as const;

export const portfolioCategories: Array<"All" | PortfolioCategory> = [
  "All",
  ...portfolioCategoryOptions
];

export const ratingSummary = {
  label: "Critical Reception",
  score: "4.8",
  detail: "Technical Score / 2026",
  maxRating: 5
};

export const portfolioProjects: PortfolioProject[] = [
  {
    id: "golden-hour-vows",
    title: "Golden Hour Vows",
    category: "Weddings",
    rating: "4.9",
    imageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80",
    shootDate: "April 2026",
    description:
      "A warm wedding story built around quiet movement, late light, and intimate frames that feel pulled from a film still.",
    tags: ["Wedding", "Golden Hour", "Editorial", "Film Look"]
  },
  {
    id: "city-after-dark",
    title: "City After Dark",
    category: "Street",
    rating: "4.8",
    imageUrl:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1400&q=80",
    shootDate: "March 2026",
    description:
      "A street set shaped with heavy contrast, negative space, and city texture. The work leans raw, graphic, and observant.",
    tags: ["Street", "Night Mood", "Documentary", "Contrast"]
  },
  {
    id: "midnight-engine",
    title: "Midnight Engine",
    category: "Cars",
    rating: "4.8",
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
    shootDate: "February 2026",
    description:
      "An automotive editorial focused on metal, speed, and shadow. The grading balances grit with a polished commercial finish.",
    tags: ["Cars", "Automotive", "Chrome", "Commercial"]
  },
  {
    id: "final-walk",
    title: "Final Walk",
    category: "Graduation",
    rating: "4.7",
    imageUrl:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1400&q=80",
    shootDate: "January 2026",
    description:
      "A graduation story told through proud faces, movement, and small transitional details around a once-only day.",
    tags: ["Graduation", "Milestone", "Portrait", "Event"]
  },
  {
    id: "green-hour",
    title: "Green Hour",
    category: "Nature",
    rating: "4.6",
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
    shootDate: "December 2025",
    description:
      "A quiet nature sequence with deep greens, soft distance, and calm compositions made for breathing room.",
    tags: ["Nature", "Landscape", "Atmosphere", "Stillness"]
  },
  {
    id: "reception-light",
    title: "Reception Light",
    category: "Events",
    rating: "4.9",
    imageUrl:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80",
    shootDate: "November 2025",
    description:
      "Event coverage designed to feel present but never staged: faces, light, rooms, and reaction moments preserved with pace.",
    tags: ["Events", "Reception", "People", "Coverage"]
  },
  {
    id: "brand-noir",
    title: "Brand Noir",
    category: "Commercial",
    rating: "4.8",
    imageUrl:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80",
    shootDate: "October 2025",
    description:
      "A commercial visual set with a dark product mood, clean spacing, and brand frames that feel premium without shouting.",
    tags: ["Commercial", "Brand", "Product", "Campaign"]
  },
  {
    id: "quiet-vows",
    title: "Quiet Vows",
    category: "Weddings",
    rating: "4.9",
    imageUrl:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1400&q=80",
    shootDate: "September 2025",
    description:
      "A softer wedding edit centered on ceremony stillness, close gestures, and emotional restraint.",
    tags: ["Weddings", "Ceremony", "Soft Light", "Emotion"]
  }
];

export const editorialNotes: EditorialNote[] = [
  {
    id: "curator-note",
    author: "Curator_N1",
    date: "03.05.25 / 14:20:47",
    text:
      "The use of negative space in this series creates an almost claustrophobic sense of luxury. Compelling narrative work."
  },
  {
    id: "tech-review",
    author: "Tech Review",
    date: "03.04.25 / 09:32:11",
    text:
      "Unprecedented dynamic range in the automotive series. The color grading achieves a precise balance between grit and high fidelity."
  }
];
