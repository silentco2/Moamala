import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/** "Sara is also viewing this request". */
@Component({
  selector: 'mo-presence-indicator',
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './presence-indicator.html',
  styleUrl: './presence-indicator.scss',
})
export class PresenceIndicator {
  // TODO(T5.4): inputs `requestId` (required) and `users` (User[] for name lookup).
  //   - when requestId is set, send { type: 'presence.join', requestId } through RealtimeService;
  //     when it changes or the component is destroyed, send 'presence.leave' for the old id
  //     (effect() with onCleanup is a good fit)
  //   - listen to realtime.on('presence') for this requestId and keep the viewer ids in a signal
  //   - `others` computed: viewers except AuthStore.user(), mapped to Users
  //   Hint: effect cleanup here plays the role of the function you return from useEffect.
  //   Docs: https://angular.dev/guide/signals/effect#effect-cleanup-functions
}
