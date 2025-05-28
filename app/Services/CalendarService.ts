import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { Location, Event as EventModal } from '@models/Event';

export class CalendarService {
  private static readonly GOOGLE_CALENDAR_API =
    'https://www.googleapis.com/calendar/v3';
  private static readonly API_BASE =
    'https://agendados-backend-842309366027.europe-southwest1.run.app';

  /**
   * Get Google access token from Google Sign-in directly
   * Since you already have calendar scope configured
   */
  private static async getGoogleAccessToken(): Promise<string> {
    try {
      // First check if user is signed in to Google
      const isSignedIn = await GoogleSignin.hasPlayServices();

      if (!isSignedIn) {
        throw new Error('Usuario no autenticado con Google');
      }

      // Get current tokens from Google Sign-in
      const tokens = await GoogleSignin.getTokens();

      if (!tokens.accessToken) {
        throw new Error('No se pudo obtener el token de acceso de Google');
      }

      return tokens.accessToken;
    } catch (error) {
      console.error('Error getting Google access token:', error);
      throw error;
    }
  }

  /**
   * Create a calendar event
   */
  public static async createCalendarEvent(event: EventModal): Promise<boolean> {
    try {
      console.log('[CalendarService] Creating calendar event:', event.title);

      const accessToken = await this.getGoogleAccessToken();

      // Format the event for Google Calendar
      const calendarEvent = {
        summary: event.title,
        description: this.formatDescription(event),
        start: {
          dateTime: new Date(event.date_ini).toISOString(),
          timeZone: 'Europe/Madrid',
        },
        end: {
          dateTime: new Date(event.date_end).toISOString(),
          timeZone: 'Europe/Madrid',
        },
        location: this.formatLocation(event.location),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
        source: {
          title: 'Agendados App',
          url: 'https://agendados.app',
        },
      };

      console.log('[CalendarService] Sending event to Google Calendar API');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `${this.GOOGLE_CALENDAR_API}/calendars/primary/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calendarEvent),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(
          '[CalendarService] Google Calendar API error:',
          errorData
        );

        // Handle specific Google Calendar API errors
        if (response.status === 401) {
          throw new Error(
            'Token de acceso expirado. Por favor, vuelve a iniciar sesión.'
          );
        } else if (response.status === 403) {
          throw new Error(
            'No tienes permisos para crear eventos en el calendario.'
          );
        } else if (response.status === 429) {
          throw new Error(
            'Demasiadas solicitudes. Inténtalo de nuevo más tarde.'
          );
        } else {
          throw new Error(
            errorData?.error?.message ||
              'Error al crear el evento en el calendario'
          );
        }
      }

      const createdEvent = await response.json();
      console.log(
        '[CalendarService] Event created successfully:',
        createdEvent.id
      );

      return true;
    } catch (error) {
      const isTimeoutError =
        error instanceof Error && error.name === 'AbortError';

      if (isTimeoutError) {
        console.error('[CalendarService] Request timed out');
        throw new Error(
          'La solicitud ha tomado demasiado tiempo. Por favor, inténtalo de nuevo.'
        );
      }

      console.error('[CalendarService] Error creating calendar event:', error);
      throw error;
    }
  }

  /**
   * Check if user has granted calendar permissions
   */
  public static async hasCalendarPermissions(): Promise<boolean> {
    try {
      const isSignedIn = await GoogleSignin.hasPlayServices();
      if (!isSignedIn) {
        return false;
      }

      // Try to get tokens to verify permissions
      const tokens = await GoogleSignin.getTokens();
      return !!tokens.accessToken;
    } catch (error) {
      console.error(
        '[CalendarService] Error checking calendar permissions:',
        error
      );
      return false;
    }
  }

  /**
   * Request calendar permissions by re-signing in with updated scopes
   */
  public static async requestCalendarPermissions(): Promise<boolean> {
    try {
      // Sign out first to clear any cached permissions
      await GoogleSignin.signOut();

      // Re-configure with calendar scope (should already be configured in your GoogleAuthService)
      GoogleSignin.configure({
        webClientId:
          '259177311342-jpmq68ro7s6jq1hs84o84pv2u1baebu9.apps.googleusercontent.com',
        iosClientId:
          '259177311342-m3as7g1cidrdtf7r858i285atqljusnq.apps.googleusercontent.com',
        offlineAccess: true,
        scopes: [
          'profile',
          'email',
          'https://www.googleapis.com/auth/calendar',
        ],
      });

      // Sign in again to get updated permissions
      await GoogleSignin.signIn();

      return await this.hasCalendarPermissions();
    } catch (error) {
      console.error(
        '[CalendarService] Error requesting calendar permissions:',
        error
      );
      return false;
    }
  }

  private static formatLocation(location: Location): string {
    if (!location) {
      return '';
    }

    const parts = [];
    if (location.space) {
      parts.push(location.space);
    }
    if (location.address) {
      parts.push(location.address);
    }
    if (location.town?.name) {
      parts.push(location.town.name);
    }
    if (location.region?.name) {
      parts.push(location.region.name);
    }

    return parts.join(', ');
  }

  private static formatDescription(event: EventModal): string {
    let description = event.description || '';

    // Add additional event info to description
    if (event.categories && event.categories.length > 0) {
      description += `\n\nCategorías: ${event.categories.map((c) => c.name).join(', ')}`;
    }

    if (event.info_tickets !== undefined && event.info_tickets !== null) {
      description += `\n\nInfo Tickets: ${event.info_tickets}`;
    }

    if (event.links[0]?.link) {
      description += `\n\nMás información: ${event.links[0].link}`;
    }

    description += '\n\n📱 Evento guardado desde Agendados App';

    return description.trim();
  }
}
