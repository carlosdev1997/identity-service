import { DomainEventBase } from '@companydev/shared-toolkit';

export class PasswordChangedEvent extends DomainEventBase {
    constructor(
        aggregateId: string,
        public readonly email: string
    ) {
        super('PasswordChanged', aggregateId);
    }

    toPrimitives(): Record<string, unknown> {
        return {
            eventId: this.eventId,
            eventName: this.eventName,
            aggregateId: this.aggregateId,
            occurredOn: this.occurredOn.toISOString(),
            email: this.email,
        };
    }
}
