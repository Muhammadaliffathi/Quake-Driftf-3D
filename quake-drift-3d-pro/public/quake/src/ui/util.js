// Utilitas format angka, ekspor KML berbahasa Indonesia, dan helper DOM
export function formatNumberID(value, maxDecimals = 0) {
    return Number(value).toLocaleString('id-ID', { maximumFractionDigits: maxDecimals });
}

export function exportStructureToKML({ floorData, lx, ly }) {
    const N = floorData.length;
    const baseLat = -6.200000;
    const baseLon = 106.816666;
    const mToDeg = 1 / 111320;

    let placemarks = '';
    floorData.forEach(row => {
        const cumH = row.hx;
        const dLat = (ly / 2) * mToDeg;
        const dLon = (lx / 2) * mToDeg;
        placemarks += `
    <Placemark>
      <name>Diafragma Lantai ${row.floor} (Elevasi ${cumH.toFixed(2)} m)</name>
      <description>Beban Seismik Wx: ${row.wx.toFixed(1)} kN | Gaya Lateral Fx: ${row.Fx.toFixed(2)} kN | Fix: ${row.Fix.toFixed(2)} kN | Fiy: ${row.Fiy.toFixed(2)} kN</description>
      <Polygon>
        <extrude>0</extrude>
        <altitudeMode>relativeToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              ${(baseLon - dLon).toFixed(7)},${(baseLat - dLat).toFixed(7)},${cumH.toFixed(2)}
              ${(baseLon + dLon).toFixed(7)},${(baseLat - dLat).toFixed(7)},${cumH.toFixed(2)}
              ${(baseLon + dLon).toFixed(7)},${(baseLat + dLat).toFixed(7)},${cumH.toFixed(2)}
              ${(baseLon - dLon).toFixed(7)},${(baseLat + dLat).toFixed(7)},${cumH.toFixed(2)}
              ${(baseLon - dLon).toFixed(7)},${(baseLat - dLat).toFixed(7)},${cumH.toFixed(2)}
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>`;
    });

    const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Model Struktur Gedung 3D - Quake-Drift Pro (${N} Lantai)</name>
    <description>Hasil Analisis Beban Gempa SNI 1726:2019</description>${placemarks}
  </Document>
</kml>`;

    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Struktur_Gedung_${N}_Lantai_SNI1726.kml`;
    a.click();
    URL.revokeObjectURL(url);
}
