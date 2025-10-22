import { DomainException } from '@companydev/shared-toolkit';

export class ExternalAuthIdValueObject {
    private constructor(private readonly value: string) {}

    static from(value: string): ExternalAuthIdValueObject {
        if (typeof value !== 'string') {
            throw DomainException.invalidValueObject({
                message: 'El ID de autenticación externa debe ser un texto',
                component: 'ExternalAuthIdValueObject',
            });
        }

        const trimmed = value.trim();

        if (trimmed.length === 0) {
            throw DomainException.invalidValueObject({
                message: 'El ID de autenticación externa es requerido',
                component: 'ExternalAuthIdValueObject',
            });
        }

        return new ExternalAuthIdValueObject(trimmed);
    }

    toString(): string {
        return this.value;
    }

    equals(other: ExternalAuthIdValueObject): boolean {
        return this.value === other.value;
    }
}
