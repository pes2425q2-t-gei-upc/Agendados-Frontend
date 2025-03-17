export interface EventDTO {
  id: string;
  title: string;
  location: string;
  startDate: Date;
  endDate: Date;
  coverImage: string;
  categories: string[];
}

export class Event implements EventDTO {
  id: string;
  title: string;
  location: string;
  startDate: Date;
  endDate: Date;
  coverImage: string;
  categories: string[];

  constructor(dto: EventDTO) {
    this.id = dto.id;
    this.title = dto.title;
    this.coverImage = dto.coverImage;
    this.location = dto.location;
    this.startDate = dto.startDate;
    this.endDate = dto.endDate;
    this.categories = dto.categories;
  }
}
