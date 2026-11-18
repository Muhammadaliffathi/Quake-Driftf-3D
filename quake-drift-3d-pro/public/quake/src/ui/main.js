// Entry Point Aplikasi Quake-Drift 3D Pro
import { calculateSeismicAnalysis } from '../logic/seismic.js';
import { FormController } from './form.js';
import { Viewer3D } from './draw3d.js';
import { render2DPortals } from './draw2d.js';
import { renderAnalysisSummary, renderTableWeightBreakdown, renderTableFx } from './render.js';
import { exportStructureToKML } from './util.js';

let lastResult = null;

window.addEventListener('DOMContentLoaded', () => {
    // Gandakan kartu hasil ke Step 4 Drawer
    const resultsStepContent = document.getElementById('resultsStepContent');
    if (resultsStepContent) {
        resultsStepContent.append(
            document.getElementById('weightResultsCard').cloneNode(true),
            document.getElementById('distributionResultsCard').cloneNode(true)
        );
        resultsStepContent.querySelectorAll('[id]').forEach(el => {
            el.dataset.mirrorId = el.id;
            el.removeAttribute('id');
        });
    }

    const viewer3D = new Viewer3D('canvas3dContainer', 'modelTooltip');

    const runAnalysis = () => {
        const isComplete = formController.hasCompleteInputs();
        document.querySelectorAll('[data-empty-state]').forEach(state => {
            state.classList.toggle('visible', !isComplete);
        });
        if (!isComplete) return;

        const params = formController.getParameters();
        const result = calculateSeismicAnalysis(params);
        lastResult = result;

        if (params.bebanMode === 'auto') {
            formController.syncAutoWeights(result.floorWeights_kN);
        }

        renderAnalysisSummary(result);
        renderTableWeightBreakdown(result.weightBreakdown);
        renderTableFx(result.floorData);
        render2DPortals(result.N, params.npx, params.npy, result.floorData, result.floorElevations);

        viewer3D.renderBuilding({
            N: result.N,
            floorElevations: result.floorElevations,
            Npx: params.npx,
            Npy: params.npy,
            fixList: result.fixList,
            fiyList: result.fiyList,
            floorWeights_kN: result.floorWeights_kN,
            sectionProps: {
                bKolom: params.bKolom,
                hKolom: params.hKolom,
                bBalok: params.bBalok,
                hBalok: params.hBalok,
                tPelat: params.tPelat
            }
        });
    };

    const formController = new FormController(runAnalysis);
    formController.init();
    runAnalysis();

    let resizeFrame;
    const redrawVisuals = () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            viewer3D.resize();
            if (lastResult) {
                const params = formController.getParameters();
                render2DPortals(lastResult.N, params.npx, params.npy, lastResult.floorData, lastResult.floorElevations);
            }
        });
    };
    new ResizeObserver(redrawVisuals).observe(document.querySelector('main'));

    // Tombol Mode Siang / Malam
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        const isLight = html.classList.toggle('light');
        html.classList.toggle('dark', !isLight);
        document.getElementById('themeLabel').innerText = isLight ? 'Mode Siang' : 'Mode Malam';
        document.getElementById('themeIcon').className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        viewer3D.setTheme(isLight);
    });

    // Tombol Simulasi Gempa
    document.getElementById('btnToggleQuake').addEventListener('click', () => {
        const active = viewer3D.toggleQuakeSimulation();
        const btnText = document.getElementById('quakeBtnText');
        const btn = document.getElementById('btnToggleQuake');
        if (active) {
            btnText.innerText = 'Hentikan Simulasi Gempa';
            btn.classList.replace('bg-rose-500/15', 'bg-emerald-500/20');
            btn.classList.replace('text-rose-300', 'text-emerald-300');
            btn.classList.replace('border-rose-500/40', 'border-emerald-500/40');
        } else {
            btnText.innerText = 'Mulai Simulasi Gempa';
            btn.classList.replace('bg-emerald-500/20', 'bg-rose-500/15');
            btn.classList.replace('text-emerald-300', 'text-rose-300');
            btn.classList.replace('border-rose-500/40', 'border-rose-500/40');
        }
    });

    // Ekspor KML & PDF
    document.getElementById('exportKml').addEventListener('click', () => {
        if (!lastResult) return;
        const params = formController.getParameters();
        exportStructureToKML({
            floorData: lastResult.floorData,
            lx: params.lx,
            ly: params.ly
        });
    });

    document.getElementById('exportPdf').addEventListener('click', () => window.print());
    document.getElementById('btnCalculate').addEventListener('click', runAnalysis);
});
