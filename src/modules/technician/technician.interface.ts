export interface ITechnicianFilters {
    searchTerm?: string;
    skills?: string;
    minExperience?: string;
    maxExperience?: string;
    minRate?: string;
    maxRate?: string;
    sortBy?: string;
    sortOrder?: string;
}

export interface IUpdateTechnicianProfilePayload {
    bio?: string;
    skills?: string;
    experience_year?: number;
    hourly_rate?: number;
}

export interface IAvailabilitySlot {
    day: string;
    start_time: string;
    end_time: string;
}

export interface IUpdateAvailabilityPayload {
    slots: IAvailabilitySlot[];
}
