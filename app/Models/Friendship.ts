import { UserDTO } from '@models/User';

// app/Models/Friendship.ts
export interface FriendshipDTO {
  id: number;
  user_id: number;
  friend_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  friend?: UserDTO;
}

export class Friendship implements FriendshipDTO {
  id: number;
  user_id: number;
  friend_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  friend?: UserDTO;
  user: any;

  constructor(friendship: FriendshipDTO) {
    this.id = friendship.id;
    this.user_id = friendship.user_id;
    this.friend_id = friendship.friend_id;
    this.status = friendship.status;
    this.created_at = friendship.created_at;
    this.updated_at = friendship.updated_at;
    this.friend = friendship.friend;
  }
}
