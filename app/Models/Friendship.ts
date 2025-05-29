// app/Models/Friendship.ts
import { User, UserDTO } from '@models/User';

export interface FriendshipDTO {
  id: number;
  user_id?: number;
  friend_id?: number;
  user?: UserDTO;
  friend?: UserDTO;
  status?: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export class Friendship {
  id: number;
  user_id?: number;
  friend_id?: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
  updated_at?: string;
  friend?: User;
  user?: User;

  constructor(friendship: FriendshipDTO) {
    this.id = friendship.id;
    this.user_id = friendship.user_id;
    this.friend_id = friendship.friend_id;
    this.status = friendship.status ?? 'pending';
    this.created_at = friendship.created_at;
    this.updated_at = friendship.updated_at;

    const raw: any = friendship as any;
    // Si recibimos directamente user_from/user_to desde la API, los reubicamos
    if (!friendship.user && raw.user_from) {
      friendship.user = raw.user_from;
    }
    if (!friendship.friend && raw.user_to) {
      friendship.friend = raw.user_to;
    }

    if (friendship.friend) {
      this.friend = new User(friendship.friend);
    }
    if (friendship.user) {
      this.user = new User(friendship.user);
    }
  }

  isValid(): boolean {
    return !!this.id && (!!this.friend || !!this.user);
  }
}
