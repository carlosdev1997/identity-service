// import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
// import { InfrastructureException } from '@companydev/shared-toolkit';
// import { SSM_PATHS } from '../config/ssm-paths.config.js';

// interface AppConfig {
//     cognito: {
//         userPoolId: string;
//         clientId: string;
//         clientSecret: string;
//     };
//     database: {
//         url: string;
//     };
//     sns: {
//         topicArn: string;
//     };
// }

// class AppContext {
//     private static instance: AppContext;
//     private config: AppConfig | null = null;
//     private readonly ssmClient: SSMClient;

//     private constructor() {
//         this.ssmClient = new SSMClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
//     }

//     static getInstance(): AppContext {
//         if (!AppContext.instance) {
//             AppContext.instance = new AppContext();
//         }
//         return AppContext.instance;
//     }

//     async initialize(): Promise<void> {
//         if (this.config) {
//             return;
//         }

//         try {
//             const [userPoolId, clientId, clientSecret, databaseUrl, topicArn] = await Promise.all([
//                 this.getParameter(SSM_PATHS.COGNITO_USER_POOL_ID),
//                 this.getParameter(SSM_PATHS.COGNITO_CLIENT_ID),
//                 this.getParameter(SSM_PATHS.COGNITO_CLIENT_SECRET, true),
//                 this.getParameter(SSM_PATHS.DATABASE_URL, true),
//                 this.getParameter(SSM_PATHS.SNS_TOPIC_ARN),
//             ]);

//             this.config = {
//                 cognito: {
//                     userPoolId,
//                     clientId,
//                     clientSecret,
//                 },
//                 database: {
//                     url: databaseUrl,
//                 },
//                 sns: {
//                     topicArn,
//                 },
//             };
//         } catch (error) {
//             throw InfrastructureException.externalService({
//                 message: 'Error al inicializar configuración desde SSM',
//                 component: 'AppContext.initialize',
//                 cause: error as Error,
//             });
//         }
//     }

//     private async getParameter(name: string, withDecryption = false): Promise<string> {
//         try {
//             const command = new GetParameterCommand({
//                 Name: name,
//                 WithDecryption: withDecryption,
//             });

//             const response = await this.ssmClient.send(command);

//             if (!response.Parameter?.Value) {
//                 throw InfrastructureException.externalService({
//                     message: `Parámetro ${name} no tiene valor`,
//                     component: 'AppContext.getParameter',
//                 });
//             }

//             return response.Parameter.Value;
//         } catch (error) {
//             if (error instanceof InfrastructureException) {
//                 throw error;
//             }
//             throw InfrastructureException.externalService({
//                 message: `Error al obtener parámetro ${name}`,
//                 component: 'AppContext.getParameter',
//                 cause: error as Error,
//             });
//         }
//     }

//     getConfig(): AppConfig {
//         if (!this.config) {
//             throw InfrastructureException.generic({
//                 message: 'AppContext no ha sido inicializado. Ejecuta initialize() primero.',
//                 component: 'AppContext.getConfig',
//             });
//         }
//         return this.config;
//     }
// }

// export const appContext = AppContext.getInstance();

import { SSMConfigLoader } from '@companydev/shared-toolkit';

interface AppConfig extends Record<string, unknown> {
    cognitoUserPoolId: string;
    cognitoClientId: string;
    cognitoClientSecret: string;
    databaseUrl: string;
    snsTopicArn: string;
}

class AppContext {
    private static instance: AppContext;
    private readonly configLoader: SSMConfigLoader<AppConfig>;

    private constructor() {
        this.configLoader = SSMConfigLoader.getInstance<AppConfig>('identity-service');
    }

    static getInstance(): AppContext {
        if (!AppContext.instance) {
            AppContext.instance = new AppContext();
        }
        return AppContext.instance;
    }

    async initialize(): Promise<void> {
        await this.configLoader.initialize({
            cognitoUserPoolId: '/cognito/user-pool-id',
            cognitoClientId: '/cognito/user-pool-client-id',
            cognitoClientSecret: { path: '/cognito/user-pool-client-secret', encrypted: true },
            databaseUrl: { path: '/database/url', encrypted: true },
            snsTopicArn: '/sns/topic-arn',
        });
    }

    getConfig(): AppConfig {
        return this.configLoader.getConfig();
    }

    get<K extends keyof AppConfig>(key: K): AppConfig[K] {
        return this.configLoader.get(key);
    }
}

export const appContext = AppContext.getInstance();
