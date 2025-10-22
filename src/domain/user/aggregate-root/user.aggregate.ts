import { checkRule } from '@companydev/shared-toolkit';
import {
    UserIdValueObject,
    EmailValueObject,
    FullNameValueObject,
    UserStatusValueObject,
    ExternalAuthIdValueObject,
} from '../value-objects/index.js';
import { PasswordChangedEvent } from '../events/index.js';
import { UserMustBePendingToActivateRule, UserMustBeActiveToDeactivateRule } from '../business-rules/index.js';

export class UserAggregate {
    private domainEvents: Array<PasswordChangedEvent> = [];

    private constructor(
        private id: UserIdValueObject,
        private email: EmailValueObject,
        private fullName: FullNameValueObject,
        private status: UserStatusValueObject,
        private externalAuthId: ExternalAuthIdValueObject,
        private readonly createdAt: Date,
        private updatedAt: Date
    ) {}

    static register(props: { email: string; fullName: string; externalAuthId: string }): UserAggregate {
        const now = new Date();
        const aggregate = new UserAggregate(
            UserIdValueObject.create(),
            EmailValueObject.from(props.email),
            FullNameValueObject.from(props.fullName),
            UserStatusValueObject.pending(),
            ExternalAuthIdValueObject.from(props.externalAuthId),
            now,
            now
        );

        return aggregate;
    }

    static reconstitute(props: {
        id: string;
        email: string;
        fullName: string;
        status: number;
        externalAuthId: string;
        createdAt: Date;
        updatedAt: Date;
    }): UserAggregate {
        return new UserAggregate(
            UserIdValueObject.from(props.id),
            EmailValueObject.from(props.email),
            FullNameValueObject.from(props.fullName),
            UserStatusValueObject.from(props.status),
            ExternalAuthIdValueObject.from(props.externalAuthId),
            props.createdAt,
            props.updatedAt
        );
    }

    updateProfile(props: { fullName?: string }): void {
        let hasChanges = false;

        if (props.fullName && props.fullName !== this.fullName.toString()) {
            this.fullName = FullNameValueObject.from(props.fullName);
            hasChanges = true;
        }

        if (hasChanges) {
            this.updatedAt = new Date();
        }
    }

    changePassword(): void {
        this.updatedAt = new Date();
        this.addDomainEvent(new PasswordChangedEvent(this.id.toString(), this.email.toString()));
    }

    activate(): void {
        checkRule(new UserMustBePendingToActivateRule(this.status));
        this.status = UserStatusValueObject.active();
        this.updatedAt = new Date();
    }

    deactivate(): void {
        checkRule(new UserMustBeActiveToDeactivateRule(this.status));
        this.status = UserStatusValueObject.inactive();
        this.updatedAt = new Date();
    }

    private addDomainEvent(event: PasswordChangedEvent): void {
        this.domainEvents.push(event);
    }

    pullDomainEvents(): Array<PasswordChangedEvent> {
        const events = [...this.domainEvents];
        this.domainEvents = [];
        return events;
    }

    getId(): UserIdValueObject {
        return this.id;
    }

    getEmail(): EmailValueObject {
        return this.email;
    }

    getFullName(): FullNameValueObject {
        return this.fullName;
    }

    getStatus(): UserStatusValueObject {
        return this.status;
    }

    getExternalAuthId(): ExternalAuthIdValueObject {
        return this.externalAuthId;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }
}
