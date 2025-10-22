import { DomainException } from '@companydev/shared-toolkit';

export enum UserStatus {
    PENDING = 0,
    ACTIVE = 1,
    INACTIVE = 2,
}

export class UserStatusValueObject {
    private constructor(private readonly value: UserStatus) {}

    static from(value: UserStatus): UserStatusValueObject {
        const validStatuses = Object.values(UserStatus).filter(v => typeof v === 'number');

        if (!validStatuses.includes(value)) {
            const validValues = validStatuses.join(', ');
            throw DomainException.invalidValueObject({
                message: `El estado del usuario no es válido. Valores permitidos: ${validValues}`,
                component: 'UserStatusValueObject',
            });
        }

        return new UserStatusValueObject(value);
    }

    static pending(): UserStatusValueObject {
        return new UserStatusValueObject(UserStatus.PENDING);
    }

    static active(): UserStatusValueObject {
        return new UserStatusValueObject(UserStatus.ACTIVE);
    }

    static inactive(): UserStatusValueObject {
        return new UserStatusValueObject(UserStatus.INACTIVE);
    }

    isPending(): boolean {
        return this.value === UserStatus.PENDING;
    }

    isActive(): boolean {
        return this.value === UserStatus.ACTIVE;
    }

    isInactive(): boolean {
        return this.value === UserStatus.INACTIVE;
    }

    toNumber(): number {
        return this.value;
    }

    toString(): string {
        return UserStatus[this.value].toLowerCase();
    }

    equals(other: UserStatusValueObject): boolean {
        return this.value === other.value;
    }
}
