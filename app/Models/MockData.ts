export const mockEvents = [
  {
    id: 101,
    title: 'Jazz Night at Blue Note',
    description: 'Enjoy a night of smooth jazz with acclaimed artists',
    date_ini: '2025-05-24T20:00:00',
    date_end: '2025-05-24T23:30:00',
    categories: [{ id: 1, name: 'Music' }],
    location: {
      id: 201,
      town: { id: 301, name: 'Barcelona' },
      region: { id: 401, name: 'Catalonia' },
      space: 'Blue Note Jazz Club',
      address: 'Carrer de Provença, 257',
    },
    images: [{ image_url: 'https://picsum.photos/200/300' }],
    links: [{ link: 'https://example.com/events/jazz-night' }],
  },
  {
    id: 102,
    title: 'Contemporary Art Exhibition',
    description:
      'Featuring works from local and international artists exploring modern themes',
    date_ini: '2025-05-25T10:00:00',
    date_end: '2025-05-25T18:00:00',
    categories: [{ id: 2, name: 'Art' }],
    location: {
      id: 202,
      town: { id: 301, name: 'Barcelona' },
      region: { id: 401, name: 'Catalonia' },
      space: 'MACBA',
      address: 'Plaça dels Àngels, 1',
    },
    images: [{ image_url: 'https://picsum.photos/200/300' }],
    links: [{ link: 'https://example.com/events/art-exhibition' }],
  },
  {
    id: 103,
    title: 'Food & Wine Festival',
    description:
      "Sample delicacies from the region's best restaurants and wineries",
    date_ini: '2025-05-26T12:00:00',
    date_end: '2025-05-26T23:00:00',
    categories: [{ id: 3, name: 'Food' }],
    location: {
      id: 203,
      town: { id: 301, name: 'Barcelona' },
      region: { id: 401, name: 'Catalonia' },
      space: 'Poble Espanyol',
      address: 'Av. Francesc Ferrer i Guàrdia, 13',
    },
    images: [{ image_url: 'https://picsum.photos/200/300' }],
    links: [{ link: 'https://example.com/events/food-festival' }],
  },
  {
    id: 104,
    title: 'Tech Conference 2025',
    description: 'The latest innovations and trends in technology',
    date_ini: '2025-05-27T09:00:00',
    date_end: '2025-05-28T18:00:00',
    categories: [{ id: 4, name: 'Technology' }],
    location: {
      id: 204,
      town: { id: 301, name: 'Barcelona' },
      region: { id: 401, name: 'Catalonia' },
      space: 'Fira Barcelona',
      address: 'Av. Joan Carles I, 64',
    },
    images: [{ image_url: 'https://picsum.photos/200/300' }],
    links: [{ link: 'https://example.com/events/tech-conference' }],
  },
  {
    id: 105,
    title: 'Marathon 2025',
    description: 'Annual city marathon with routes for all levels',
    date_ini: '2025-05-29T08:00:00',
    date_end: '2025-05-29T14:00:00',
    categories: [{ id: 5, name: 'Sports' }],
    location: {
      id: 205,
      town: { id: 301, name: 'Barcelona' },
      region: { id: 401, name: 'Catalonia' },
      space: 'City Center',
      address: 'Plaça de Catalunya',
    },
    images: [{ image_url: 'https://picsum.photos/200/300' }],
    links: [{ link: 'https://example.com/events/marathon' }],
  },
];

// Mock room participants
export const mockParticipants = [
  {
    id: 1,
    name: 'Alex',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 2,
    name: 'Maria',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 0,
    name: 'You',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];
