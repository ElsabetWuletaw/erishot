export type FeaturedProject = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
};

export type GalleryPreviewItem = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  size: "wide" | "tall" | "standard";
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
};

export const featuredProjects: FeaturedProject[] = [
  {
    id: "wedding-film",
    title: "Golden Hour Vows",
    category: "Wedding Shoot",
    imageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "street-portrait",
    title: "City After Dark",
    category: "Street Photography",
    imageUrl:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "car-story",
    title: "Midnight Engine",
    category: "Car Photography",
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
  }
];

export const galleryPreviewItems: GalleryPreviewItem[] = [
  {
    id: "editorial-shadow",
    title: "Editorial Shadow",
    category: "Portraits",
    imageUrl:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    size: "tall"
  },
  {
    id: "reception-light",
    title: "Reception Light",
    category: "Events",
    imageUrl:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80",
    size: "wide"
  },
  {
    id: "open-road",
    title: "Open Road",
    category: "Cars",
    imageUrl:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    size: "standard"
  },
  {
    id: "quiet-vows",
    title: "Quiet Vows",
    category: "Weddings",
    imageUrl:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80",
    size: "standard"
  },
  {
    id: "green-hour",
    title: "Green Hour",
    category: "Nature",
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
    size: "wide"
  }
];

export const testimonials: Testimonial[] = [
  {
    id: "samira-wedding",
    name: "Samira H.",
    role: "Wedding Client",
    quote:
      "The photos felt like stills from a film. Every quiet moment, every look, every detail came back with emotion.",
    rating: 5
  },
  {
    id: "dawit-auto",
    name: "Dawit M.",
    role: "Automotive Shoot",
    quote:
      "Erishot made the car feel powerful without making the images loud. The lighting and edits were exactly the mood we wanted.",
    rating: 5
  },
  {
    id: "lina-event",
    name: "Lina T.",
    role: "Event Coverage",
    quote:
      "Professional, calm, and creative. We barely noticed the camera, but the final gallery captured everything beautifully.",
    rating: 5
  }
];
