// infrastructure/adapters/outbound/authentication/cognito/utils/cognito-error-handler.ts

import { InfrastructureException } from '@companydev/shared-toolkit';

interface CognitoError extends Error {
    name: string;
    message: string;
    __type?: string;
    $metadata?: {
        httpStatusCode?: number;
    };
}

interface HandleErrorParams {
    error: unknown;
    action: string;
    component: string;
}

export class CognitoErrorHandler {
    private static readonly ERROR_MESSAGES: Record<string, string> = {
        // Authentication errors
        NotAuthorizedException: 'Credenciales inválidas. Verifica tu email y contraseña',
        UserNotFoundException: 'Usuario no encontrado',
        UserNotConfirmedException: 'Usuario no confirmado. Verifica tu email',
        PasswordResetRequiredException: 'Se requiere restablecer la contraseña',

        // Password errors
        InvalidPasswordException:
            'La contraseña no cumple con los requisitos de seguridad. Debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos',

        // Session errors
        ExpiredCodeException: 'El código de verificación ha expirado',
        CodeMismatchException: 'Código de verificación incorrecto',
        NotAuthorizedExpception: 'No autorizado para realizar esta acción',

        // Rate limit errors
        TooManyRequestsException: 'Demasiados intentos. Por favor, intenta más tarde',
        TooManyFailedAttemptsException: 'Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente',
        LimitExceededException: 'Se ha excedido el límite de solicitudes. Intenta más tarde',

        // Token errors
        InvalidTokenException: 'Token inválido o expirado',
        TokenExpiredException: 'El token ha expirado. Inicia sesión nuevamente',

        // User errors
        UsernameExistsException: 'Este email ya está registrado',
        UserLambdaValidationException: 'Error de validación del usuario',
        AliasExistsException: 'Ya existe un usuario con este email o teléfono',

        // Admin operation errors
        InvalidParameterException: 'Parámetros inválidos en la solicitud',
        InvalidUserPoolConfigurationException: 'Configuración inválida del pool de usuarios',
        UnsupportedUserStateException: 'El usuario se encuentra en un estado no válido para esta operación',
        PreconditionNotMetException: 'No se cumplen las condiciones previas para esta operación',

        // Permission errors
        UnauthorizedException: 'No tienes permisos para realizar esta operación',
        ForbiddenException: 'Acceso denegado a este recurso',

        // Internal errors
        InternalErrorException: 'Error interno del servicio de autenticación. Intenta más tarde',
        ResourceNotFoundException: 'Recurso de autenticación no encontrado',
        ServiceUnavailableException: 'El servicio de autenticación no está disponible temporalmente',
    };

    static handle({ error, action, component }: HandleErrorParams): InfrastructureException {
        if (!this.isCognitoError(error)) {
            return this.createUnknownErrorException(error, action, component);
        }

        const errorType = this.getErrorType(error);
        const userMessage = this.getUserFriendlyMessage(errorType, error.message, action);

        return InfrastructureException.externalService({
            message: userMessage,
            component,
            cause: error,
        });
    }

    private static isCognitoError(error: unknown): error is CognitoError {
        if (typeof error !== 'object' || error === null) {
            return false;
        }

        const err = error as Partial<CognitoError>;
        return typeof err.name === 'string' && typeof err.message === 'string';
    }

    private static getErrorType(error: CognitoError): string {
        return error.name || error.__type || 'UnknownError';
    }

    private static getUserFriendlyMessage(errorType: string, originalMessage: string, action: string): string {
        if (errorType === 'InvalidParameterException') {
            return this.parseInvalidParameterError(originalMessage);
        }

        return this.ERROR_MESSAGES[errorType] || `Error al ${action}: ${originalMessage}`;
    }

    private static createUnknownErrorException(
        error: unknown,
        action: string,
        component: string
    ): InfrastructureException {
        return InfrastructureException.externalService({
            message: `Error desconocido al ${action}`,
            component,
            cause: error as Error,
        });
    }

    private static parseInvalidParameterError(errorMessage: string): string {
        const normalizedMessage = errorMessage.toLowerCase();

        const validationRules = [
            {
                keywords: ['password', 'length'],
                message: 'La contraseña debe tener al menos 8 caracteres',
            },
            {
                keywords: ['password', 'uppercase'],
                message: 'La contraseña debe incluir al menos una letra mayúscula',
            },
            {
                keywords: ['password', 'lowercase'],
                message: 'La contraseña debe incluir al menos una letra minúscula',
            },
            {
                keywords: ['password', 'number'],
                message: 'La contraseña debe incluir al menos un número',
            },
            {
                keywords: ['password', 'symbol', 'special'],
                message: 'La contraseña debe incluir al menos un símbolo especial (!@#$%^&*)',
            },
            {
                keywords: ['email', 'username'],
                message: 'El formato del email es inválido',
            },
            {
                keywords: ['user pool', 'userpool'],
                message: 'Configuración del pool de usuarios inválida',
            },
            {
                keywords: ['attribute'],
                message: 'Atributos de usuario inválidos',
            },
        ];

        for (const rule of validationRules) {
            if (this.messageContainsKeywords(normalizedMessage, rule.keywords)) {
                return rule.message;
            }
        }

        return 'Parámetros inválidos. Verifica los datos enviados';
    }

    private static messageContainsKeywords(message: string, keywords: string[]): boolean {
        return keywords.some(keyword => message.includes(keyword));
    }
}
