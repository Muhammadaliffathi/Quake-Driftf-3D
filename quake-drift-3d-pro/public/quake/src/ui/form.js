// Pengelolaan Formulir Input, Lantai Dinamis, dan Beban Per Lantai Mandiri
import { DEFAULT_FLOOR_CONFIGS } from '../logic/constants.js';
import { sanitizePositiveInt, sanitizePositiveNumber, sanitizeNonNegativeNumber } from '../logic/validate.js';

export class FormController {
    constructor(onChangeCallback) {
        this.onChange = onChangeCallback;
        this.floorConfigs = structuredClone(DEFAULT_FLOOR_CONFIGS);
        this.activeDrawerStep = null;
    }

    init() {
        this.renderFloorConfigRows();
        this._bindDrawerEvents();
        this._bindFloorControls();
        this._bindInputListeners();
    }

    getParameters() {
        const npx = sanitizePositiveInt(document.getElementById('npx').value, 4, 1, 30);
        const npy = sanitizePositiveInt(document.getElementById('npy').value, 6, 1, 30);
        document.getElementById('npxHint').innerHTML = `F<sub>ix</sub> = F / ${npx}`;
        document.getElementById('npyHint').innerHTML = `F<sub>iy</sub> = F / ${npy}`;

        return {
            siteClass: document.getElementById('soilClass').value,
            ssMap: sanitizeNonNegativeNumber(document.getElementById('ss_map').value, 0.95),
            s1Map: sanitizeNonNegativeNumber(document.getElementById('s1_map').value, 0.45),
            ie: sanitizePositiveNumber(document.getElementById('kategoriRisiko').value, 1.0),
            rVal: sanitizePositiveNumber(document.getElementById('r_val').value, 8.0),
            tipeStruktur: document.getElementById('tipeStruktur').value,
            kdsOverride: document.getElementById('kdsOverride')?.value,
            lx: sanitizePositiveNumber(document.getElementById('lengthX').value, 30),
            ly: sanitizePositiveNumber(document.getElementById('lengthY').value, 15),
            npx,
            npy,
            floorConfigs: this.floorConfigs,
            bebanMode: document.getElementById('bebanMode').value,
            bKolom: sanitizePositiveNumber(document.getElementById('bKolom').value, 0.6),
            hKolom: sanitizePositiveNumber(document.getElementById('hKolom').value, 0.6),
            bBalok: sanitizePositiveNumber(document.getElementById('bBalok').value, 0.4),
            hBalok: sanitizePositiveNumber(document.getElementById('hBalok').value, 0.6),
            tPelat: sanitizePositiveNumber(document.getElementById('tPelat').value, 0.12),
            gammaBeton: sanitizePositiveNumber(document.getElementById('gammaBeton').value, 2400),
            qDinding: sanitizeNonNegativeNumber(document.getElementById('qDinding').value, 250),
            qPlafond: sanitizeNonNegativeNumber(document.getElementById('qPlafond').value, 11),
            qSpesi: sanitizeNonNegativeNumber(document.getElementById('qSpesi').value, 21),
            qKeramik: sanitizeNonNegativeNumber(document.getElementById('qKeramik').value, 24)
        };
    }

    hasCompleteInputs() {
        return Array.from(document.querySelectorAll('#quakeForm input, #quakeForm select[required]'))
            .every(input => {
                if (input.disabled) return true;
                const value = input.value.trim();
                if (value === '') return false;
                if (input.type !== 'number') return true;
                const number = Number(value);
                const minimum = input.min === '' ? -Infinity : Number(input.min);
                return Number.isFinite(number) && number >= minimum;
            });
    }

    syncAutoWeights(floorWeights_kN) {
        const weightInputs = document.querySelectorAll('.floor-weight-input');
        floorWeights_kN.forEach((w, idx) => {
            if (weightInputs[idx]) weightInputs[idx].value = w.toFixed(0);
        });
    }

    syncFloorCount(targetCount) {
        const count = sanitizePositiveInt(targetCount, 6, 1, 30);
        while (this.floorConfigs.length < count) {
            const last = this.floorConfigs[this.floorConfigs.length - 1] || { height: 3.5, weight: 4500 };
            this.floorConfigs.push({ height: 3.5, weight: last.weight });
        }
        if (this.floorConfigs.length > count) {
            this.floorConfigs = this.floorConfigs.slice(0, count);
        }
        document.getElementById('numFloors').value = count;
        this.renderFloorConfigRows();
        this.onChange();
    }

    renderFloorConfigRows() {
        const container = document.getElementById('floorConfigContainer');
        if (!container) return;
        const isManual = document.getElementById('bebanMode').value === 'manual';

        const colHeader = document.getElementById('colHeaderLoad');
        if (colHeader) {
            colHeader.innerHTML = isManual ? 'Beban W<sub>x</sub> (kN)' : 'Auto (kN)';
        }

        container.innerHTML = '';
        this.floorConfigs.forEach((cfg, idx) => {
            const floorNum = idx + 1;
            const isRoof = floorNum === this.floorConfigs.length;
            const row = document.createElement('div');
            row.className = 'grid grid-cols-12 items-center gap-1.5 bg-slate-900/80 px-2 py-1.5 rounded-lg border border-slate-800';
            row.innerHTML = `
                <div class="col-span-4 flex items-center gap-1">
                    <span class="text-[11px] font-semibold text-slate-200">Lantai ${floorNum}</span>
                    ${isRoof ? '<span class="text-[9px] px-1 rounded bg-teal-500/20 text-teal-300 font-bold">Atap</span>' : ''}
                </div>
                <div class="col-span-4">
                    <input type="number" step="0.1" min="1" value="${cfg.height}" data-idx="${idx}" aria-label="Tinggi Lantai ${floorNum}"
                        class="floor-height-input w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-white text-center font-semibold focus:outline-none">
                </div>
                <div class="col-span-4">
                    <input type="number" step="50" min="0" value="${cfg.weight}" data-idx="${idx}" aria-label="Beban Lantai ${floorNum}"
                        ${isManual ? '' : 'disabled'}
                        class="floor-weight-input w-full bg-slate-950 border ${isManual ? 'border-teal-500/50 text-teal-200' : 'border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'} rounded px-1.5 py-1 text-xs text-center font-semibold focus:outline-none">
                </div>
            `;
            container.appendChild(row);
        });

        container.querySelectorAll('.floor-height-input').forEach(inp => {
            inp.addEventListener('input', e => {
                const i = Number(e.target.dataset.idx);
                this.floorConfigs[i].height = sanitizePositiveNumber(e.target.value, 3.5);
                this.onChange();
            });
        });

        container.querySelectorAll('.floor-weight-input').forEach(inp => {
            inp.addEventListener('input', e => {
                const i = Number(e.target.dataset.idx);
                this.floorConfigs[i].weight = sanitizeNonNegativeNumber(e.target.value, 0);
                this.onChange();
            });
        });
    }

    openDrawer(step, onResize) {
        const sideDrawer = document.getElementById('sideDrawer');
        const railButtons = document.querySelectorAll('.rail-btn[data-step-target]');
        const stepPanels = document.querySelectorAll('[data-form-step]');

        if (this.activeDrawerStep === step && !sideDrawer.classList.contains('closed')) {
            this.closeDrawer(onResize);
            return;
        }

        this.activeDrawerStep = step;
        sideDrawer.classList.remove('closed');
        document.getElementById('brandToggle').setAttribute('aria-expanded', 'true');

        railButtons.forEach(btn => btn.classList.toggle('active', Number(btn.dataset.stepTarget) === step));
        stepPanels.forEach(panel => panel.classList.toggle('hidden', Number(panel.dataset.formStep) !== step));

        if (step === 4) this.onChange();
        if (onResize) setTimeout(onResize, 540);
    }

    closeDrawer(onResize) {
        const sideDrawer = document.getElementById('sideDrawer');
        const railButtons = document.querySelectorAll('.rail-btn[data-step-target]');
        this.activeDrawerStep = null;
        sideDrawer.classList.add('closed');
        document.getElementById('brandToggle').setAttribute('aria-expanded', 'false');
        railButtons.forEach(btn => btn.classList.remove('active'));
        if (onResize) setTimeout(onResize, 540);
    }

    resetAll() {
        document.getElementById('soilClass').value = 'SD';
        document.getElementById('ss_map').value = '0.95';
        document.getElementById('s1_map').value = '0.45';
        document.getElementById('kategoriRisiko').value = '1.0';
        document.getElementById('r_val').value = '8.0';
        document.getElementById('cd').value = '5.5';
        document.getElementById('tipeStruktur').value = 'beton';
        document.getElementById('kdsOverride').value = 'D';
        document.getElementById('lengthX').value = '30';
        document.getElementById('lengthY').value = '15';
        document.getElementById('npx').value = '4';
        document.getElementById('npy').value = '6';
        document.getElementById('bebanMode').value = 'manual';
        this.floorConfigs = structuredClone(DEFAULT_FLOOR_CONFIGS);
        document.getElementById('numFloors').value = String(this.floorConfigs.length);
        this.renderFloorConfigRows();
        this.onChange();
    }

    _bindDrawerEvents() {
        document.getElementById('brandToggle').addEventListener('click', () => {
            if (document.getElementById('sideDrawer').classList.contains('closed')) {
                this.openDrawer(1);
            } else {
                this.closeDrawer();
            }
        });

        document.querySelectorAll('.rail-btn[data-step-target]').forEach(btn => {
            btn.addEventListener('click', () => this.openDrawer(Number(btn.dataset.stepTarget)));
        });

        ['closeDrawerBtn1', 'closeDrawerBtn2', 'closeDrawerBtn3', 'closeDrawerBtn4'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', () => this.closeDrawer());
        });
    }

    _bindFloorControls() {
        document.getElementById('btnAddFloor').addEventListener('click', () => {
            this.syncFloorCount(this.floorConfigs.length + 1);
        });

        document.getElementById('btnRemoveFloor').addEventListener('click', () => {
            if (this.floorConfigs.length > 1) {
                this.syncFloorCount(this.floorConfigs.length - 1);
            }
        });

        document.getElementById('numFloors').addEventListener('change', e => {
            this.syncFloorCount(e.target.value);
        });

        document.getElementById('btnCopyFloor1').addEventListener('click', () => {
            if (this.floorConfigs.length === 0) return;
            const refHeight = this.floorConfigs[0].height;
            const refWeight = this.floorConfigs[0].weight;
            this.floorConfigs.forEach(c => {
                c.height = refHeight;
                c.weight = refWeight;
            });
            this.renderFloorConfigRows();
            this.onChange();
        });

        document.getElementById('bebanMode').addEventListener('change', () => {
            this.renderFloorConfigRows();
            this.onChange();
        });

        document.getElementById('btnResetAll').addEventListener('click', () => this.resetAll());
    }

    _bindInputListeners() {
        document.querySelectorAll('#quakeForm input, #quakeForm select').forEach(input => {
            if (input.id === 'numFloors') return;
            input.addEventListener('input', () => this.onChange());
            input.addEventListener('change', () => this.onChange());
        });
    }
}
