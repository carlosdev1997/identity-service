import { UuidValueObject } from '@companydev/shared-toolkit';

export class UserIdValueObject {
    private constructor(private readonly uuid: UuidValueObject) {}

    static create(): UserIdValueObject {
        return new UserIdValueObject(UuidValueObject.create());
    }

    static from(value: string): UserIdValueObject {
        return new UserIdValueObject(UuidValueObject.from(value));
    }

    toString(): string {
        return this.uuid.toString();
    }

    equals(other: UserIdValueObject): boolean {
        return this.uuid.equals(other.uuid);
    }
}
