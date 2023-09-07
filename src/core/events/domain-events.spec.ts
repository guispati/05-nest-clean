import { AggregateRoot } from "../entities/aggregate-root";
import { UniqueEntityID } from "../entities/unique-entity-id";
import { DomainEvent } from "./domain-event";
import { DomainEvents } from "./domain-events";
import { vi } from 'vitest';

class CustomAggregateCreated implements DomainEvent {
    public ocurredAt: Date;
    private aggregate: CustomAggregate;

    constructor(aggregate: CustomAggregate) {
        this.ocurredAt = new Date();
        this.aggregate = aggregate;
    }

    public getAggregateId(): UniqueEntityID {
        return this.aggregate.id;
    }
}

class CustomAggregate extends AggregateRoot<null> {
    static create() {
        const aggregate = new CustomAggregate(null);

        aggregate.addDomainEvent(new CustomAggregateCreated(aggregate));

        return aggregate;
    }
}

describe('domain events', () => {
    it('should be able to dispatch and listen to events', () => {
        const callbackSpy = vi.fn();

        // Cadastra subscriber
        DomainEvents.register(callbackSpy, CustomAggregateCreated.name);

        // Cria evento porém SEM salvar no banco
        const aggregate = CustomAggregate.create();

        // Testa se o evento foi criado porém NÃO foi disparado
        expect(aggregate.domainEvents).toHaveLength(1);

        // Salva o dado do evento no banco e assim dispara o evento
        DomainEvents.dispatchEventsForAggregate(aggregate.id);

        // Subscriber ouve o evento e realiza operações com o dado
        expect(callbackSpy).toHaveBeenCalled();
        expect(aggregate.domainEvents).toHaveLength(0);
    });
})