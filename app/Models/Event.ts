export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface EventDTO {
  id: string;
  title: string;
  location: string;
  data: Date;
  coverImage: string;
  categoria: string;
  coordinate?: Coordinate;
}

export class Event implements EventDTO {
  id: string;
  title: string;
  location: string;
  data: Date;
  coverImage: string;
  categoria: string;
  coordinate?: Coordinate;

  constructor(dto: EventDTO) {
    this.id = dto.id;
    this.title = dto.title;
    this.coverImage = dto.coverImage;
    this.location = dto.location;
    this.data = dto.data;
    this.categoria = dto.categoria;
    this.coordinate = dto.coordinate;
  }
}
