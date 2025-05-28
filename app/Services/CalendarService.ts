import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as Calendar from 'expo-calendar';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

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
      const currentUser = await GoogleSignin.getCurrentUser();

      if (!currentUser) {
        throw new Error('Usuario no autenticado con Google');
      }

      // Get current tokens from Google Sign-in
      const tokens = await GoogleSignin.getTokens();

      if (!tokens.accessToken) {
        throw new Error('No se pudo obtener el token de acceso de Google');
      }

      return tokens.accessToken;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting Google access token:', error);
      throw error;
    }
  }

  /**
   * Create a calendar event
   */
  public static async createCalendarEvent(event: EventModal): Promise<boolean> {
    try {
      // eslint-disable-next-line no-console
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

      // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
            errorData?.error?.message ??
              'Error al crear el evento en el calendario'
          );
        }
      }

      const createdEvent = await response.json();
      // eslint-disable-next-line no-console
      console.log(
        '[CalendarService] Event created successfully:',
        createdEvent.id
      );

      return true;
    } catch (error) {
      const isTimeoutError =
        error instanceof Error && error.name === 'AbortError';

      if (isTimeoutError) {
        // eslint-disable-next-line no-console
        console.error('[CalendarService] Request timed out');
        throw new Error(
          'La solicitud ha tomado demasiado tiempo. Por favor, inténtalo de nuevo.'
        );
      }

      // eslint-disable-next-line no-console
      console.error('[CalendarService] Error creating calendar event:', error);
      throw error;
    }
  }

  /**
   * Check if user has granted calendar permissions
   */
  public static async hasCalendarPermissions(): Promise<boolean> {
    try {
      // Check if user is signed in using getCurrentUser
      const currentUser = await GoogleSignin.getCurrentUser();
      if (!currentUser) {
        return false;
      }

      // Try to get tokens to verify permissions
      const tokens = await GoogleSignin.getTokens();

      // Verify that we have access token and that it includes calendar scope
      if (!tokens.accessToken) {
        return false;
      }

      // Optional: You could make a test API call to verify calendar access
      // For now, we'll trust that the token is valid if we have it
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        '[CalendarService] Error checking calendar permissions:',
        error
      );
      return false;
    }
  }

  /**
   * Request calendar permissions by prompting user to sign in with calendar scope
   */
  public static async requestCalendarPermissions(): Promise<boolean> {
    try {
      // Check if user is already signed in
      const currentUser = await GoogleSignin.getCurrentUser();

      if (!currentUser) {
        Alert.alert(
          'Autenticación requerida',
          'Para usar Google Calendar, necesitas iniciar sesión con Google.',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Iniciar sesión',
              onPress: async () => {
                try {
                  await GoogleSignin.signIn();
                } catch (error) {
                  // eslint-disable-next-line no-console
                  console.error(
                    'Error signing in for calendar permissions:',
                    error
                  );
                }
              },
            },
          ]
        );
        return false;
      }

      // If already signed in, check if we have calendar permissions
      return await this.hasCalendarPermissions();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        '[CalendarService] Error requesting calendar permissions:',
        error
      );
      return false;
    }
  }

  /**
   * Add event to native device calendar
   */
  public static async addToNativeCalendar(event: EventModal): Promise<boolean> {
    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso al calendario para guardar eventos.'
        );
        return false;
      }

      // Get default calendar
      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );
      const defaultCalendar =
        calendars.find(
          (cal) => cal.source.name === 'Default' || cal.isPrimary
        ) ?? calendars[0];

      if (!defaultCalendar) {
        throw new Error('No se encontró un calendario disponible');
      }

      // Create the event
      const eventDetails = {
        title: event.title,
        startDate: new Date(event.date_ini),
        endDate: new Date(event.date_end),
        timeZone: 'Europe/Madrid',
        location: this.formatLocation(event.location),
        notes: this.formatDescription(event),
        calendarId: defaultCalendar.id,
        alarms: [
          { relativeOffset: -60 }, // 1 hour before
          { relativeOffset: -1440 }, // 1 day before
        ],
      };

      await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding event to native calendar:', error);
      throw error;
    }
  }

  /**
   * Create and share ICS file with better compatibility
   */
  public static async createAndShareICS(event: EventModal): Promise<boolean> {
    try {
      const startDate = event.date_ini ? new Date(event.date_ini) : new Date();
      const endDate = event.date_end
        ? new Date(event.date_end)
        : new Date(startDate.getTime() + 3600000);

      // Format dates in UTC for better compatibility
      const formatDateForICS = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      // Escape special characters in ICS format
      const escapeICSText = (text: string): string => {
        return text
          .replace(/\\/g, '\\\\')
          .replace(/;/g, '\\;')
          .replace(/,/g, '\\,')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '');
      };

      // Create proper ICS content with better formatting
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Agendados//Event Calendar//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${event.id}-${Date.now()}@agendados.app`,
        `DTSTAMP:${formatDateForICS(new Date())}`,
        `DTSTART:${formatDateForICS(startDate)}`,
        `DTEND:${formatDateForICS(endDate)}`,
        `SUMMARY:${escapeICSText(event.title ?? 'Sin título')}`,
        `DESCRIPTION:${escapeICSText(event.description ?? '')}`,
        `LOCATION:${escapeICSText(this.formatLocation(event.location))}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Recordatorio del evento',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      // Create file with better naming and ensure directory exists
      const fileName = `evento-${event.id}-${Date.now()}.ics`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Ensure directory exists
      const dirUri = FileSystem.documentDirectory;
      if (!dirUri) {
        throw new Error('No se pudo acceder al directorio de documentos');
      }

      const dirInfo = await FileSystem.getInfoAsync(dirUri);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
      }

      await FileSystem.writeAsStringAsync(fileUri, icsContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Verify file was created
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('No se pudo crear el archivo de calendario');
      }

      // Share with specific options for calendar apps
      const shareOptions = {
        mimeType: 'text/calendar',
        dialogTitle: 'Agregar al Calendario',
        ...(Platform.OS === 'ios' && { UTI: 'com.apple.ical.ics' }),
      };

      await Sharing.shareAsync(fileUri, shareOptions);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating and sharing ICS:', error);
      throw error;
    }
  }

  /**
   * Enhanced method to add event to calendar with multiple options
   */
  public static async addEventToCalendar(event: EventModal): Promise<boolean> {
    try {
      // First try Google Calendar API if user is signed in
      const hasGoogleAuth = await this.hasCalendarPermissions();

      if (hasGoogleAuth) {
        try {
          const success = await this.createCalendarEvent(event);
          if (success) {
            Alert.alert(
              'Éxito',
              'Evento agregado a Google Calendar correctamente'
            );
            return true;
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(
            'Google Calendar failed, trying native calendar:',
            error
          );
        }
      }

      // Fallback to native calendar
      try {
        const success = await this.addToNativeCalendar(event);
        if (success) {
          Alert.alert('Éxito', 'Evento agregado al calendario del dispositivo');
          return true;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Native calendar failed, trying ICS file:', error);
      }

      // Final fallback to ICS file sharing
      await this.createAndShareICS(event);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('All calendar methods failed:', error);
      Alert.alert(
        'Error',
        'No se pudo agregar el evento al calendario. Inténtalo de nuevo.'
      );
      return false;
    }
  }

  /**
   * Test Google Calendar connection
   */
  public static async testGoogleCalendarConnection(): Promise<boolean> {
    try {
      // eslint-disable-next-line no-console
      console.log('[CalendarService] Testing Google Calendar connection...');

      // Check if user is signed in
      const currentUser = await GoogleSignin.getCurrentUser();
      if (!currentUser) {
        // eslint-disable-next-line no-console
        console.log('[CalendarService] User not signed in to Google');
        return false;
      }

      // Get access token
      const accessToken = await this.getGoogleAccessToken();
      // eslint-disable-next-line no-console
      console.log(
        '[CalendarService] Got access token, length:',
        accessToken.length
      );

      // Test API call - list calendars
      const response = await fetch(
        `${this.GOOGLE_CALENDAR_API}/users/me/calendarList`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // eslint-disable-next-line no-console
        console.log(
          '[CalendarService] ✅ Google Calendar API connection successful!'
        );
        // eslint-disable-next-line no-console
        console.log(
          '[CalendarService] Found',
          data.items?.length ?? 0,
          'calendars'
        );
        return true;
      } else {
        // eslint-disable-next-line no-console
        console.error(
          '[CalendarService] ❌ Google Calendar API test failed:',
          response.status
        );
        return false;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        '[CalendarService] ❌ Google Calendar connection test error:',
        error
      );
      return false;
    }
  }

  private static formatLocation(location: Location | undefined): string {
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
    let description = event.description ?? '';

    // Add additional event info to description
    if (event.categories && event.categories.length > 0) {
      description += `\n\nCategorías: ${event.categories.map((c) => c.name).join(', ')}`;
    }

    if (event.info_tickets !== undefined && event.info_tickets !== null) {
      description += `\n\nInfo Tickets: ${event.info_tickets}`;
    }

    if (event.links?.[0]?.link) {
      description += `\n\nMás información: ${event.links[0].link}`;
    }

    description += '\n\n📱 Evento guardado desde Agendados App';

    return description.trim();
  }
}
