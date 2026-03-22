import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const ndviData = [
  { month: "Jan 2020", ndvi: 0.82 },
  { month: "Apr 2020", ndvi: 0.79 },
  { month: "Jul 2020", ndvi: 0.81 },
  { month: "Oct 2020", ndvi: 0.77 },
  { month: "Jan 2021", ndvi: 0.74 },
  { month: "Apr 2021", ndvi: 0.70 },
  { month: "Jul 2021", ndvi: 0.68 },
  { month: "Oct 2021", ndvi: 0.62 },
  { month: "Jan 2022", ndvi: 0.58 },
  { month: "Apr 2022", ndvi: 0.51 },
  { month: "Jul 2022", ndvi: 0.48 },
  { month: "Oct 2022", ndvi: 0.43 },
  { month: "Jan 2023", ndvi: 0.41 },
  { month: "Apr 2023", ndvi: 0.38 },
  { month: "Jul 2023", ndvi: 0.35 },
  { month: "Oct 2023", ndvi: 0.32 },
  { month: "Jan 2024", ndvi: 0.30 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const color = val > 0.6 ? "#4ade80" : val > 0.4 ? "#fbbf24" : "#ef4444";
    return (
      <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm p-3 text-xs shadow-card">
        <p className="mb-1 font-semibold text-muted-foreground">{label}</p>
        <p className="font-bold" style={{ color }}>
          NDVI: {val.toFixed(2)}
        </p>
        <p className="text-muted-foreground">
          {val > 0.6 ? "🟢 Healthy" : val > 0.4 ? "🟡 Degraded" : "🔴 Critical"}
        </p>
      </div>
    );
  }
  return null;
};

export function NDVIChart() {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={ndviData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142 60% 38%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(8 82% 52%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 20%)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "hsl(210 10% 55%)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fill: "hsl(210 10% 55%)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0.6} stroke="hsl(35 90% 52%)" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Warning", fill: "hsl(35 90% 52%)", fontSize: 9 }} />
          <ReferenceLine y={0.4} stroke="hsl(8 82% 52%)" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Critical", fill: "hsl(8 82% 52%)", fontSize: 9 }} />
          <Area
            type="monotone"
            dataKey="ndvi"
            stroke="hsl(142 60% 38%)"
            strokeWidth={2.5}
            fill="url(#ndviGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "hsl(142 60% 38%)", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
