export interface ICreateBookingPayload {
    technician_id: string;
    service_id: string;
    scheduled_at: string;
    address: string;
    note: string;
}
