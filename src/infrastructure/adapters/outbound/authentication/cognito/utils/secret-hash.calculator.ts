import { createHmac } from 'crypto';

export class SecretHashCalculator {
    static calculate(username: string, clientId: string, clientSecret: string): string {
        return createHmac('sha256', clientSecret)
            .update(username + clientId)
            .digest('base64');
    }
}
