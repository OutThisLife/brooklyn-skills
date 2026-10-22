#!/usr/bin/env python3
"""Render showcase net-metric chart (synthetic data, engraved monochrome)."""
from __future__ import annotations

from datetime import date, timedelta
from math import sin
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import numpy as np

OUT = Path(__file__).resolve().parents[1] / "references" / "examples"
START = date(2026, 3, 3)
N = 56
MA = 7


def synthetic_net(day_i: int, stream: int) -> float:
    t = day_i / 8
    base = 12 * sin(t + stream * 0.9) + (day_i - 28) * 1.4 + stream * 6
    return base + 8 * sin(t * 2.3 + stream)


def smooth_xy(x, y, steps=14):
    xn = mdates.date2num(x)
    out_x, out_y = [], []
    for i in range(len(xn) - 1):
        p0, p1, p2, p3 = y[max(i - 1, 0)], y[i], y[i + 1], y[min(i + 2, len(y) - 1)]
        x0, x1 = xn[i], xn[i + 1]
        for t in range(steps):
            u = t / steps
            u2, u3 = u * u, u * u * u
            yy = 0.5 * (
                (2 * p1)
                + (-p0 + p2) * u
                + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2
                + (-p0 + 3 * p1 - 3 * p2 + p3) * u3
            )
            out_x.append(x0 + (x1 - x0) * u)
            out_y.append(yy)
    out_x.append(xn[-1])
    out_y.append(y[-1])
    return mdates.num2date(out_x), out_y


def main():
    days = [START + timedelta(i) for i in range(N)]
    names = ["North", "East", "South", "West"]
    colors = ["#777777", "#999999", "#bbbbbb", "#555555"]
    series = {n: [synthetic_net(i, j) for i in range(N)] for j, n in enumerate(names)}
    combined = [sum(series[n][i] for n in names) / len(names) for i in range(N)]
    comb_ma = [
        sum(combined[max(0, i - MA + 1) : i + 1]) / (i - max(0, i - MA + 1) + 1) for i in range(N)
    ]
    shown = days[MA - 1 :]

    plt.rcParams.update(
        {
            "font.family": "serif",
            "font.serif": ["STIX Two Text", "Times New Roman", "DejaVu Serif"],
            "axes.labelsize": 11,
            "figure.facecolor": "white",
        }
    )
    fig, ax = plt.subplots(figsize=(12, 5.5), dpi=200)
    ax.set_facecolor("white")

    band0, band1 = days[18], days[31]
    event = days[42]
    ax.axvspan(band0, band1 + timedelta(1), color="#efefef", lw=0, zorder=0)
    ax.axvline(event, color="#888888", ls=(0, (5, 4)), lw=0.9, zorder=1)

    for name, col in zip(names, colors):
        y = series[name][MA - 1 :]
        sx, sy = smooth_xy(shown, y)
        ax.plot(sx, sy, color=col, lw=0.55, solid_capstyle="round", zorder=2)

    sx, sy = smooth_xy(shown, comb_ma[MA - 1 :])
    ax.plot(sx, sy, color="#111111", lw=1.05, solid_capstyle="round", zorder=3, label=f"All streams ({MA}-day avg)")

    ax.set_title("Net queue pressure per day", loc="left", fontsize=14, fontweight="bold", pad=10)
    ax.set_ylabel("Opened minus cleared")
    ax.grid(axis="y", color="#dddddd", lw=0.6)
    ax.spines[["top", "right"]].set_visible(False)
    ax.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday=mdates.MO))
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %-d"))
    plt.setp(ax.get_xticklabels(), rotation=45, ha="right", fontsize=8)
    ax.legend(frameon=False, loc="upper left", fontsize=9)
    ax.text(band0 + timedelta(0.5), ax.get_ylim()[1] * 0.92, "calibration window", fontsize=8, fontstyle="italic", color="#555555")
    fig.text(0.99, 0.02, "Illustrative synthetic series for skill reference", ha="right", fontsize=8, fontstyle="italic", color="#666666")
    fig.tight_layout()
    OUT.mkdir(parents=True, exist_ok=True)
    fig.savefig(OUT / "reference-chart.png", bbox_inches="tight", facecolor="white")
    plt.close()
    print("Wrote", OUT / "reference-chart.png")


if __name__ == "__main__":
    main()
