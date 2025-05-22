import { getUserToken } from '@services/AuthService';

export default class RoomService {
  static async createRoom(roomName: string, userIds: number[]): Promise<any> {
    try {
      const token = await getUserToken();
      const response = await fetch(
        'https://agendados-backend-842309366027.europe-southwest1.run.app/api/rooms',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ name: roomName, users: userIds }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create room');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
