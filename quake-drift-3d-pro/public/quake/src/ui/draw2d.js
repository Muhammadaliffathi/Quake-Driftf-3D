// Visualisasi Elevasi Portal 2D (Arah X & Arah Y)
export function render2DPortals(N, Npx, Npy, floorData, floorElevations) {
    drawSingle2DPortal('canvas2dX', N, Npx, floorData, floorElevations, 'Fix', '#ef4444', 'Portal Arah X');
    drawSingle2DPortal('canvas2dY', N, Npy, floorData, floorElevations, 'Fiy', '#f59e0b', 'Portal Arah Y');
}

function drawSingle2DPortal(canvasId, N, numBays, floorData, floorElevations, forceKey, arrowColor, titleLabel) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 260);
    const height = Math.max(rect.height, 320);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const compact = width < 430;
    const marginLeft = compact ? 74 : 96;
    const marginRight = compact ? 32 : 50;
    const marginTop = compact ? 40 : 48;
    const marginBottom = compact ? 46 : 56;
    const frameWidth = Math.max(120, width - marginLeft - marginRight);
    const frameHeight = Math.max(180, height - marginTop - marginBottom);
    const bayWidth = numBays > 1 ? frameWidth / (numBays - 1) : frameWidth;
    const totalH = floorElevations[N] || 1;
    const groundY = height - marginBottom;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = compact ? 1.35 : 1.7;

    for (let i = 1; i <= N; i++) {
        const y = groundY - ((floorElevations[i] / totalH) * frameHeight);
        ctx.beginPath();
        ctx.moveTo(marginLeft, y);
        ctx.lineTo(marginLeft + frameWidth, y);
        ctx.stroke();

        ctx.fillStyle = '#aebed0';
        ctx.font = `600 ${compact ? 9 : 10}px Poppins, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(`L${i}`, marginLeft + frameWidth + 8, y + 3);
    }

    for (let b = 0; b < numBays; b++) {
        const x = numBays > 1 ? marginLeft + (b * bayWidth) : marginLeft + frameWidth / 2;
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x, groundY - frameHeight);
        ctx.stroke();

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(x - 7, groundY);
        ctx.lineTo(x + 7, groundY);
        ctx.stroke();

        for (let h = -5; h <= 5; h += 5) {
            ctx.beginPath();
            ctx.moveTo(x + h, groundY);
            ctx.lineTo(x + h - 4, groundY + 6);
            ctx.stroke();
        }
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = compact ? 1.35 : 1.7;
    }

    floorData.forEach(row => {
        const y = groundY - ((floorElevations[row.floor] / totalH) * frameHeight);
        const arrowLength = compact ? 22 : 30;
        const startX = marginLeft - arrowLength - 5;
        const endX = marginLeft - 4;

        ctx.strokeStyle = arrowColor;
        ctx.fillStyle = arrowColor;
        ctx.lineWidth = compact ? 1.7 : 2;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(endX, y);
        ctx.lineTo(endX - 7, y - 4.5);
        ctx.lineTo(endX - 7, y + 4.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.font = `600 ${compact ? 8 : 10}px Poppins, sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(`${row[forceKey].toFixed(2)}`, startX - 5, y + 3);
    });

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `600 ${compact ? 10 : 11}px Poppins, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(titleLabel, marginLeft + frameWidth / 2, height - 15);
}
