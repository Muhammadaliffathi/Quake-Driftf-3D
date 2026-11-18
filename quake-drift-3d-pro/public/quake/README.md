# Quake-Drift 3D Pro (SNI 1726:2019)

Aplikasi web interaktif berbahasa Indonesia untuk analisis beban gempa statik ekuivalen, klasifikasi situs, distribusi gaya lateral vertikal ($F_x$), dan visualisasi struktur portal 2D serta 3D.

## Struktur Proyek Modular

```text
quake-drift-3d-pro/
├── dist/
│   └── index.html          # Hasil build standalone siap pakai
├── docs/
│   └── index.html          # Salinan dokumentasi / GitHub Pages
├── src/
│   ├── logic/
│   │   ├── constants.js    # Tabel koefisien situs Fa, Fv & periode SNI 1726:2019
│   │   ├── seismic.js      # Mesin perhitungan geser dasar & distribusi gaya
│   │   └── validate.js     # Validasi & sanitasi input
│   └── ui/
│       ├── draw2d.js       # Renderer elevasi portal 2D (Arah X & Y)
│       ├── draw3d.js       # Renderer 3D Three.js & simulasi gempa
│       ├── form.js         # Kontrol panel parameter, tambah lantai & beban per lantai
│       ├── index.html      # Kerangka utama antarmuka pengguna
│       ├── main.js         # Entry point aplikasi
│       ├── render.js       # Pembaruan kartu metrik & tabel hasil
│       ├── styles.css      # Gaya tampilan mode malam & mode siang
│       └── util.js         # Format angka & ekspor file KML
├── x-tests/
│   ├── retaining.test.js   # Pengujian perhitungan seismik
│   └── validate.test.js    # Pengujian validasi input
├── build.js                # Script bundler otomatis ke dist/ dan docs/
├── package.json
└── README.md
```

## Cara Menjalankan

1. **Langsung di Browser:** Buka file `dist/index.html` atau `docs/index.html`.
2. **Membangun Ulang (`build.js`):** Jalankan `npm run build` menggunakan Node.js untuk menggabungkan seluruh modul `src/` ke dalam `dist/index.html` dan `docs/index.html`.
3. **Menjalankan Pengujian:** Jalankan `npm test`.
