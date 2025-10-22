import type { BusinessRule } from '@companydev/shared-toolkit';
import type { UserStatusValueObject } from '../value-objects/index.js';

export class UserMustBePendingToActivateRule implements BusinessRule {
    constructor(private readonly status: UserStatusValueObject) {}

    isBroken(): boolean {
        return !this.status.isPending();
    }

    getMessage(): string {
        return 'El usuario debe estar en estado pendiente para poder ser activado';
    }

    getComponent(): string {
        return 'UserMustBePendingToActivateRule';
    }
}
