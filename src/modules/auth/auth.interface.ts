export interface ILogInPayload {
    email: string,
    password: string,
}

export interface IRegisterUserPayload {
    name: string,
    email: string,
    password: string,
    phone_no: string,
    role?: "customer" | "technician",
}