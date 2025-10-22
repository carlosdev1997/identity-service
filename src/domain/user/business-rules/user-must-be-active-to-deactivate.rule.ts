import type { BusinessRule } from '@companydev/shared-toolkit';
import type { UserStatusValueObject } from '../value-objects/index.js';

export class UserMustBeActiveToDeactivateRule implements BusinessRule {
    constructor(private readonly status: UserStatusValueObject) {}

    isBroken(): boolean {
        return !this.status.isActive();
    }

    getMessage(): string {
        return 'El usuario debe estar activo para poder ser desactivado';
    }

    getComponent(): string {
        return 'UserMustBeActiveToDeactivateRule';
    }
}
