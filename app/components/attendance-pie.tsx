'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AttendancePieProps {
  brokeragesPresent: number;
  fundsPresent: number;
  absent: number;
  /** Attendance percentage (present / total, 0..100) shown in the donut centre. */
  quorumPercent: number;
  /** Whether quorum is met (majority present) — drives the centre colour. */
  met: boolean;
  labels: { brokerage: string; fund: string; absent: string; quorum: string };
  /** Chart height in px. Large by default for projector display. */
  height?: number;
}

// Present Brokerages = green, Present Funds = blue, Absent = red.
const COLORS = ['#22c55e', '#3b82f6', '#ef4444'];

export function AttendancePie({
  brokeragesPresent,
  fundsPresent,
  absent,
  quorumPercent,
  met,
  labels,
  height = 640,
}: AttendancePieProps) {
  // Render the chart only after the component has mounted on the client, so the
  // container is laid out before ApexCharts measures it. Rendering it during the
  // first (pre-layout) paint is what made it intermittently come up blank.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const series = [brokeragesPresent, fundsPresent, absent];
  const total = series.reduce((a, b) => a + b, 0);
  const ready = mounted && total > 0;
  const centerColor = met ? '#16a34a' : '#dc2626'; // green-600 / red-600

  // ApexCharts measures its container on first draw. After a client-side
  // navigation (menu click) the container can still be 0-wide when the chart
  // first draws, leaving a blank donut that never recovers on its own — and any
  // later series update then goes to that broken instance (text refreshes but
  // the chart doesn't). Once the chart is in the DOM, fire a few staggered
  // resize events so ApexCharts remeasures and redraws; the stagger also covers
  // the async chunk load of react-apexcharts on a cold navigation.
  useEffect(() => {
    if (!ready) return;
    const fire = () => window.dispatchEvent(new Event('resize'));
    const timers = [50, 300, 800].map((ms) => setTimeout(fire, ms));
    return () => timers.forEach(clearTimeout);
  }, [ready]);

  const options: ApexCharts.ApexOptions = {
    chart: { type: 'donut', animations: { enabled: true } },
    labels: [labels.brokerage, labels.fund, labels.absent],
    colors: COLORS,
    stroke: { width: 2 },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      style: { fontSize: '44px', fontWeight: 800 },
      dropShadow: { enabled: false },
      formatter: ((_val: number, opts: { seriesIndex: number; w: { globals: { series: number[] } } }) =>
        opts.seriesIndex === 2 ? '' : String(opts.w.globals.series[opts.seriesIndex])) as (val: number, opts?: unknown) => string,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '62%',
          labels: {
            show: true,
            name: { fontSize: '22px' },
            value: { fontSize: '40px', fontWeight: 800, offsetY: 24 },
            total: {
              show: true,
              showAlways: true,
              label: labels.quorum,
              fontSize: '36px',
              color: centerColor,
              formatter: () => `${quorumPercent}%`,
            },
          },
        },
      },
    },
    tooltip: { style: { fontSize: '18px' } },
    noData: { text: '…' },
  };

  return (
    <div style={{ minHeight: height }} className="attendance-donut flex w-full items-center justify-center">
      {/* Force the slice-number (dataLabel) size via CSS — ApexCharts ignores the fontSize option after mount. */}
      <style>{`.attendance-donut .apexcharts-datalabels text{font-size:40px!important;font-weight:800!important;}`}</style>
      {ready ? (
        <div className="w-full">
          {/* Remount on data change so the donut (and its centre %) always
              redraws with a correctly measured container and the new numbers.
              The key only changes when the counts change, so a stable 5s refresh
              does not remount (no flicker). */}
          <ReactApexChart
            key={`${brokeragesPresent}-${fundsPresent}-${absent}-${height}`}
            type="donut"
            series={series}
            options={options}
            height={height}
            width="100%"
          />
          {/* Custom legend: the two present rows on ONE centered line, with space. */}
          <div className="mt-3 flex flex-nowrap items-center justify-between gap-10 text-3xl md:text-4xl font-bold">
            <span className="flex items-center gap-3 whitespace-nowrap" style={{ color: COLORS[0] }}>
              <span className="inline-block size-6 rounded-full" style={{ background: COLORS[0] }} />
              {labels.brokerage}: {brokeragesPresent}
            </span>
            <span className="flex items-center gap-3 whitespace-nowrap" style={{ color: COLORS[1] }}>
              <span className="inline-block size-6 rounded-full" style={{ background: COLORS[1] }} />
              {labels.fund}: {fundsPresent}
            </span>
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground">{mounted ? '—' : ''}</span>
      )}
    </div>
  );
}
