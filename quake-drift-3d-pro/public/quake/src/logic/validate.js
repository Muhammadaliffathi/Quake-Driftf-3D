// Validasi input parameter analisis seismik dan geometri gedung
export function sanitizePositiveNumber(val, fallback) {
    const parsed = parseFloat(val);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function sanitizeNonNegativeNumber(val, fallback) {
    const parsed = parseFloat(val);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function sanitizePositiveInt(val, fallback, min = 1, max = 50) {
    const parsed = parseInt(val, 10);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(min, Math.min(max, parsed));
}

export function validateSeismicInputs(raw) {
    const errors = [];
    if (!raw.floorConfigs || raw.floorConfigs.length < 1) {
        errors.push('Jumlah lantai minimal harus 1 lantai.');
    }
    if (raw.rVal <= 0) {
        errors.push('Faktor reduksi gempa (R) harus lebih besar dari 0.');
    }
    if (raw.npx < 1 || raw.npy < 1) {
        errors.push('Jumlah portal arah X dan Y minimal 1.');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
