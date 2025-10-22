import { injectable } from 'inversify';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { InfrastructureException } from '@companydev/shared-toolkit';
import type {
    EventPublisherPort,
    PublishEventPortInput,
    EventPublishedPortOutput,
} from '../../../../../../application/ports/outbound/messaging/index.js';
import { appContext } from '../../../../../context/index.js';

@injectable()
export class SnsEventPublisherAdapter implements EventPublisherPort {
    private client: SNSClient;

    constructor() {
        this.client = new SNSClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
    }

    async publish(input: PublishEventPortInput): Promise<EventPublishedPortOutput> {
        try {
            const config = appContext.getConfig();

            const command = new PublishCommand({
                TopicArn: config.snsTopicArn,
                Message: JSON.stringify(input.payload),
                MessageAttributes: {
                    eventName: {
                        DataType: 'String',
                        StringValue: input.eventName,
                    },
                },
            });

            const response = await this.client.send(command);

            if (!response.MessageId) {
                throw new Error('No se recibió MessageId de SNS');
            }

            return { messageId: response.MessageId };
        } catch (error) {
            throw InfrastructureException.externalService({
                message: 'Error al publicar evento en SNS',
                component: 'SnsEventPublisherAdapter.publish',
                cause: error as Error,
            });
        }
    }
}
