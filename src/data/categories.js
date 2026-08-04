export const categories = [
  {
    id: 'design-printing',
    name: 'Design & Printing',
    slug: 'design-printing',
    icon: 'Print',
    color: '#CC0000',
    subcategories: [
      { id: 'flyers', name: 'Flyers', slug: 'flyers' },
      { id: 'business-cards', name: 'Business Cards', slug: 'business-cards' },
      { id: 'resumes', name: 'Resumes / CVs', slug: 'resumes' },
      { id: 'instagram-posters', name: 'Instagram Posters', slug: 'instagram-posters' },
      { id: 'wedding-cards', name: 'Wedding Cards', slug: 'wedding-cards' },
      { id: 'brochures', name: 'Brochures', slug: 'brochures' },
      { id: 'banners', name: 'Banners', slug: 'banners' },
      { id: 'certificates', name: 'Certificates', slug: 'certificates' },
      { id: 'letterheads', name: 'Letter Heads', slug: 'letterheads' },
      { id: 'id-cards', name: 'ID Cards', slug: 'id-cards' },
    ],
  },
  {
    id: 'software-development',
    name: 'Software Development',
    slug: 'software-development',
    icon: 'Code',
    color: '#1A1A2E',
    subcategories: [
      { id: 'web-applications', name: 'Web Applications', slug: 'web-applications' },
      { id: 'mobile-applications', name: 'Mobile Applications', slug: 'mobile-applications' },
      { id: 'ecommerce', name: 'E-commerce Solutions', slug: 'ecommerce' },
      { id: 'ui-ux', name: 'UI/UX Design', slug: 'ui-ux' },
      { id: 'logo-design', name: 'Logo Design', slug: 'logo-design' },
      { id: 'seo-marketing', name: 'SEO & Digital Marketing', slug: 'seo-marketing' },
    ],
  },
];

export const navCategories = [
  { name: 'Flyers', slug: 'flyers', category: 'design-printing' },
  { name: 'Business Cards', slug: 'business-cards', category: 'design-printing' },
  { name: 'Wedding Cards', slug: 'wedding-cards', category: 'design-printing' },
  { name: 'Resumes', slug: 'resumes', category: 'design-printing' },
  { name: 'Instagram Posters', slug: 'instagram-posters', category: 'design-printing' },
  { name: 'Web Apps', slug: 'web-applications', category: 'software-development' },
  { name: 'Mobile Apps', slug: 'mobile-applications', category: 'software-development' },
];
