export type EventPayload = Record<string, unknown>;

export interface DomainEvent<TTypes extends string, TPayload extends EventPayload> {
  type: TTypes;
  payload: TPayload;
  occurredAt: string;
}

export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  version?: number;
}

export interface OutboundEvent<
  TType extends string,
  TPayload extends EventPayload,
> extends DomainEvent<TType, TPayload> {
  metadata?: EventMetadata;
}

export interface InboundEvent<
  TType extends string,
  TPayload extends EventPayload,
> extends DomainEvent<TType, TPayload> {
  metadata: EventMetadata;
}
