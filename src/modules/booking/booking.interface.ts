export interface ICreateBookingPayload {
    service_id: string;
    scheduled_at: string;
    address: string;
    note?: string;
}
