export interface MediaUploadedEvent {
    topic: 'media.uploaded';
    payload: {
        entityType: 'listing' | 'event' | 'vendor';
        entityId: string;
        filePath: string;
        fileType: string;
        fileSize: number;
        minioBucket?: string;
        minioKey?: string;
    };
}
export interface TranscriptionCompletedEvent {
    topic: 'transcription.completed';
    payload: {
        listingId: string;
        transcript: string;
        language?: string;
        duration?: number;
    };
}
export interface MarketingGeneratedEvent {
    topic: 'marketing.generated';
    payload: {
        listingId: string;
        marketingCopy: string;
        title?: string;
        tags?: string[];
        readyForEmbedding: boolean;
    };
}
export interface ImageProcessedEvent {
    topic: 'image.processed';
    payload: {
        listingId: string;
        imageUrl: string;
        enhancedImageUrl?: string;
        metadata?: Record<string, any>;
    };
}
export interface EmbeddingCreatedEvent {
    topic: 'embedding.created';
    payload: {
        entityType: 'listing' | 'event';
        entityId: string;
        embeddingId: string;
        vector: number[];
        metadata: {
            title?: string;
            description?: string;
            location?: any;
            tags?: string[];
        };
    };
}
export interface ListingCreatedEvent {
    topic: 'listing.created';
    payload: {
        listingId: string;
        vendorId: string;
        title: string;
        description: string;
        price: number;
        location: any;
        tags: string[];
        embeddingId?: string;
    };
}
export interface EventCreatedEvent {
    topic: 'event.created';
    payload: {
        eventId: string;
        agencyId: string;
        title: string;
        description: string;
        location: any;
        startDate: string;
        price: number;
        tags: string[];
        embeddingId?: string;
    };
}
export interface BookingCreatedEvent {
    topic: 'booking.created';
    payload: {
        bookingId: string;
        userId: string;
        eventId?: string;
        listingId?: string;
        seats: number;
        totalAmount: number;
    };
}
export interface PaymentSucceededEvent {
    topic: 'payment.succeeded';
    payload: {
        paymentId: string;
        bookingId: string;
        amount: number;
        transactionId: string;
    };
}
export interface UserInteractionEvent {
    topic: 'user.interaction';
    payload: {
        userId: string;
        action: string;
        entityType: string;
        entityId: string;
        metadata?: Record<string, any>;
    };
}
export type AllEvents = MediaUploadedEvent | TranscriptionCompletedEvent | MarketingGeneratedEvent | ImageProcessedEvent | EmbeddingCreatedEvent | ListingCreatedEvent | EventCreatedEvent | BookingCreatedEvent | PaymentSucceededEvent | UserInteractionEvent;
