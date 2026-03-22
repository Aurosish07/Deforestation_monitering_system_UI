import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { TreePine, Thermometer, Wind, Droplets, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const tempData = [
  { year: "1980", temp: 0.26 }, { year: "1985", temp: 0.12 }, { year: "1990", temp: 0.44 },
  { year: "1995", temp: 0.38 }, { year: "2000", temp: 0.42 }, { year: "2005", temp: 0.67 },
  { year: "2010", temp: 0.72 }, { year: "2015", temp: 0.87 }, { year: "2020", temp: 1.02 },
  { year: "2024", temp: 1.48 },
];

const deforestData = [
  { region: "Amazon", loss: 9.3 },
  { region: "Congo", loss: 5.8 },
  { region: "SE Asia", loss: 7.1 },
  { region: "Cerrado", loss: 4.2 },
  { region: "Siberia", loss: 2.6 },
];

const stats = [
  {
    icon: TreePine,
    label: "Forest Lost (2024)",
    value: "4.2M ha",
    sub: "+12% vs last year",
    trend: "up-bad",
    color: "text-danger",
    bgColor: "bg-danger/10",
  },
  {
    icon: Thermometer,
    label: "Avg Temp Anomaly",
    value: "+1.48°C",
    sub: "Above 1850–1900 baseline",
    trend: "up-bad",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
  {
    icon: Wind,
    label: "CO₂ Concentration",
    value: "421 ppm",
    sub: "Record high in 2024",
    trend: "up-bad",
    color: "text-ice",
    bgColor: "bg-ice/10",
  },
  {
    icon: Droplets,
    label: "Sea Level Rise",
    value: "3.7 mm/yr",
    sub: "Accelerating since 2015",
    trend: "up-bad",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
];

const TempTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border border-border bg-card/95 p-2 text-xs shadow-card">
        <p className="font-semibold text-muted-foreground">{label}</p>
        <p className="font-bold text-orange-400">+{payload[0].value.toFixed(2)}°C</p>
      </div>
    );
  }
  return null;
};

export function EnvironmentalStats() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border bg-card p-4 shadow-card"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-medium text-foreground mt-0.5">{stat.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Temperature anomaly chart */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-sm">Global Temperature Anomaly</h3>
              <p className="text-xs text-muted-foreground">°C above pre-industrial baseline</p>
            </div>
            <AlertTriangle className="h-4 w-4 text-orange-400" />
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tempData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(35 90% 52%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(35 90% 52%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 20%)" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: "hsl(210 10% 55%)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(210 10% 55%)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TempTooltip />} />
                <Area type="monotone" dataKey="temp" stroke="hsl(35 90% 52%)" strokeWidth={2} fill="url(#tempGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional deforestation bar chart */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="mb-3">
            <h3 className="font-display font-semibold text-sm">Deforestation by Region</h3>
            <p className="text-xs text-muted-foreground">Million hectares lost in 2024</p>
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deforestData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 20%)" vertical={false} />
                <XAxis dataKey="region" tick={{ fill: "hsl(210 10% 55%)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(210 10% 55%)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(210 18% 10%)", border: "1px solid hsl(210 15% 20%)", borderRadius: 8, fontSize: 11 }}
                  cursor={{ fill: "hsl(210 16% 15%)" }}
                />
                <Bar dataKey="loss" radius={[4, 4, 0, 0]}>
                  {deforestData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={index === 0 ? "hsl(8 82% 52%)" : index === 2 ? "hsl(35 90% 52%)" : "hsl(142 60% 38%)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
