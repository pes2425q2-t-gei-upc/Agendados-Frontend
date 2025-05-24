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
  name: string; // Can be same as roomCode or a descriptive name
  participants: User[];
  isHost: boolean; // Note: webSockets.HTML does not explicitly manage/receive this
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
  // Add other state properties as needed
}

class WebSocketServiceController {
  private socket: WebSocket | null = null;
  private state: WebSocketServiceState;
  private listeners: WebSocketServiceListener[] = [];
  private auth = useAuth();

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
            name: roomName, // Or fetch/set a more descriptive name
            participants: [], // Participants will be updated by server messages
            isHost: isHost, // Default, server might update this if it sends such info
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
        });
        // Optionally implement reconnection logic here
      };
    });
  }

  private handleServerMessage(message: any) {
    // Based on the structure of messages from webSockets.HTML and your app needs
    console.log('Handling server message:', message);
    switch (message.type) {
      // ROOM_JOINED is removed; initial room details set on connect or by first user_joined.
      // isHost status is not directly managed by webSockets.HTML messages.

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
      case 'user_left': // Renamed from USER_LEFT
        // Assuming payload: { participants: User[], user_left: { username: string } }
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
        addMessageToLog(
          `Room started. Event: ${message.payload?.event?.title}`
        );
        this.updateState({
          currentEvent: message.payload.event,
          isVotingActive: true,
          votingResults: null, // Reset results for new event
          error: null,
        });
        break;
      // NEW_EVENT is removed, covered by room_started and vote_finished.

      case 'vote_cast': // Renamed from VOTE_UPDATE
        // Assuming payload: { vote_results: { true_votes, false_votes, total_votes }, user?: { username: string }, vote?: boolean }
        // webSockets.HTML updates results based on vote_results.
        addMessageToLog(
          `Vote cast. Results: Yes ${message.payload?.vote_results?.true_votes}, No ${message.payload?.vote_results?.false_votes}`
        );
        this.updateState({
          votingResults: {
            true_votes: message.payload.vote_results.true_votes,
            false_votes: message.payload.vote_results.false_votes,
            total_votes: message.payload.vote_results.total_votes,
            // 'match' property is part of 'vote_finished'
          },
        });
        break;
      case 'vote_finished': // Renamed from VOTING_ENDED
        // Assuming payload: { is_match: boolean, current_event?: EventModal (if match), next_event?: EventModal (if not match), results: VotingResults (optional, if final results are sent here too) }
        // The 'results' part for votingResults might be redundant if 'vote_cast' keeps it updated,
        // or it could be the final tally. webSockets.HTML uses data.vote_results for vote_cast,
        // and for vote_finished, it implies new event or match.
        // Let's assume 'results' in payload updates votingResults one last time.
        addMessageToLog(
          `Voting finished. Is match: ${message.payload.is_match}`
        );
        if (message.payload.is_match) {
          this.updateState({
            currentEvent: message.payload.current_event, // The matched event
            isVotingActive: false,
            votingResults: message.payload.results
              ? {
                  // Update with final results if provided
                  true_votes: message.payload.results.true_votes,
                  false_votes: message.payload.results.false_votes,
                  total_votes: message.payload.results.total_votes,
                  match: true,
                }
              : ({ ...this.state.votingResults, match: true } as VotingResults),
          });
          addMessageToLog(
            `Match found! Event: ${message.payload.current_event?.title}`
          );
        } else {
          this.updateState({
            currentEvent: message.payload.next_event, // New event for next round
            isVotingActive: true,
            votingResults: null, // Reset for next round's voting
          });
          addMessageToLog(
            `Next round. Event: ${message.payload.next_event?.title}`
          );
        }
        break;
      // MATCH_FOUND is removed, handled by vote_finished with is_match: true.

      case 'ERROR': // Kept as is, assuming server might send this type
        this.updateState({ error: message.payload.message });
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
  public startRoom() {
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

  public leaveRoom(roomId: string) {
    this.sendMessage({ type: 'LEAVE_ROOM', payload: { roomId } });
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
