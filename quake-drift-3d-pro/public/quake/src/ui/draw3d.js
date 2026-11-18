// Visualisasi 3D Struktur Gedung & Simulasi Gempa (Three.js)
export class Viewer3D {
    constructor(containerId, tooltipId) {
        this.container = document.getElementById(containerId);
        this.tooltip = document.getElementById(tooltipId);
        this.quakeSimActive = false;
        this.quakeTime = 0;
        this.lastFrameTime = performance.now();
        this.quakeBlend = 0;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x090d16);

        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.set(28, 22, 36);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
        dirLight.position.set(25, 40, 25);
        this.scene.add(dirLight);

        this.gridHelper = new THREE.GridHelper(60, 30, 0x3b82f6, 0x1e293b);
        this.scene.add(this.gridHelper);

        this.buildingGroup = new THREE.Group();
        this.scene.add(this.buildingGroup);

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        this._bindEvents();
        this._animate = this._animate.bind(this);
        this._animate();
    }

    _bindEvents() {
        this.renderer.domElement.addEventListener('pointermove', event => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            this.raycaster.setFromCamera(this.pointer, this.camera);
            const hit = this.raycaster.intersectObjects(this.buildingGroup.children, true).find(item => item.object.userData.elementType);
            if (!hit) {
                this.tooltip.style.display = 'none';
                this.renderer.domElement.style.cursor = 'grab';
                return;
            }
            const data = hit.object.userData;
            this.tooltip.innerHTML = `<strong>${data.elementType}</strong><span>${data.dimensions}</span><br><span class="text-slate-400">${data.cut}</span>`;
            this.tooltip.style.display = 'block';
            this.tooltip.style.left = `${Math.min(event.clientX - rect.left + 14, rect.width - 192)}px`;
            this.tooltip.style.top = `${Math.max(10, event.clientY - rect.top - 68)}px`;
            this.renderer.domElement.style.cursor = 'crosshair';
        });

        this.renderer.domElement.addEventListener('pointerleave', () => {
            this.tooltip.style.display = 'none';
        });

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.container || !this.renderer) return;
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    setTheme(isLight) {
        this.scene.background = new THREE.Color(isLight ? 0xe2e8f0 : 0x090d16);
    }

    toggleQuakeSimulation() {
        this.quakeSimActive = !this.quakeSimActive;
        return this.quakeSimActive;
    }

    _animate() {
        requestAnimationFrame(this._animate);
        const now = performance.now();
        const delta = Math.min((now - this.lastFrameTime) / 1000, 0.05);
        this.lastFrameTime = now;
        const targetBlend = this.quakeSimActive ? 1 : 0;
        this.quakeBlend += (targetBlend - this.quakeBlend) * (1 - Math.exp(-delta * 7));

        if (this.buildingGroup) {
            this.quakeTime += delta * 3.5;
            this.buildingGroup.children.forEach(obj => {
                if (obj.userData.baseX !== undefined && obj.userData.normHeight !== undefined) {
                    const amp = obj.userData.normHeight * 0.55;
                    const sway = Math.sin(this.quakeTime) * .72 + Math.sin(this.quakeTime * .47) * .28;
                    const targetX = obj.userData.baseX + sway * amp * this.quakeBlend;
                    obj.position.x += (targetX - obj.position.x) * (1 - Math.exp(-delta * 18));
                }
            });
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    renderBuilding({ N, floorElevations, Npx, Npy, fixList, fiyList, floorWeights_kN, sectionProps }) {
        while (this.buildingGroup.children.length > 0) {
            this.buildingGroup.remove(this.buildingGroup.children[0]);
        }

        const bayXWidth = 3.5;
        const bayYWidth = 3.5;
        const totalWidthX = (Npx - 1) * bayXWidth;
        const totalWidthY = (Npy - 1) * bayYWidth;
        const totalH = floorElevations[N] || 1;
        const { bKolom, hKolom, bBalok, hBalok, tPelat } = sectionProps;

        const columnMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
        const beamXGeo = new THREE.BoxGeometry(Math.max(0.5, totalWidthX), 0.25, 0.25);
        const beamYGeo = new THREE.BoxGeometry(0.25, 0.25, Math.max(0.5, totalWidthY));
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x475569 });

        const slabGeo = new THREE.BoxGeometry(totalWidthX + 0.6, 0.1, totalWidthY + 0.6);
        const slabMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.35 });

        for (let f = 0; f <= N; f++) {
            const posY = floorElevations[f];
            const normH = posY / totalH;

            if (f > 0) {
                const slab = new THREE.Mesh(slabGeo, slabMat);
                slab.position.set(totalWidthX / 2, posY, totalWidthY / 2);
                slab.userData = {
                    baseX: totalWidthX / 2,
                    normHeight: normH,
                    elementType: `Pelat Lantai ${f}`,
                    dimensions: `${(totalWidthX + 0.6).toFixed(1)} × ${(totalWidthY + 0.6).toFixed(1)} m`,
                    cut: `Beban Lantai: ${floorWeights_kN[f - 1].toFixed(0)} kN | t = ${tPelat.toFixed(2)} m`
                };
                this.buildingGroup.add(slab);
            }

            if (f < N) {
                const nextY = floorElevations[f + 1];
                const currentColumnH = nextY - posY;
                const midNormH = ((posY + nextY) / 2) / totalH;
                const columnGeo = new THREE.BoxGeometry(0.35, currentColumnH, 0.35);

                for (let ix = 0; ix < Npx; ix++) {
                    for (let iy = 0; iy < Npy; iy++) {
                        const column = new THREE.Mesh(columnGeo, columnMat);
                        column.position.set(ix * bayXWidth, posY + currentColumnH / 2, iy * bayYWidth);
                        column.userData = {
                            baseX: ix * bayXWidth,
                            normHeight: midNormH,
                            elementType: `Kolom Beton (Lt. ${f + 1})`,
                            dimensions: `${bKolom.toFixed(2)} × ${hKolom.toFixed(2)} m`,
                            cut: `Tinggi tingkat: ${currentColumnH.toFixed(2)} m`
                        };
                        this.buildingGroup.add(column);
                    }
                }
            }

            if (f > 0) {
                for (let iy = 0; iy < Npy; iy++) {
                    const beamX = new THREE.Mesh(beamXGeo, frameMat);
                    beamX.position.set(totalWidthX / 2, posY, iy * bayYWidth);
                    beamX.userData = {
                        baseX: totalWidthX / 2,
                        normHeight: normH,
                        elementType: 'Balok Arah X',
                        dimensions: `${bBalok.toFixed(2)} × ${hBalok.toFixed(2)} m`,
                        cut: `Bentang ${totalWidthX.toFixed(1)} m`
                    };
                    this.buildingGroup.add(beamX);
                }
                for (let ix = 0; ix < Npx; ix++) {
                    const beamY = new THREE.Mesh(beamYGeo, frameMat);
                    beamY.position.set(ix * bayXWidth, posY, totalWidthY / 2);
                    beamY.userData = {
                        baseX: ix * bayXWidth,
                        normHeight: normH,
                        elementType: 'Balok Arah Y',
                        dimensions: `${bBalok.toFixed(2)} × ${hBalok.toFixed(2)} m`,
                        cut: `Bentang ${totalWidthY.toFixed(1)} m`
                    };
                    this.buildingGroup.add(beamY);
                }

                const Fix = fixList[f - 1];
                const Fiy = fiyList[f - 1];

                const arrowDirX = new THREE.Vector3(1, 0, 0);
                const arrowOriginX = new THREE.Vector3(-2.5, posY, totalWidthY / 2);
                const arrowLengthX = Math.min(Math.max(Fix / 15, 1.8), 6);
                const arrowX = new THREE.ArrowHelper(arrowDirX, arrowOriginX, arrowLengthX, 0xef4444, 1.2, 0.6);
                arrowX.userData = { baseX: -2.5, normHeight: normH };
                this.buildingGroup.add(arrowX);

                const arrowDirY = new THREE.Vector3(0, 0, 1);
                const arrowOriginY = new THREE.Vector3(totalWidthX / 2, posY, -2.5);
                const arrowLengthY = Math.min(Math.max(Fiy / 15, 1.8), 6);
                const arrowY = new THREE.ArrowHelper(arrowDirY, arrowOriginY, arrowLengthY, 0xf59e0b, 1.2, 0.6);
                arrowY.userData = { baseX: totalWidthX / 2, normHeight: normH };
                this.buildingGroup.add(arrowY);
            }
        }

        this.buildingGroup.position.set(-totalWidthX / 2, 0, -totalWidthY / 2);
    }
}
