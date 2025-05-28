// app/Models/User.ts
export interface UserDTO {
  id: number;
  username: string;
  name?: string;
  email: string;
  avatar?: string;
  profile_image?: string;
  profile_picture?: string;
  image?: string;
  photo?: string;
  createdAt: string;
  // Campos adicionales
}

export class User implements UserDTO {
  id: number;
  username: string;
  name?: string;
  email: string;
  avatar?: string;
  createdAt: string;

  constructor(user: UserDTO) {
    this.id = user.id;
    this.username = user.username;
    this.name = user.name;
    this.email = user.email;
    // Buscar imagen de perfil en diferentes campos posibles
    this.avatar =
      user.avatar ??
      user.profile_image ??
      user.profile_picture ??
      user.image ??
      user.photo;
    this.createdAt = user.createdAt;
  }
}
