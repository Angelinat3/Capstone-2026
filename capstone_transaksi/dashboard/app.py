import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import io

# ==================== PAGE CONFIG ====================
st.set_page_config(
    page_title="Dashboard Analisis Transaksi Pengguna",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==================== CUSTOM CSS ====================
st.markdown("""
<style>

/* metric card */
div[data-testid="metric-container"] {
    background-color: #ffffff10;
    border: 1px solid #ffffff20;
    padding: 15px;
    border-radius: 12px;
}

/* metric label */
div[data-testid="metric-container"] label {
    font-size: 15px;
    font-weight: 600;
}

/* metric value */
div[data-testid="stMetricValue"] {
    font-size: 34px;
    font-weight: 700;
}

/* metric delta */
div[data-testid="stMetricDelta"] {
    font-size: 14px;
}

</style>
""", unsafe_allow_html=True)

# ==================== FORMAT RUPIAH ====================
def format_rupiah(num):

    sign = "-" if num < 0 else ""
    num = abs(num)

    if num >= 1_000_000_000:
        return f"{sign}{num/1_000_000_000:.1f}M"

    elif num >= 1_000_000:
        return f"{sign}{num/1_000_000:.1f}JT"

    elif num >= 1_000:
        return f"{sign}{num/1_000:.1f}RB"

    return f"{sign}{num:.0f}"

# ==================== LOAD DATA ====================
@st.cache_data
def load_data():

    df = pd.read_csv(
        "../data/processed/dataset_fintech_clean.csv",
        parse_dates=["tanggal"]
    )

    return df

df = load_data()

# ==================== SIDEBAR ====================
st.sidebar.title("🔍 Filter Data")

# profil
profil_options = ["Semua"] + sorted(df["profil_user"].unique())

selected_profil = st.sidebar.selectbox(
    "👤 Profil Pengguna",
    profil_options
)

# kota
kota_options = ["Semua"] + sorted(df["lokasi"].unique())

selected_kota = st.sidebar.selectbox(
    "📍 Kota",
    kota_options
)

# kategori
kategori_options = ["Semua"] + sorted(df["kategori"].unique())

selected_kategori = st.sidebar.selectbox(
    "📂 Kategori",
    kategori_options
)

# jenis
jenis_options = ["Semua", "Pendapatan", "Pengeluaran"]

selected_jenis = st.sidebar.selectbox(
    "💵 Jenis Transaksi",
    jenis_options
)

# tanggal
min_date = df["tanggal"].min().date()
max_date = df["tanggal"].max().date()

start_date, end_date = st.sidebar.date_input(
    "📅 Rentang Tanggal",
    value=(min_date, max_date),
    min_value=min_date,
    max_value=max_date
)

# outlier
iqr_multiplier = st.sidebar.slider(
    "⚠️ IQR Multiplier",
    min_value=0.5,
    max_value=3.0,
    value=1.5,
    step=0.1
)

# reset
if st.sidebar.button("🔄 Reset Filter"):
    st.cache_data.clear()
    st.rerun()

# ==================== FILTER DATA ====================
filtered_df = df.copy()

if selected_profil != "Semua":
    filtered_df = filtered_df[
        filtered_df["profil_user"] == selected_profil
    ]

if selected_kota != "Semua":
    filtered_df = filtered_df[
        filtered_df["lokasi"] == selected_kota
    ]

if selected_kategori != "Semua":
    filtered_df = filtered_df[
        filtered_df["kategori"] == selected_kategori
    ]

if selected_jenis != "Semua":
    filtered_df = filtered_df[
        filtered_df["jenis"] == selected_jenis
    ]

filtered_df = filtered_df[
    (filtered_df["tanggal"].dt.date >= start_date) &
    (filtered_df["tanggal"].dt.date <= end_date)
]

# ==================== OUTLIER ====================
Q1 = filtered_df["jumlah"].quantile(0.25)
Q3 = filtered_df["jumlah"].quantile(0.75)

IQR = Q3 - Q1

lower_bound = Q1 - iqr_multiplier * IQR
upper_bound = Q3 + iqr_multiplier * IQR

outlier_mask = (
    (filtered_df["jumlah"] < lower_bound) |
    (filtered_df["jumlah"] > upper_bound)
)

outlier_count = outlier_mask.sum()

outlier_percent = (
    outlier_count / len(filtered_df) * 100
    if len(filtered_df) > 0 else 0
)

# ==================== HEADER ====================
st.title("💰 Dashboard Analisis Transaksi Pengguna")

st.markdown(
    f"Menampilkan data dari "
    f"**{start_date}** hingga **{end_date}**"
)

# ==================== METRICS ====================
total_transaksi = len(filtered_df)

total_pendapatan = filtered_df[
    filtered_df["jenis"] == "Pendapatan"
]["jumlah"].sum()

total_pengeluaran = filtered_df[
    filtered_df["jenis"] == "Pengeluaran"
]["jumlah"].sum()

selisih = total_pendapatan - total_pengeluaran

col1, col2, col3, col4, col5 = st.columns(5)

with col1:
    st.metric(
        "📊 Total",
        f"{total_transaksi:,}"
    )

with col2:
    st.metric(
        "💹 Pendapatan",
        format_rupiah(total_pendapatan)
    )

with col3:
    st.metric(
        "💸 Pengeluaran",
        format_rupiah(total_pengeluaran)
    )

with col4:
    st.metric(
        "📉 Surplus",
        format_rupiah(selisih)
    )

with col5:
    st.metric(
        "⚠️ Outlier",
        f"{outlier_count:,}"
    )

st.divider()

# ==================== TABS ====================
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📊 Ringkasan",
    "📈 Tren",
    "📍 Distribusi",
    "⚠️ Outlier",
    "📋 Data"
])

# ==================== TAB 1 ====================
with tab1:

    col1, col2 = st.columns(2)

    with col1:

        cashflow = (
            filtered_df
            .groupby("jenis")["jumlah"]
            .sum()
            .reset_index()
        )

        if not cashflow.empty:

            cashflow["label"] = (
                cashflow["jumlah"]
                .apply(format_rupiah)
            )

            fig_bar = px.bar(
                cashflow,
                x="jenis",
                y="jumlah",
                color="jenis",
                text="label",
                color_discrete_map={
                    "Pendapatan": "#2ecc71",
                    "Pengeluaran": "#e74c3c"
                },
                title="Pendapatan vs Pengeluaran"
            )

            fig_bar.update_traces(
                textposition="inside"
            )

            fig_bar.update_layout(
                yaxis_title="Total",
                xaxis_title="Jenis",
                showlegend=True
            )

            st.plotly_chart(
                fig_bar,
                use_container_width=True
            )

    with col2:

        expense_df = filtered_df[
            filtered_df["jenis"] == "Pengeluaran"
        ]

        if not expense_df.empty:

            kategori_expense = (
                expense_df
                .groupby("kategori")["jumlah"]
                .sum()
                .sort_values(ascending=False)
            )

            fig_pie = px.pie(
                values=kategori_expense.values,
                names=kategori_expense.index,
                hole=0.4,
                title="Kategori Pengeluaran"
            )

            st.plotly_chart(
                fig_pie,
                use_container_width=True
            )

# ==================== TAB 2 ====================
with tab2:

    col1, col2 = st.columns(2)

    with col1:

        daily = (
            filtered_df
            .groupby("tanggal")["jumlah"]
            .sum()
            .reset_index()
        )

        fig_line = px.line(
            daily,
            x="tanggal",
            y="jumlah",
            title="Tren Harian"
        )

        st.plotly_chart(
            fig_line,
            use_container_width=True
        )

with col2:

    top_merchants = (
        filtered_df["merchant"]
        .value_counts()
        .head(10)
        .reset_index()
    )

    top_merchants.columns = ["merchant", "count"]

    fig_barh = px.bar(
        top_merchants,
        x="count",
        y="merchant",
        orientation="h",
        text="count",
        title="Top Merchant"
    )

    fig_barh.update_layout(
        yaxis=dict(autorange="reversed")
    )

    st.plotly_chart(
        fig_barh,
        use_container_width=True
    )

# ==================== TAB 3 ====================
with tab3:

    col1, col2 = st.columns(2)

    with col1:

        city_dist = (
            filtered_df["lokasi"]
            .value_counts()
            .reset_index()
        )

        city_dist.columns = ["lokasi", "count"]

        fig_city = px.bar(
            city_dist,
            x="lokasi",
            y="count",
            color="lokasi",
            text="count",
            title="Distribusi Kota"
        )

        st.plotly_chart(
            fig_city,
            use_container_width=True
        )

    with col2:

        payment_dist = (
            filtered_df["metode_pembayaran"]
            .value_counts()
            .reset_index()
        )

        payment_dist.columns = ["metode", "count"]

        fig_payment = px.pie(
            payment_dist,
            values="count",
            names="metode",
            hole=0.4,
            title="Metode Pembayaran"
        )

        st.plotly_chart(
            fig_payment,
            use_container_width=True
        )

# ==================== TAB 4 ====================
with tab4:

    st.subheader("Deteksi Outlier")

    st.write(
        f"Batas bawah: **{format_rupiah(lower_bound)}** | "
        f"Batas atas: **{format_rupiah(upper_bound)}**"
    )

    if outlier_count > 0:

        outlier_df = filtered_df[outlier_mask]

        st.warning(
            f"Ditemukan {outlier_count:,} outlier "
            f"({outlier_percent:.1f}%)"
        )

        col1, col2, col3 = st.columns(3)

        with col1:
            st.metric(
                "Min",
                format_rupiah(
                    outlier_df["jumlah"].min()
                )
            )

        with col2:
            st.metric(
                "Max",
                format_rupiah(
                    outlier_df["jumlah"].max()
                )
            )

        with col3:
            st.metric(
                "Median",
                format_rupiah(
                    outlier_df["jumlah"].median()
                )
            )

        st.dataframe(
            outlier_df,
            use_container_width=True,
            height=400
        )

    else:
        st.success("Tidak ada outlier")

# ==================== TAB 5 ====================
with tab5:

    st.dataframe(
        filtered_df,
        use_container_width=True,
        height=500
    )

    csv_buffer = io.StringIO()

    filtered_df.to_csv(
        csv_buffer,
        index=False
    )

    st.download_button(
        label="📥 Download CSV",
        data=csv_buffer.getvalue(),
        file_name=f"transaksi_{datetime.now().strftime('%Y%m%d')}.csv",
        mime="text/csv"
    )

# ==================== FOOTER ====================
st.divider()

st.caption(
    "Dashboard Analisis Transaksi Pengguna"
)