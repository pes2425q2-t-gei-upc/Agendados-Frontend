// c:\\Proyectos\\Agendados-Frontend\\app\\Services\\WebSocketService.ts
import { useAuth } from '@context/authContext';
import { Event as EventModal } from '@models/Event';
import { User } from '@models/User';
import { getUserToken } from '@services/AuthService';

// Define the WebSocket server URL from your environment or config
// For now, using a placeholder. Replace with your actual WebSocket server URL.
const WEBSOCKET_URL =
  'wss://agendados-backend-842309366027.europe-southwest1.run.app/ws/room'; // Example: replace with your actual server URL

interface RoomDetails {
  id: string;
  name: string;
  participants: User[];
  isHost: boolean;
  currentEvent?: EventModal;
}

interface VotingResults {
  true_votes: number;
  false_votes: number;
  total_votes: number;
  match?: boolean; // True if it's a match, from vote_finished
}

export type WebSocketServiceListener = (state: WebSocketServiceState) => void;

export interface WebSocketServiceState {
  isConnected: boolean;
  roomDetails: RoomDetails | null;
  currentEvent: EventModal | null;
  votingResults: VotingResults | null;
  error: string | null;
  lastMessage: any | null; // For debugging or generic message handling
  isVotingActive: boolean;
  isNewEvent?: boolean; // Optional, if you want to track the next event
  // Add other state properties as needed
}

class WebSocketServiceController {
  private socket: WebSocket | null = null;
  private state: WebSocketServiceState;
  private listeners: WebSocketServiceListener[] = [];

  constructor() {
    this.state = {
      isConnected: false,
      roomDetails: null,
      currentEvent: null,
      votingResults: null,
      error: null,
      lastMessage: null,
      isVotingActive: false,
    };
  }

  private updateState(newState: Partial<WebSocketServiceState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
    console.log('WebSocketService State Updated:', this.state);
  }

  public subscribe(listener: WebSocketServiceListener): () => void {
    this.listeners.push(listener);
    // Provide the current state immediately
    listener(this.state);
    // Add a console log to confirm subscription and listener count
    console.log(
      'New listener subscribed. Total listeners:',
      this.listeners.length
    );
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
      // Add a console log to confirm unsubscription
      console.log(
        'Listener unsubscribed. Total listeners:',
        this.listeners.length
      );
    };
  }

  public async connect(
    roomCode: string,
    isHost: boolean,
    roomName: string
  ): Promise<void> {
    const token = await getUserToken(); // Assuming auth.getToken() returns a valid token
    console.log(
      `Connecting to WebSocket for room: ${roomCode} with token: ${token}`
    );
    //CHECK IF ALREADY CONNECTED
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected.');
      if (this.state.roomDetails?.id !== roomCode) {
        console.warn(
          `Already connected, but to a different room. Current: ${this.state.roomDetails?.id}, New: ${roomCode}`
        );
        this.updateState({
          isConnected: true,
          roomDetails: {
            id: roomCode,
            name: roomName,
            participants: [],
            isHost: isHost,
            currentEvent: undefined,
          },
        });
      } else {
        this.updateState({ isConnected: true });
      }
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(
        `${WEBSOCKET_URL}/${roomCode}/?token=${token}` // Use token in URL
      );

      this.socket.onopen = () => {
        console.log('WebSocket connected to room:', roomCode);
        this.updateState({
          isConnected: true,
          error: null,
          roomDetails: {
            id: roomCode,
            name: roomName, // Placeholder name
            participants: [], // Will be updated by 'user_joined' or similar
            isHost: isHost, // Assuming default, not managed by webSockets.HTML messages
          },
        });
        resolve();
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string);
          console.log('WebSocket message received:', message);
          this.updateState({ lastMessage: message });
          this.handleServerMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.updateState({ error: 'Error parsing message from server' });
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateState({
          isConnected: false,
          error: 'WebSocket connection error',
          roomDetails: null,
          currentEvent: null,
        });
        reject(error);
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.reason);
        this.updateState({
          isConnected: false,
          roomDetails: null,
          currentEvent: null,
          isVotingActive: false,
          votingResults: null,
        });
        // Optionally implement reconnection logic here
      };
    });
  }

  private handleServerMessage(message: any) {
    // Based on the structure of messages from webSockets.HTML and your app needs
    console.log('Handling server message:', message);
    switch (message.type) {
      case 'user_joined': // Renamed from USER_JOINED
        addMessageToLog(`User joined: ${message.user_joined.username}`);
        if (this.state.roomDetails) {
          this.updateState({
            roomDetails: {
              ...this.state.roomDetails,
              participants: message.participants,
            },
          });
        }
        break;
      case 'user_left':
        addMessageToLog(
          `User left: ${message.user_left.username ?? 'Unknown user'}`
        );
        if (this.state.roomDetails) {
          this.updateState({
            roomDetails: {
              ...this.state.roomDetails,
              participants: message.participants,
            },
          });
        }
        break;
      case 'room_started': // Renamed from MATCHING_STARTED
        // Assuming payload: { event: EventModal (with at least a 'title' property) }
        addMessageToLog(`Room started. Event: ${message.event?.title}`);
        this.updateState({
          currentEvent: message.event,
          isVotingActive: true,
          votingResults: null, // Reset results for new event
          error: null,
        });
        break;
      // NEW_EVENT is removed, covered by room_started and vote_finished.

      case 'vote_cast':
        addMessageToLog(
          `Vote cast. Results: Yes ${message.vote_results?.true_votes}, No ${message.vote_results?.false_votes}`
        );
        this.updateState({
          votingResults: {
            true_votes: message.vote_results.true_votes,
            false_votes: message.vote_results.false_votes,
            total_votes: message.vote_results.total_votes,
            // 'match' property is part of 'vote_finished'
          },
        });
        break;
      case 'vote_finished': // Renamed from VOTING_ENDED
        addMessageToLog(`Voting finished. Is match: ${message.is_match}`);
        if (message.is_match) {
          this.updateState({
            currentEvent: message.current_event, // The matched event
            isVotingActive: false,
            votingResults: message.results
              ? {
                  // Update with final results if provided
                  true_votes: message.results.true_votes,
                  false_votes: message.results.false_votes,
                  total_votes: message.results.total_votes,
                  match: true,
                }
              : ({ ...this.state.votingResults, match: true } as VotingResults),
          });
          addMessageToLog(
            `Match found! Event: ${message.current_event?.title}`
          );
        } else {
          this.updateState({
            currentEvent: message.next_event, // New event for next round
            isVotingActive: true,
            votingResults: null, // Reset for next round's voting
          });
          addMessageToLog(`Next round. Event: ${message.next_event?.title}`);
        }
        break;

      case 'ERROR': // Kept as is, assuming server might send this type
        this.updateState({ error: message.message });
        break;
      default:
        console.warn('Unhandled WebSocket message type:', message.type);
    }
  }

  private sendMessage(message: object) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      console.log('WebSocket message sent:', message);
    } else {
      console.error('WebSocket not connected. Cannot send message:', message);
      this.updateState({
        error: 'Cannot send message: WebSocket not connected',
      });
      // Optionally queue messages or attempt to reconnect
    }
  }

  public joinRoom(roomId: string, userId: string /* other user details */) {
    this.sendMessage({ type: 'JOIN_ROOM', payload: { roomId, userId } });
  }

  // Renamed from startMatching, payload changed
  public startMatching() {
    if (
      !this.state.roomDetails ||
      this.state.roomDetails.participants.length < 2
    ) {
      this.updateState({
        error: 'Cannot start room with less than 2 participants.',
      });
      console.warn('Attempted to start room with less than 2 participants.');
      return;
    }
    // webSockets.HTML sends { action: "start_room" }
    console.log('Sending start room message');
    this.sendMessage({ action: 'start_room' });
  }

  // Signature and payload changed
  public sendVote(vote: boolean) {
    // vote is boolean
    if (!this.state.isVotingActive) {
      console.warn('Voting is not active, cannot send vote.');
      this.updateState({ error: 'Voting is not active.' });
      return;
    }
    // webSockets.HTML sends { action: "vote", vote: voteValue (boolean) }
    this.sendMessage({ action: 'vote', vote: vote });
  }

  public leaveRoom() {
    this.disconnect(); // Or server could confirm leave and then client disconnects
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      console.log('WebSocket disconnected by client.');
    }
    this.updateState({
      isConnected: false,
      roomDetails: null,
      currentEvent: null,
      isVotingActive: false,
      votingResults: null,
    });
  }

  public getState(): WebSocketServiceState {
    return this.state;
  }
}

const WebSocketService = new WebSocketServiceController();

// Helper function to simulate adding messages to a log, similar to webSockets.HTML
// This is for debugging and observing the flow within the service itself.
// In a real app, UI components would subscribe and display this info.
function addMessageToLog(message: string) {
  console.log(
    `[WebSocketService Log] ${new Date().toLocaleTimeString()}: ${message}`
  );
}

export default WebSocketService;
