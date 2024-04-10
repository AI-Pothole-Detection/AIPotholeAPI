export interface Pothole {
    id: number;
    lat: number;
    long: number;
    reports: number;
}

export interface Image {
    id: number;
    potholeId: number;
    createdAt: string;
    url: string;
}
