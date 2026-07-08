export interface ICreateServicePayload {
    category_id: string;
    title: string;
    description: string;
    price: number;
}

export interface IServiceFilters {
    searchTerm?: string;
    category_id?: string;
    technician_id?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    sortOrder?: string;
}
