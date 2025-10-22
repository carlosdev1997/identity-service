import 'reflect-metadata';
import { Container } from 'inversify';
import {
    RegisterUserUseCase,
    UpdateUserUseCase,
    ActivateUserUseCase,
    DeactivateUserUseCase,
    AuthenticateUserUseCase,
    CompleteNewPasswordChallengeUseCase,
    RefreshTokensUseCase,
} from '../../application/use-cases/commands/index.js';
import {
    GetUserByIdUseCase,
    GetUserByEmailUseCase,
    ListUsersUseCase,
} from '../../application/use-cases/queries/index.js';
import {
    PrismaUserWriterAdapter,
    PrismaUserReaderAdapter,
    PrismaUserExistenceCheckerAdapter,
} from '../adapters/outbound/persistence/prisma/adapters/index.js';
import {
    CognitoUserCreatorAdapter,
    CognitoUserAuthenticatorAdapter,
    CognitoUserExistenceCheckerAdapter,
    CognitoUserRemoverAdapter,
    CognitoUserUpdaterAdapter,
} from '../adapters/outbound/authentication/cognito/adapters/index.js';
import { SnsEventPublisherAdapter } from '../adapters/outbound/messaging/sns/adapters/index.js';

const container = new Container();

container.bind('UserWriterPort').to(PrismaUserWriterAdapter);
container.bind('UserReaderPort').to(PrismaUserReaderAdapter);
container.bind('UserExistenceCheckerPort').to(PrismaUserExistenceCheckerAdapter);

container.bind('AuthUserCreatorPort').to(CognitoUserCreatorAdapter);
container.bind('AuthUserAuthenticatorPort').to(CognitoUserAuthenticatorAdapter);
container.bind('AuthUserExistenceCheckerPort').to(CognitoUserExistenceCheckerAdapter);
container.bind('AuthUserRemoverPort').to(CognitoUserRemoverAdapter);
container.bind('AuthUserUpdaterPort').to(CognitoUserUpdaterAdapter);

container.bind('EventPublisherPort').to(SnsEventPublisherAdapter);

container.bind(RegisterUserUseCase).toSelf();
container.bind(UpdateUserUseCase).toSelf();
container.bind(ActivateUserUseCase).toSelf();
container.bind(DeactivateUserUseCase).toSelf();
container.bind(AuthenticateUserUseCase).toSelf();
container.bind(CompleteNewPasswordChallengeUseCase).toSelf();
container.bind(RefreshTokensUseCase).toSelf();
container.bind(GetUserByIdUseCase).toSelf();
container.bind(GetUserByEmailUseCase).toSelf();
container.bind(ListUsersUseCase).toSelf();

export { container };
