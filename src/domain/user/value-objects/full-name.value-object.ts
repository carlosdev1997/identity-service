import { DomainException } from '@companydev/shared-toolkit';

export class FullNameValueObject {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 100;

    private constructor(private readonly value: string) {}

    static from(value: string): FullNameValueObject {
        if (typeof value !== 'string') {
            throw DomainException.invalidValueObject({
                message: 'El nombre completo debe ser un texto',
                component: 'FullNameValueObject',
            });
        }

        const trimmed = value.trim();

        if (trimmed.length === 0) {
            throw DomainException.invalidValueObject({
                message: 'El nombre completo es requerido',
                component: 'FullNameValueObject',
            });
        }

        if (trimmed.length < this.MIN_LENGTH) {
            throw DomainException.invalidValueObject({
                message: `El nombre completo debe tener al menos ${this.MIN_LENGTH} caracteres`,
                component: 'FullNameValueObject',
            });
        }

        if (trimmed.length > this.MAX_LENGTH) {
            throw DomainException.invalidValueObject({
                message: `El nombre completo no puede tener más de ${this.MAX_LENGTH} caracteres`,
                component: 'FullNameValueObject',
            });
        }

        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(trimmed)) {
            throw DomainException.invalidValueObject({
                message: 'El nombre completo solo puede contener letras, espacios, guiones y apóstrofes',
                component: 'FullNameValueObject',
            });
        }

        return new FullNameValueObject(trimmed);
    }

    toString(): string {
        return this.value;
    }

    equals(other: FullNameValueObject): boolean {
        return this.value === other.value;
    }
}
