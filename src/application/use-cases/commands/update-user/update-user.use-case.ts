import { injectable, inject } from 'inversify';
import { UseCaseBase, ApplicationException } from '@companydev/shared-toolkit';
import type { UpdateUserCommand } from '../../../ports/inbound/commands/index.js';
import type { UserReaderPort, UserWriterPort } from '../../../ports/outbound/persistence/index.js';
import type { AuthUserUpdaterPort } from '../../../ports/outbound/authentication/index.js';
import { DomainToPortMapper, PortToDomainMapper } from '../../../mappers/index.js';
import { UpdateUserResult } from './update-user.result.js';

@injectable()
export class UpdateUserUseCase extends UseCaseBase<UpdateUserCommand, UpdateUserResult> {
    constructor(
        @inject('UserReaderPort') private readonly userReader: UserReaderPort,
        @inject('UserWriterPort') private readonly userWriter: UserWriterPort,
        @inject('AuthUserUpdaterPort') private readonly authUserUpdater: AuthUserUpdaterPort
    ) {
        super();
    }

    async execute(command: UpdateUserCommand): Promise<UpdateUserResult> {
        // 1. Buscar usuario en BD
        const userFound = await this.userReader.findById({ userId: command.userId });
        if (!userFound) {
            throw ApplicationException.entityNotFound({
                entityName: 'Usuario',
                identifier: command.userId,
                showIdentifier: false,
                component: 'ActivateUserUseCase',
            });
        }

        // 2. Reconstituir agregado y actualizar
        const userAggregate = PortToDomainMapper.toUserAggregate(userFound);

        userAggregate.updateProfile({
            fullName: command.fullName,
        });

        // 3. ✅ Actualizar en Cognito
        await this.authUserUpdater.update({
            externalAuthId: userAggregate.getExternalAuthId().toString(),
            fullName: command.fullName,
        });

        // 4. ✅ Actualizar en BD
        await this.userWriter.update(DomainToPortMapper.toUpdateUserPortInput(userAggregate));

        return {
            id: userAggregate.getId().toString(),
            fullName: userAggregate.getFullName().toString(),
            updatedAt: userAggregate.getUpdatedAt(),
        };
    }
}
