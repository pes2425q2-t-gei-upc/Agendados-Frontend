import { EventDTO, Event } from './Event';

export interface DetailedEventDTO extends EventDTO {
  images: string[];
  description: string;
  price: number;
  ticketsAvailable: number;
}

export class DetailedEvent extends Event implements DetailedEventDTO {
  images: string[];
  description: string;
  price: number;
  ticketsAvailable: number;

  constructor(dto: DetailedEventDTO) {
    super(dto);
    this.images = dto.images;
    this.description = dto.description;
    this.price = dto.price;
    this.ticketsAvailable = dto.ticketsAvailable;
  }
}
