// app/Models/User.ts
export interface UserDTO {
  id: number;
  username: string;
  name?: string;
  email: string;
  avatar?: string;
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
    this.avatar = user.avatar;
    this.createdAt = user.createdAt;
  }
}
