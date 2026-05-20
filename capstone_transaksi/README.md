# 📊 CAPSTONE_TRANSAKSI
Proyek ini menghasilkan dataset sintetis transaksi pengguna, melakukan pembersihan data, eksplorasi, dan menyediakan dashboard interaktif dengan Streamlit.

## 📁 Struktur Folder

```bash
CAPSTONE_TRANSAKSI/
├── dashboard/
│   └── app.py
├── data/
│   ├── processed/
│   │   └── dataset_fintech_clean.csv
│   └── raw/
│       ├── data_sintetis.py
│       └── dataset_fintech.csv
├── notebook/
│   └── notebook.ipynb
├── README.md
└── requirements.txt
```

---

## 🛠️ Tech Stack

- Python
- Pandas
- NumPy
- Matplotlib
- Seaborn
- Streamlit

---

## 🚀 Cara Menjalankan Project

### Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Jalankan Dashboard Streamlit
```bash
streamlit run dashboard/app.py
