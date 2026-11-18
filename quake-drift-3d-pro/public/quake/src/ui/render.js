// Rendering Kartu Metrik, Tabel Rekapitulasi Beban, dan Tabel Gaya Lateral Fx
import { formatNumberID } from './util.js';

export function renderAnalysisSummary(result) {
    document.getElementById('valCt').innerText = result.Ct.toString();
    document.getElementById('valX').innerText = result.xVal.toString();
    document.getElementById('valFa').innerText = result.Fa.toFixed(2);
    document.getElementById('valFv').innerText = result.Fv.toFixed(2);
    document.getElementById('valSM').innerText = `${result.SMS.toFixed(3)}g / ${result.SM1.toFixed(3)}g`;
    document.getElementById('valSD').innerText = `${result.SDS.toFixed(3)}g / ${result.SD1.toFixed(3)}g`;

    const kdsBadge = document.getElementById('kdsBadge');
    kdsBadge.innerText = `KDS ${result.kds}`;
    kdsBadge.className = ['D', 'E'].includes(result.kds)
        ? 'bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow'
        : 'bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow';

    const weightFmt = `${formatNumberID(result.W_total, 0)} kN`;
    const shearFmt = `${formatNumberID(result.V_base, 1)} kN`;
    const periodFmt = `${result.Ta.toFixed(2)} detik`;

    document.getElementById('overviewWeight').innerText = weightFmt;
    document.getElementById('overviewShear').innerText = shearFmt;
    document.getElementById('overviewPeriod').innerText = periodFmt;
    document.getElementById('overviewKds').innerText = `KDS ${result.kds}`;

    document.getElementById('pdfWeight').innerText = weightFmt;
    document.getElementById('pdfShear').innerText = shearFmt;
    document.getElementById('pdfPeriod').innerText = periodFmt;
    document.getElementById('pdfKds').innerText = `KDS ${result.kds}`;

    const baseShearHtml = `Gaya Geser Dasar (V): <span class="text-blue-400 font-bold">${result.V_base.toFixed(2)} kN</span> | T<sub>a</sub>: ${result.Ta.toFixed(2)}s (k = ${result.k.toFixed(2)})`;
    const totalWeightHtml = `Total Berat Seismik (W): <span class="text-emerald-400 font-bold">${result.W_total.toFixed(2)} kN</span> (${(result.W_total / 9.81).toFixed(0)} Ton)`;

    document.getElementById('baseShearSummary').innerHTML = baseShearHtml;
    document.getElementById('totalSeismicWeightSummary').innerHTML = totalWeightHtml;
    const mirrorBase = document.querySelector('[data-mirror-id="baseShearSummary"]');
    const mirrorTotal = document.querySelector('[data-mirror-id="totalSeismicWeightSummary"]');
    if (mirrorBase) mirrorBase.innerHTML = baseShearHtml;
    if (mirrorTotal) mirrorTotal.innerHTML = totalWeightHtml;

    const tPelat = result.weightBreakdown.tPelat;
    const slabDepth = Math.max(6, Math.min(24, tPelat * 100));
    document.getElementById('slabThicknessLabel').textContent = `t = ${tPelat.toFixed(2)} m`;
    const bottom = 78 + slabDepth;
    document.getElementById('slabThicknessShape').setAttribute('d', `M18 58 L90 78 L90 ${bottom} L18 ${58 + slabDepth} Z M90 78 L164 48 L164 ${48 + slabDepth} L90 ${bottom} Z`);
}

export function renderTableWeightBreakdown(wData) {
    const tables = [
        document.querySelector('#tableWeightBreakdown tbody'),
        document.querySelector('[data-mirror-id="tableWeightBreakdown"] tbody')
    ];

    const items = [
        { name: 'Pelat Beton', roof: wData.wPelat, typ: wData.wPelat, f1: wData.wPelat },
        { name: 'Balok Beton', roof: wData.wBalok, typ: wData.wBalok, f1: wData.wBalok },
        { name: 'Kolom Beton', roof: wData.wKolomRoof, typ: wData.wKolomTyp, f1: wData.wKolomTyp },
        { name: 'Dinding Pas. Bata', roof: wData.wDinding, typ: wData.wDinding, f1: wData.wDinding },
        { name: 'Plafond & Gantungan', roof: wData.wPlafond, typ: wData.wPlafond, f1: wData.wPlafond },
        { name: 'Spesi / Adukan', roof: '-', typ: wData.wSpesi, f1: wData.wSpesi },
        { name: 'Penutup Keramik', roof: '-', typ: wData.wKeramik, f1: wData.wKeramik },
        { name: 'M / E', roof: wData.wME, typ: wData.wME, f1: wData.wME }
    ];

    tables.forEach(tbody => {
        if (!tbody) return;
        tbody.innerHTML = '';
        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-800/40';
            tr.innerHTML = `
                <td class="p-2 text-left font-semibold text-slate-200">${item.name}</td>
                <td class="p-2 font-mono">${typeof item.roof === 'number' ? item.roof.toFixed(0) : item.roof}</td>
                <td class="p-2 font-mono">${typeof item.typ === 'number' ? item.typ.toFixed(0) : item.typ}</td>
                <td class="p-2 font-mono">${typeof item.f1 === 'number' ? item.f1.toFixed(0) : item.f1}</td>
            `;
            tbody.appendChild(tr);
        });

        const trSum = document.createElement('tr');
        trSum.className = 'bg-slate-800/80 font-bold text-emerald-400 border-t border-slate-700';
        trSum.innerHTML = `
            <td class="p-2 text-left">TOTAL BERAT PER LANTAI (Kg / Ton)</td>
            <td class="p-2 font-mono">${wData.wRoof_kg.toFixed(0)} kg<br><span class="text-[10px] text-slate-300">(${(wData.wRoof_kg / 1000).toFixed(1)} T)</span></td>
            <td class="p-2 font-mono">${wData.wTyp_kg.toFixed(0)} kg<br><span class="text-[10px] text-slate-300">(${(wData.wTyp_kg / 1000).toFixed(1)} T)</span></td>
            <td class="p-2 font-mono">${wData.wTyp_kg.toFixed(0)} kg<br><span class="text-[10px] text-slate-300">(${(wData.wTyp_kg / 1000).toFixed(1)} T)</span></td>
        `;
        tbody.appendChild(trSum);
    });
}

export function renderTableFx(data) {
    const tables = [
        document.querySelector('#tableFx tbody'),
        document.querySelector('[data-mirror-id="tableFx"] tbody')
    ];

    tables.forEach(tbody => {
        if (!tbody) return;
        tbody.innerHTML = '';
        data.slice().reverse().forEach(row => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-800/50 transition';
            tr.innerHTML = `
                <td class="p-2.5 font-bold text-white">Lantai ${row.floor}</td>
                <td class="p-2.5 text-teal-300 font-semibold">${row.h_i.toFixed(2)}</td>
                <td class="p-2.5">${row.hx.toFixed(2)}</td>
                <td class="p-2.5 font-semibold">${row.wx.toFixed(0)}</td>
                <td class="p-2.5 font-mono text-slate-400">${row.Cvx.toFixed(4)}</td>
                <td class="p-2.5 font-bold text-blue-400">${row.Fx.toFixed(2)}</td>
                <td class="p-2.5 font-bold text-red-400">${row.Fix.toFixed(2)}</td>
                <td class="p-2.5 font-bold text-amber-400">${row.Fiy.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    });
}
