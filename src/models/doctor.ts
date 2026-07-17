export type DoctorStatus = 'success' | 'warning' | 'error';

export interface DoctorCategory {
    title: string;
    status: DoctorStatus;
    details: string[];
}
