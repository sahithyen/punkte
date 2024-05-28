export interface Config {
    count: number;
    punkt: PunktConfig;
    tremble: TrembleConfig;
}

interface PunktConfig {
    max_opacity: number;
    max_radius: number;
    min_opacity: number;
    min_radius: number;
}

interface TrembleConfig {
    offset: number;
    min_time: number;
    max_time: number;
}
