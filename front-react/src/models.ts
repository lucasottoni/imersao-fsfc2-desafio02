export interface Route {
    _id: string;
    title: string;
    startPosition: { lat: number; lng: number };
    endPosition: { lat: number; lng: number };
}
