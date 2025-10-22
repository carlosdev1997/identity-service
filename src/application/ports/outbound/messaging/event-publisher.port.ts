export interface PublishEventPortInput {
    eventName: string;
    payload: Record<string, unknown>;
}

export interface EventPublishedPortOutput {
    messageId: string;
}

export interface EventPublisherPort {
    publish(input: PublishEventPortInput): Promise<EventPublishedPortOutput>;
}
