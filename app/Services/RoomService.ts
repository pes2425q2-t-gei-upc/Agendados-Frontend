import { getUserToken } from '@services/AuthService';

export default class RoomService {
  static async createRoom(
    name: string,
    friendIds?: number[]
  ): Promise<{ code: string; name: string }> {
    try {
      const token = await getUserToken();
      const body: { name: string; invited_friends?: number[] } = { name };
      if (friendIds && friendIds.length > 0) {
        body.invited_friends = friendIds;
      }

      const response = await fetch(
        'https://agendados-backend-842309366027.europe-southwest1.run.app/api/private_rooms/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create room: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
