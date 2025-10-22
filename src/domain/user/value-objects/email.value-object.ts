import { DomainException } from '@companydev/shared-toolkit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailValueObject {
    private constructor(private readonly value: string) {}

    static from(value: string): EmailValueObject {
        if (!value || value.trim().length === 0) {
            throw DomainException.invalidValueObject({
                message: 'El email es requerido',
                component: 'EmailValueObject',
            });
        }

        const trimmed = value.trim().toLowerCase();

        if (!EMAIL_REGEX.test(trimmed)) {
            throw DomainException.invalidValueObject({
                message: 'El formato del email no es válido. Debe ser similar a: usuario@ejemplo.com',
                component: 'EmailValueObject',
            });
        }

        if (trimmed.length > 254) {
            throw DomainException.invalidValueObject({
                message: 'El email es demasiado largo. Debe tener máximo 254 caracteres',
                component: 'EmailValueObject',
            });
        }

        return new EmailValueObject(trimmed);
    }

    toString(): string {
        return this.value;
    }

    equals(other: EmailValueObject): boolean {
        return this.value === other.value;
    }
}
