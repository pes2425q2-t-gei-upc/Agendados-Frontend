interface EventDTO {
  id: number;
  title: string;
  description?: string;
  date_ini: string;
  date_end: string;
  info_tickets?: string;
  schedule?: string;
  categories: Category[];
  scopes?: any[];
  location?: Location;
  images: string[];
  links: string[];
}
interface Location {
  id: number;
  region: Category;
  town: Category;
  latitude?: number;
  longitude?: number;
  address?: string;
  space?: string;
}
interface Category {
  id: number;
  name: string;
}

class Event implements EventDTO {
  id: number;
  title: string;
  description?: string;
  date_ini: string;
  date_end: string;
  info_tickets?: string;
  schedule?: string;
  categories: Category[];
  scopes?: any[];
  location?: Location;
  images: string[];
  links: string[];

  constructor(event: EventDTO) {
    this.id = event.id;
    this.title = event.title;
    this.description = event.description;
    this.date_ini = event.date_ini;
    this.date_end = event.date_end;
    this.info_tickets = event.info_tickets;
    this.schedule = event.schedule;
    this.categories = event.categories;
    this.scopes = event.scopes;
    this.location = event.location;
    this.images = event.images;
    this.links = event.links;
  }
}
