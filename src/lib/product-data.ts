const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?w=800&q=80`;

export interface ProductData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  scentNotes: { top: string[]; heart: string[]; base: string[] };
  concentration: string;
  volume: number;
  gender: "male" | "female" | "unisex";
  brand: string;
  category: string;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
}

export interface TestUserData {
  email: string;
  name: string;
  password: string;
  role: "admin" | "customer" | "staff";
  phone: string;
}

export const products: ProductData[] = [
  {
    name: "Noir de Nuit",
    description: "An intoxicating blend of dark bergamot, black rose, and smoked amber. This enigmatic fragrance captures the mystery of midnight rendezvous with layers of velvety iris and aged patchouli. A scent for those who embrace the night.",
    price: 2850, originalPrice: 3400,
    images: [unsplash("photo-1541643600914-78b084683601"), unsplash("photo-1588405748880-12d1d2a59f75")],
    scentNotes: { top: ["Dark Bergamot", "Black Pepper", "Cypress"], heart: ["Black Rose", "Iris Absolute", "Jasmine Sambac"], base: ["Smoked Amber", "Aged Patchouli", "Vanilla Bourbon", "Oud"] },
    concentration: "Eau de Parfum", volume: 100, gender: "unisex", brand: "Kartel", category: "Eau de Parfum", stock: 25, isFeatured: true, isActive: true,
  },
  {
    name: "Lumière d'Or",
    description: "A radiant composition of golden osmanthus, sun-warmed honey, and white musk. Like the first light of dawn filtering through silk curtains, this fragrance glows with warmth and understated luxury.",
    price: 3500,
    images: [unsplash("photo-1592945403244-b3fbafd7f539"), unsplash("photo-1563170351-be82bc888aa4")],
    scentNotes: { top: ["Bergamot", "Golden Osmanthus", "Pink Grapefruit"], heart: ["Sun-Warmed Honey", "Orange Blossom", "Ylang-Ylang"], base: ["White Musk", "Sandalwood", "Tonka Bean"] },
    concentration: "Extrait de Parfum", volume: 50, gender: "female", brand: "Kartel", category: "Extrait de Parfum", stock: 15, isFeatured: true, isActive: true,
  },
  {
    name: "Cèdre & Sel",
    description: "A minimalist masterpiece blending Atlas cedar with sea salt and dry vetiver. Evoking windswept coastlines and weathered driftwood, this scent is an ode to raw, elemental beauty.",
    price: 2450,
    images: [unsplash("photo-1615634260167-c8cdede054de"), unsplash("photo-1557178989-4b24f0601cd0")],
    scentNotes: { top: ["Sea Salt", "Grapefruit Zest", "Juniper Berry"], heart: ["Atlas Cedar", "Clary Sage", "Lavender"], base: ["Dry Vetiver", "Moss", "Ambroxan"] },
    concentration: "Eau de Parfum", volume: 100, gender: "male", brand: "Kartel", category: "Eau de Parfum", stock: 30, isFeatured: true, isActive: true,
  },
  {
    name: "Rose Apocryphe",
    description: "An unconventional rose fragrance that subverts expectations. Centuries-old damask rose meets tart raspberry, dark chocolate, and a whisper of incense. Rebellious, sophisticated, unforgettable.",
    price: 3200,
    images: [unsplash("photo-1608571423902-eed4a5ad8108"), unsplash("photo-1619995745882-2197257e6d1a")],
    scentNotes: { top: ["Raspberry", "Pink Pepper", "Bergamot"], heart: ["Damask Rose", "Dark Chocolate", "Saffron"], base: ["Incense", "Labdanum", "Cedarwood", "Musk"] },
    concentration: "Eau de Parfum", volume: 75, gender: "female", brand: "Kartel", category: "Eau de Parfum", stock: 20, isFeatured: true, isActive: true,
  },
  {
    name: "Bois de Santal",
    description: "Pure Mysore sandalwood elevated with creamy fig milk and soft suede. A study in texture and warmth, this fragrance wraps the wearer in an embrace of unparalleled comfort and sensuality.",
    price: 3950,
    images: [unsplash("photo-1594282486552-05b4d80fbb9f"), unsplash("photo-1590736969955-71cc9490114f")],
    scentNotes: { top: ["Fig Leaf", "Cardamom", "Mandarin"], heart: ["Mysore Sandalwood", "Fig Milk", "Heliotrope"], base: ["Soft Suede", "Cashmeran", "Benzoin"] },
    concentration: "Extrait de Parfum", volume: 50, gender: "unisex", brand: "Kartel", category: "Extrait de Parfum", stock: 12, isFeatured: true, isActive: true,
  },
  {
    name: "Ambre Nuit",
    description: "A nocturnal amber of exceptional depth. Madagascan vanilla, copal resin, and a rare ambergris accord create a luminous darkness that dances on the skin like candlelight.",
    price: 2750,
    images: [unsplash("photo-1612282130102-8920f98ba542"), unsplash("photo-1571781926291-c477ebfd024b")],
    scentNotes: { top: ["Cinnamon", "Coriander", "Saffron"], heart: ["Madagascan Vanilla", "Copal Resin", "Jasmine"], base: ["Ambergris Accord", "Benzoin", "Leather", "Musk"] },
    concentration: "Eau de Parfum", volume: 100, gender: "unisex", brand: "Kartel", category: "Eau de Parfum", stock: 18, isFeatured: true, isActive: true,
  },
  {
    name: "Vétiver Sauvage",
    description: "Wild Haitian vetiver rooted in earthy vetiver with bursts of green mandarin and blackcurrant bud. A verdant, electric fragrance that crackles with the energy of untouched landscapes.",
    price: 2300,
    images: [unsplash("photo-1567721913486-6585f069b332"), unsplash("photo-1620916566398-39f1143ab7be")],
    scentNotes: { top: ["Green Mandarin", "Blackcurrant Bud", "Lemon"], heart: ["Haitian Vetiver", "Neroli", "Bamboo"], base: ["Oakmoss", "White Cedar", "Ambroxan"] },
    concentration: "Eau de Parfum", volume: 100, gender: "male", brand: "Kartel", category: "Eau de Parfum", stock: 22, isFeatured: true, isActive: true,
  },
  {
    name: "Iris Poudré",
    description: "The softest whisper of Florentine iris, violet-like orris butter, and clean linen musk. A masterclass in subtlety, this fragrance is for those who appreciate the art of quiet elegance.",
    price: 4200,
    images: [unsplash("photo-1600857544200-b2b66576aefd"), unsplash("photo-1587017539504-67cfbddac569")],
    scentNotes: { top: ["Violet Leaf", "Aldehydes", "Pear"], heart: ["Florentine Iris", "Orris Butter", "Heliotrope"], base: ["Linen Musk", "Rice Powder", "Sandalwood"] },
    concentration: "Extrait de Parfum", volume: 50, gender: "female", brand: "Kartel", category: "Extrait de Parfum", stock: 10, isFeatured: true, isActive: true,
  },
  {
    name: "Tabac Noir",
    description: "A dark, smoky ode to fine tobacco leaf, leather-bound books, and aged rum. This rich composition evokes wood-paneled libraries and late-night conversations by the fire.",
    price: 3100,
    images: [unsplash("photo-1586486855515-0c2e3926baee"), unsplash("photo-1608248549293-de4b2cc9d2c0")],
    scentNotes: { top: ["Rum", "Tobacco Leaf", "Prune"], heart: ["Leather", "Cacao", "Labdanum"], base: ["Dark Musk", "Cedarwood", "Benzoin"] },
    concentration: "Eau de Parfum", volume: 75, gender: "male", brand: "Kartel", category: "Eau de Parfum", stock: 14, isFeatured: true, isActive: true,
  },
  {
    name: "Fleur de Sel",
    description: "A coastal fantasy capturing the spray of the Mediterranean on sun-warmed skin. Bright citrus, salty breeze, and the soft floral veil of sea daffodils create an air of effortless summer.",
    price: 2600,
    images: [unsplash("photo-1608571330737-8555171e9523"), unsplash("photo-1608248543637-3a1e5f1b7852")],
    scentNotes: { top: ["Lemon Zest", "Sea Salt", "Bergamot"], heart: ["Sea Daffodil", "Jasmine", "Fig Leaf"], base: ["Driftwood", "White Musk", "Ambergris"] },
    concentration: "Eau de Parfum", volume: 100, gender: "unisex", brand: "Kartel", category: "Eau de Parfum", stock: 28, isFeatured: false, isActive: true,
  },
  {
    name: "Cuir de Russie",
    description: "A bold tribute to the leather scents of the Russian steppes. Smoked birch tar, rich Russian leather, and a whisper of wild berries create a fragrance of untamed elegance.",
    price: 3800,
    images: [unsplash("photo-1541643600914-78b084683601"), unsplash("photo-1592945403244-b3fbafd7f539")],
    scentNotes: { top: ["Bergamot", "Blackcurrant", "Aldehydes"], heart: ["Russian Leather", "Birch Tar", "Clary Sage"], base: ["Amber", "Musk", "Cedar"] },
    concentration: "Extrait de Parfum", volume: 50, gender: "male", brand: "Kartel", category: "Extrait de Parfum", stock: 8, isFeatured: false, isActive: true,
  },
  {
    name: "Jasmin de Nuit",
    description: "A nocturnal jasmine harvest under a crescent moon. Star jasmine, tuberose, and a hint of green stem create an intoxicatingly natural white floral that blooms on the skin.",
    price: 2900,
    images: [unsplash("photo-1588405748880-12d1d2a59f75"), unsplash("photo-1563170351-be82bc888aa4")],
    scentNotes: { top: ["Green Notes", "Mandarin", "Neroli"], heart: ["Star Jasmine", "Tuberose", "Orange Blossom"], base: ["Musk", "Sandalwood", "Coconut"] },
    concentration: "Eau de Parfum", volume: 75, gender: "female", brand: "Kartel", category: "Eau de Parfum", stock: 16, isFeatured: false, isActive: true,
  },
  {
    name: "Oud Ébène",
    description: "The rarest oud from the ancient forests of Southeast Asia, layered with dark chocolate and black cardamom. A deeply meditative fragrance of extraordinary depth and complexity.",
    price: 5200, originalPrice: 6000,
    images: [unsplash("photo-1615634260167-c8cdede054de"), unsplash("photo-1608571423902-eed4a5ad8108")],
    scentNotes: { top: ["Black Cardamom", "Bergamot", "Saffron"], heart: ["Agarwood Oud", "Dark Chocolate", "Rose Absolute"], base: ["Amber", "Patchouli", "Sandalwood"] },
    concentration: "Extrait de Parfum", volume: 50, gender: "unisex", brand: "Kartel", category: "Extrait de Parfum", stock: 6, isFeatured: true, isActive: true,
  },
  {
    name: "Bergamote Soleil",
    description: "Sun-drenched Calabrian bergamot meets creamy fig and white tea. A radiant, uplifting fragrance that captures the golden hour on a terrace overlooking the Mediterranean.",
    price: 2200,
    images: [unsplash("photo-1619995745882-2197257e6d1a"), unsplash("photo-1594282486552-05b4d80fbb9f")],
    scentNotes: { top: ["Calabrian Bergamot", "Lemon", "Petitgrain"], heart: ["Fig", "White Tea", "Iris"], base: ["Musk", "Cedar", "Rice Powder"] },
    concentration: "Eau de Parfum", volume: 100, gender: "unisex", brand: "Kartel", category: "Eau de Parfum", stock: 35, isFeatured: false, isActive: true,
  },
  {
    name: "Patchouli Intense",
    description: "A deep dive into the finest Sumatran patchouli, darkened with cocoa and leather. Earthy, hypnotic, and utterly compelling — this is patchouli reimagined for the modern connoisseur.",
    price: 2800,
    images: [unsplash("photo-1590736969955-71cc9490114f"), unsplash("photo-1612282130102-8920f98ba542")],
    scentNotes: { top: ["Grapefruit", "Black Pepper", "Calypsone"], heart: ["Sumatran Patchouli", "Cocoa", "Orris"], base: ["Leather", "Labdanum", "Musk"] },
    concentration: "Eau de Parfum", volume: 75, gender: "male", brand: "Kartel", category: "Eau de Parfum", stock: 19, isFeatured: false, isActive: true,
  },
  {
    name: "Néroli Sauvage",
    description: "Wild orange blossom picked at dawn from the Tunisian coastline. This luminous fragrance sparkles with bitter orange, honeyed neroli, and a sun-baked herbal backdrop.",
    price: 2400,
    images: [unsplash("photo-1571781926291-c477ebfd024b"), unsplash("photo-1567721913486-6585f069b332")],
    scentNotes: { top: ["Bitter Orange", "Petitgrain", "Citron"], heart: ["Tunisian Neroli", "Orange Blossom", "Honey"], base: ["Musk", "Amber", "Oakmoss"] },
    concentration: "Eau de Parfum", volume: 100, gender: "unisex", brand: "Kartel", category: "Eau de Parfum", stock: 24, isFeatured: false, isActive: true,
  },
  {
    name: "Encens Mystique",
    description: "Sacred frankincense from Oman intertwined with myrrh and copal. An atmospheric, cathedral-like fragrance that evokes ancient rituals and quiet contemplation in stone halls.",
    price: 3600,
    images: [unsplash("photo-1620916566398-39f1143ab7be"), unsplash("photo-1600857544200-b2b66576aefd")],
    scentNotes: { top: ["Lemon", "Pink Pepper", "Coriander"], heart: ["Omani Frankincense", "Myrrh", "Copal"], base: ["Cedar", "Musk", "Vanilla"] },
    concentration: "Extrait de Parfum", volume: 50, gender: "unisex", brand: "Kartel", category: "Extrait de Parfum", stock: 11, isFeatured: true, isActive: true,
  },
  {
    name: "Musc Blanc",
    description: "The purest expression of white musk — clean, luminous, and impossibly soft. Like freshly laundered linen dried in mountain air, this is minimalism at its most luxurious.",
    price: 2100,
    images: [unsplash("photo-1587017539504-67cfbddac569"), unsplash("photo-1586486855515-0c2e3926baee")],
    scentNotes: { top: ["Aldehydes", "Pear", "Bergamot"], heart: ["White Musk", "Heliotrope", "Lily of the Valley"], base: ["Musk", "Sandalwood", "Ambroxan"] },
    concentration: "Eau de Parfum", volume: 100, gender: "female", brand: "Kartel", category: "Eau de Parfum", stock: 40, isFeatured: false, isActive: true,
  },
  {
    name: "Épice Rare",
    description: "A journey along the ancient spice routes. Cardamom, cinnamon, and cloves meet the warmth of amber and the sweetness of Madagascar vanilla. Exotic, warm, and endlessly fascinating.",
    price: 2700,
    images: [unsplash("photo-1608248549293-de4b2cc9d2c0"), unsplash("photo-1608571330737-8555171e9523")],
    scentNotes: { top: ["Cardamom", "Cinnamon", "Clove"], heart: ["Saffron", "Nutmeg", "Cumin"], base: ["Madagascan Vanilla", "Amber", "Cedar"] },
    concentration: "Eau de Parfum", volume: 75, gender: "unisex", brand: "Kartel", category: "Eau de Parfum", stock: 17, isFeatured: false, isActive: true,
  },
  {
    name: "Fleur d'Oranger",
    description: "A magnificent orange blossom soliflore that captures every facet of this beloved flower — from the honeyed sweetness of the petals to the green bite of the leaves and the woody warmth of the branch.",
    price: 2600,
    images: [unsplash("photo-1608248543637-3a1e5f1b7852"), unsplash("photo-1541643600914-78b084683601")],
    scentNotes: { top: ["Orange Blossom", "Bergamot", "Green Notes"], heart: ["Neroli", "Jasmine", "Honey"], base: ["Musk", "Sandalwood", "Amber"] },
    concentration: "Eau de Parfum", volume: 75, gender: "female", brand: "Kartel", category: "Eau de Parfum", stock: 21, isFeatured: true, isActive: true,
  },
];

export const testUsers: TestUserData[] = [
  { email: "admin@kartel.com", name: "Helene Voss", password: "TestAdmin123!", role: "admin", phone: "+233-20-000-0001" },
  { email: "staff@kartel.com", name: "Marcus Chen", password: "TestStaff123!", role: "staff", phone: "+233-20-000-0002" },
  { email: "customer@kartel.com", name: "Isabelle Moreau", password: "TestCustomer123!", role: "customer", phone: "+233-20-000-0003" },
];
