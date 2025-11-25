# Add Cross-MFE Communication

Use this prompt when you need to implement communication between Micro Frontends.

## Patterns

### Publisher (Emitting Events)
```typescript
import { inject } from '@angular/core';
import { EventBusService } from '@org/core-services';

export class SourceComponent {
  private eventBus = inject(EventBusService);
  
  notifyOtherMFEs() {
    this.eventBus.emit('event:name', { 
      // payload data 
    });
  }
}
```

### Subscriber (Listening for Events)
```typescript
import { inject, OnInit, OnDestroy } from '@angular/core';
import { EventBusService } from '@org/core-services';

export class TargetComponent implements OnInit, OnDestroy {
  private eventBus = inject(EventBusService);
  private unsubscribe?: () => void;
  
  ngOnInit() {
    this.unsubscribe = this.eventBus.on('event:name', (data) => {
      // handle event
    });
  }
  
  ngOnDestroy() {
    this.unsubscribe?.();
  }
}
```

## Prompt Template

```
I need to implement cross-MFE communication for [USE_CASE]:

1. **Source MFE**: [name] - emits event when [trigger]
2. **Target MFE(s)**: [names] - should [action] when event received
3. **Event Payload**:
   ```typescript
   interface [EventName]Payload {
     // define payload structure
   }
   ```

4. **Requirements**:
   - Event name follows convention: `domain:action` (e.g., `user:updated`)
   - Handle case where target MFE is not loaded
   - Include proper TypeScript types
   - Clean up subscriptions on destroy

Please implement:
- Event type definition
- Publisher code for source MFE
- Subscriber code for target MFE
- Any error handling needed
```

## Example Usage

```
I need to implement cross-MFE communication for updating the header when user preferences change:

1. **Source MFE**: user-settings - emits event when user changes language preference
2. **Target MFE(s)**: shell-header, notifications-panel - should update language when event received
3. **Event Payload**:
   ```typescript
   interface UserPreferencesChangedPayload {
     userId: string;
     preferences: {
       language: string;
       theme: 'light' | 'dark';
       timezone: string;
     };
   }
   ```

4. **Requirements**:
   - Event name follows convention: `domain:action` (e.g., `user:preferences-changed`)
   - Handle case where target MFE is not loaded
   - Include proper TypeScript types
   - Clean up subscriptions on destroy

Please implement:
- Event type definition
- Publisher code for source MFE
- Subscriber code for target MFE
- Any error handling needed
```

## Event Naming Conventions

| Domain | Events |
|--------|--------|
| `auth` | `auth:login`, `auth:logout`, `auth:token-refreshed`, `auth:session-expired` |
| `user` | `user:updated`, `user:preferences-changed`, `user:role-changed` |
| `nav` | `nav:requested`, `nav:completed`, `nav:failed` |
| `data` | `data:refreshed`, `data:invalidated`, `data:error` |
| `mfe` | `mfe:loaded`, `mfe:error`, `mfe:ready` |

## Best Practices

1. **Type Safety**: Define interfaces for all payloads
2. **Documentation**: Document events in a central registry
3. **Idempotency**: Handle duplicate events gracefully
4. **Fallbacks**: Work correctly even if no subscribers exist
5. **Cleanup**: Always unsubscribe in `ngOnDestroy`
