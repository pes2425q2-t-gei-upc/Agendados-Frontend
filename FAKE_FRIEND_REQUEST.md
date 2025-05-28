# Funcionalidad de Solicitud de Amistad COMPLETAMENTE FAKE

## Descripción
Se ha implementado una funcionalidad que simula COMPLETAMENTE el envío exitoso de una solicitud de amistad por 10 segundos. **NO SE ENVÍA NADA AL SERVIDOR** - es 100% fake para demostración.

## Implementación

### Cambios realizados en `app/friends/add.tsx`:

1. **Nuevo estado**: Se añadió `fakeSentRequests` para rastrear las solicitudes "enviadas" temporalmente:
   ```tsx
   const [fakeSentRequests, setFakeSentRequests] = useState<number[]>([]);
   ```

2. **Modificación de `handleSendRequest`** (COMPLETAMENTE FAKE):
   - Se muestra inmediatamente el mensaje de éxito
   - Se añade el usuario al estado de `fakeSentRequests`
   - Después de 10 segundos, se remueve del estado falso
   - **NUNCA se envía nada al servidor**

3. **Actualización de `hasPendingRequest`**:
   - Ahora verifica tanto las solicitudes reales como las falsas
   - Incluye `fakeSentRequests` en las dependencias del useCallback

4. **Eliminación de dependencias innecesarias**:
   - Se removió `sendFriendRequest` del hook ya que no se usa

## Comportamiento

### Flujo del usuario:
1. Usuario hace clic en "Enviar Solicitud"
2. **Inmediatamente**: 
   - Se muestra el alert de "Solicitud enviada"
   - El botón cambia a estado "Solicitud enviada"
3. **Durante 10 segundos**: 
   - La UI mantiene el estado de "solicitud enviada"
4. **Después de 10 segundos**:
   - El estado falso se limpia automáticamente
   - El botón vuelve a su estado normal
   - **NO se envía nada al servidor**

### Ventajas:
- **Demostración pura**: Perfecto para mostrar UX sin afectar datos reales
- **Sin efectos secundarios**: No se crean datos falsos en el servidor
- **Reversible**: El estado se limpia automáticamente
- **Seguro**: No afecta la funcionalidad real de la app

### Consideraciones:
- Es completamente cosmético - solo para demostración
- No se guardan datos reales de solicitudes
- El estado se resetea automáticamente después de 10 segundos
- Perfecto para pruebas de UX sin impacto en el backend

## Traducciones utilizadas
- `friends.friendRequestSent`: "Solicitud enviada" 
- `common.success`: "Éxito"
