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
