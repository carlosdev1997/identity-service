import type { SNSEvent } from 'aws-lambda';
import { container } from '../../../di/container.js';
import { ActivateUserUseCase } from '../../../../application/use-cases/commands/activate-user/index.js';
import { appContext } from '../../../context/app.context.js';

interface PasswordChangedEventPayload {
    aggregateId: string;
    email: string;
}

export const handler = async (event: SNSEvent): Promise<void> => {
    try {
        await appContext.initialize();

        for (const record of event.Records) {
            const message = JSON.parse(record.Sns.Message) as PasswordChangedEventPayload;

            console.log('Procesando evento PasswordChanged:', message);

            const useCase = container.get(ActivateUserUseCase);
            await useCase.execute({ userId: message.aggregateId });

            console.log(`Usuario ${message.aggregateId} activado exitosamente después de cambiar contraseña`);
        }
    } catch (error) {
        console.error('Error procesando evento PasswordChanged:', error);
        throw error;
    }
};
