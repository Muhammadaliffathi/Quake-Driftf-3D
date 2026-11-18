// Mesin Perhitungan Beban Gempa & Distribusi Gaya Lateral SNI 1726:2019
import { FA_TABLE, FV_TABLE, STRUCTURE_PERIOD_PARAMS } from './constants.js';

export function getFa(siteClass, ss) {
    const table = FA_TABLE[siteClass] || FA_TABLE.SD;
    const keys = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5];
    let matchedKey = keys[0];
    for (const k of keys) {
        if (ss >= k) matchedKey = k;
    }
    return table[matchedKey] || 1.0;
}

export function getFv(siteClass, s1) {
    const table = FV_TABLE[siteClass] || FV_TABLE.SD;
    const keys = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
    let matchedKey = keys[0];
    for (const k of keys) {
        if (s1 >= k) matchedKey = k;
    }
    return table[matchedKey] || 1.0;
}

export function determineKds(sds, sd1, override) {
    let calculated = 'B';
    if (sds >= 0.50 || sd1 >= 0.20) calculated = 'D';
    else if (sds >= 0.33 || sd1 >= 0.133) calculated = 'C';
    else if (sds >= 0.167 || sd1 >= 0.067) calculated = 'B';
    else calculated = 'A';
    return override || calculated;
}

export function calculateSeismicAnalysis(params) {
    const {
        siteClass, ssMap, s1Map, ie, rVal, tipeStruktur, kdsOverride,
        lx, ly, npx, npy, floorConfigs, bebanMode,
        bKolom, hKolom, bBalok, hBalok, tPelat, gammaBeton,
        qDinding, qPlafond, qSpesi, qKeramik
    } = params;

    const N = floorConfigs.length;
    const H_total = floorConfigs.reduce((acc, cfg) => acc + cfg.height, 0);

    const periodParam = STRUCTURE_PERIOD_PARAMS[tipeStruktur] || STRUCTURE_PERIOD_PARAMS.beton;
    const Ct = periodParam.ct;
    const xVal = periodParam.x;

    const Fa = getFa(siteClass, ssMap);
    const Fv = getFv(siteClass, s1Map);
    const SMS = Fa * ssMap;
    const SM1 = Fv * s1Map;
    const SDS = (2.0 / 3.0) * SMS;
    const SD1 = (2.0 / 3.0) * SM1;
    const kds = determineKds(SDS, SD1, kdsOverride);

    const areaLa = lx * ly;
    const numColumns = npx * npy;
    const totalBeamLength = (npx * ly) + (npy * lx);
    const hAvg = H_total / N;
    const qME = 25;

    const wPelat = areaLa * tPelat * gammaBeton;
    const wBalok = totalBeamLength * bBalok * hBalok * gammaBeton;
    const wKolomRoof = numColumns * bKolom * hKolom * (hAvg / 2) * gammaBeton;
    const wKolomTyp = numColumns * bKolom * hKolom * hAvg * gammaBeton;
    const wDinding = areaLa * qDinding;
    const wPlafond = areaLa * qPlafond;
    const wSpesi = areaLa * qSpesi;
    const wKeramik = areaLa * qKeramik;
    const wME = areaLa * qME;

    const wRoof_kg = wPelat + wBalok + wKolomRoof + wDinding + wPlafond + wME;
    const wTyp_kg = wPelat + wBalok + wKolomTyp + wDinding + wPlafond + wSpesi + wKeramik + wME;

    const floorWeights_kN = [];
    let W_total = 0;

    if (bebanMode === 'auto') {
        for (let i = 1; i <= N; i++) {
            const w_kg = (i === N) ? wRoof_kg : wTyp_kg;
            const w_kN = (w_kg * 9.81) / 1000;
            floorWeights_kN.push(w_kN);
            W_total += w_kN;
        }
    } else {
        for (let i = 0; i < N; i++) {
            const w_kN = floorConfigs[i].weight;
            floorWeights_kN.push(w_kN);
            W_total += w_kN;
        }
    }

    const Ta = Ct * Math.pow(H_total, xVal);
    let k = 1;
    if (Ta <= 0.5) k = 1;
    else if (Ta >= 2.5) k = 2;
    else k = 1 + (Ta - 0.5) / 2;

    let Cs = SDS / (rVal / ie);
    const CsMax = SD1 / (Ta * (rVal / ie));
    const CsMin = 0.044 * SDS * ie;
    if (Cs > CsMax) Cs = CsMax;
    if (Cs < CsMin) Cs = CsMin;

    const V_base = Cs * W_total;

    let cumulativeHeight = 0;
    let sum_wx_hk = 0;
    const floorData = [];
    const floorElevations = [0];

    for (let i = 1; i <= N; i++) {
        const h_i = floorConfigs[i - 1].height;
        cumulativeHeight += h_i;
        floorElevations.push(cumulativeHeight);
        const hx = cumulativeHeight;
        const wx = floorWeights_kN[i - 1];
        const wx_hk = wx * Math.pow(hx, k);
        sum_wx_hk += wx_hk;
        floorData.push({ floor: i, h_i, hx, wx, wx_hk });
    }

    const fixList = [];
    const fiyList = [];
    floorData.forEach(item => {
        const Cvx = sum_wx_hk > 0 ? (item.wx_hk / sum_wx_hk) : (1 / N);
        const Fx = Cvx * V_base;
        const Fix = Fx / npx;
        const Fiy = Fx / npy;
        item.Cvx = Cvx;
        item.Fx = Fx;
        item.Fix = Fix;
        item.Fiy = Fiy;
        fixList.push(Fix);
        fiyList.push(Fiy);
    });

    return {
        N, H_total, Ct, xVal, Fa, Fv, SMS, SM1, SDS, SD1, kds,
        Ta, k, Cs, V_base, W_total, floorWeights_kN,
        floorData, floorElevations, fixList, fiyList,
        weightBreakdown: {
            areaLa, totalBeamLength, numColumns, bKolom, hKolom, bBalok, hBalok, tPelat, gammaBeton,
            wPelat, wBalok, wKolomRoof, wKolomTyp, wDinding, wPlafond, wSpesi, wKeramik, wME,
            wRoof_kg, wTyp_kg, W_total
        }
    };
}
