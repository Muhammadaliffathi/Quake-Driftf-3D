// Tabel Koefisien Situs SNI 1726:2019 (Tabel 6 & 7) dan Parameter Periode Pendekatan (Tabel 8.3)
export const FA_TABLE = {
    SA: { 0.25: 0.8, 0.5: 0.8, 0.75: 0.8, 1.0: 0.8, 1.25: 0.8, 1.5: 0.8 },
    SB: { 0.25: 0.9, 0.5: 0.9, 0.75: 0.9, 1.0: 0.9, 1.25: 0.9, 1.5: 0.9 },
    SC: { 0.25: 1.2, 0.5: 1.3, 0.75: 1.3, 1.0: 1.2, 1.25: 1.2, 1.5: 1.2 },
    SD: { 0.25: 1.6, 0.5: 1.4, 0.75: 1.2, 1.0: 1.1, 1.25: 1.0, 1.5: 1.0 },
    SE: { 0.25: 2.4, 0.5: 1.7, 0.75: 1.3, 1.0: 0.9, 1.25: 0.9, 1.5: 0.8 },
    SF: { 0.25: 1.0, 0.5: 1.0, 0.75: 1.0, 1.0: 1.0, 1.25: 1.0, 1.5: 1.0 }
};

export const FV_TABLE = {
    SA: { 0.1: 0.8, 0.2: 0.8, 0.3: 0.8, 0.4: 0.8, 0.5: 0.8, 0.6: 0.8 },
    SB: { 0.1: 0.8, 0.2: 0.8, 0.3: 0.8, 0.4: 0.8, 0.5: 0.8, 0.6: 0.8 },
    SC: { 0.1: 1.5, 0.2: 1.5, 0.3: 1.5, 0.4: 1.5, 0.5: 1.5, 0.6: 1.4 },
    SD: { 0.1: 2.4, 0.2: 2.2, 0.3: 2.0, 0.4: 1.9, 0.5: 1.8, 0.6: 1.7 },
    SE: { 0.1: 4.2, 0.2: 3.3, 0.3: 2.8, 0.4: 2.4, 0.5: 2.2, 0.6: 2.0 },
    SF: { 0.1: 1.0, 0.2: 1.0, 0.3: 1.0, 0.4: 1.0, 0.5: 1.0, 0.6: 1.0 }
};

export const STRUCTURE_PERIOD_PARAMS = {
    baja: { ct: 0.0724, x: 0.8, label: 'Rangka baja pemikul momen' },
    beton: { ct: 0.0466, x: 0.9, label: 'Rangka beton pemikul momen' },
    eksentris: { ct: 0.0731, x: 0.75, label: 'Rangka baja dengan bresing eksentris' },
    brf: { ct: 0.0731, x: 0.75, label: 'Rangka baja dengan bresing terkekang terhadap tekuk' },
    lainnya: { ct: 0.0488, x: 0.75, label: 'Semua sistem struktur lainnya' }
};

export const DEFAULT_FLOOR_CONFIGS = [
    { height: 4.0, weight: 4500 },
    { height: 3.5, weight: 4500 },
    { height: 3.5, weight: 4500 },
    { height: 3.5, weight: 4500 },
    { height: 3.5, weight: 4500 },
    { height: 3.5, weight: 4500 }
];
