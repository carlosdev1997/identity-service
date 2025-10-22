import { injectable, inject } from 'inversify';
import { UseCaseBase, ApplicationException } from '@companydev/shared-toolkit';
import type { RegisterUserCommand } from '../../../ports/inbound/commands/index.js';
import type {
    AuthUserCreatorPort,
    AuthUserExistenceCheckerPort,
    AuthUserRemoverPort,
} from '../../../ports/outbound/authentication/index.js';
import type { UserWriterPort, UserExistenceCheckerPort } from '../../../ports/outbound/persistence/index.js';
import { UserAggregate } from '../../../../domain/user/aggregate-root/index.js';
import { DomainToPortMapper } from '../../../mappers/index.js';
import type { RegisterUserResult } from './register-user.result.js';

@injectable()
export class RegisterUserUseCase extends UseCaseBase<RegisterUserCommand, RegisterUserResult> {
    constructor(
        @inject('AuthUserExistenceCheckerPort') private readonly authUserExistenceChecker: AuthUserExistenceCheckerPort,
        @inject('UserExistenceCheckerPort') private readonly userExistenceChecker: UserExistenceCheckerPort,
        @inject('AuthUserCreatorPort') private readonly authUserCreator: AuthUserCreatorPort,
        @inject('AuthUserRemoverPort') private readonly authUserRemover: AuthUserRemoverPort,
        @inject('UserWriterPort') private readonly userWriter: UserWriterPort
    ) {
        super();
    }

    async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
        const authUserExists = await this.authUserExistenceChecker.check({ email: command.email });
        if (authUserExists.exists) {
            throw ApplicationException.duplicateEntity({
                entityName: 'Usuario',
                field: 'email',
                value: command.email,
                component: 'RegisterUserUseCase',
            });
        }

        const userExists = await this.userExistenceChecker.check({ email: command.email });
        if (userExists.exists) {
            throw ApplicationException.duplicateEntity({
                entityName: 'Usuario',
                field: 'email',
                value: command.email,
                component: 'RegisterUserUseCase',
            });
        }

        const authUser = await this.authUserCreator.create({
            email: command.email,
            fullName: command.fullName,
        });

        const userAggregate = UserAggregate.register({
            email: command.email,
            fullName: command.fullName,
            externalAuthId: authUser.externalAuthId,
        });

        try {
            await this.userWriter.create(DomainToPortMapper.toCreateUserPortInput(userAggregate));
        } catch (error) {
            await this.authUserRemover.remove({ externalAuthId: authUser.externalAuthId });
            throw ApplicationException.transactionFailed({
                message: 'Fallo al crear usuario en base de datos',
                component: 'RegisterUserUseCase',
                cause: error as Error,
            });
        }

        return {
            id: userAggregate.getId().toString(),
            email: userAggregate.getEmail().toString(),
            fullName: userAggregate.getFullName().toString(),
            status: userAggregate.getStatus().toString(),
            externalAuthId: userAggregate.getExternalAuthId().toString(),
            createdAt: userAggregate.getCreatedAt(),
        };
    }
}
