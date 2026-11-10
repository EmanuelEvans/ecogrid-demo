import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const chartTooltip = { background: '#0f3326', border: '1px solid rgba(255,255,255,.16)', borderRadius: 12, color: '#f2f5ef' };

export function ImpactChart({ data }: { data: { name: string; value: number }[] }) {
  return <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <defs><linearGradient id="esg-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#12c27a" stopOpacity=".4" /><stop offset="1" stopColor="#12c27a" stopOpacity="0" /></linearGradient></defs>
      <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
      <XAxis dataKey="name" stroke="#7c9a8a" tickLine={false} axisLine={false} />
      <YAxis hide />
      <Tooltip contentStyle={chartTooltip} />
      <Area type="monotone" dataKey="value" stroke="#d4ff4f" strokeWidth={3} fill="url(#esg-fill)" />
    </AreaChart>
  </ResponsiveContainer>;
}

export function VoucherChart() {
  return <ResponsiveContainer width="100%" height="100%">
    <BarChart data={[{ name: '300 ден.', count: 72 }, { name: '500 ден.', count: 64 }, { name: '1.000 ден.', count: 36 }]}>
      <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
      <XAxis dataKey="name" stroke="#7c9a8a" tickLine={false} axisLine={false} />
      <YAxis hide />
      <Tooltip contentStyle={chartTooltip} />
      <Bar dataKey="count" fill="#12c27a" radius={[8, 8, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>;
}

export function MunicipalLocationChart({ data }: { data: { m: string; locations: number }[] }) {
  return <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
      <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
      <XAxis dataKey="m" stroke="#7c9a8a" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} interval={0} />
      <YAxis hide domain={[0, 'dataMax + 8']} />
      <Tooltip contentStyle={chartTooltip} cursor={{ fill: 'rgba(255,255,255,.06)' }} formatter={(value) => [`${value} локации`, 'Исчистени']} labelFormatter={(label) => `Месец: ${label}`} />
      <Bar dataKey="locations" name="Исчистени" fill="#12c27a" radius={[8, 8, 0, 0]} activeBar={{ fill: '#d4ff4f' }} />
    </BarChart>
  </ResponsiveContainer>;
}

export function MunicipalWasteChart({ data }: { data: { m: string; waste: number }[] }) {
  return <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
      <defs><linearGradient id="waste-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#12c27a" stopOpacity=".4" /><stop offset="1" stopColor="#12c27a" stopOpacity=".02" /></linearGradient></defs>
      <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
      <XAxis dataKey="m" stroke="#7c9a8a" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} interval={0} />
      <YAxis hide domain={[0, 'dataMax + 100']} />
      <Tooltip contentStyle={chartTooltip} formatter={(value) => [`${Number(value).toLocaleString('mk-MK')} кг`, 'Рециклиран отпад']} labelFormatter={(label) => `Месец: ${label}`} />
      <Area type="monotone" dataKey="waste" name="Рециклиран отпад" stroke="#d4ff4f" strokeWidth={2.5} fill="url(#waste-fill)" activeDot={{ r: 5, fill: '#d4ff4f', stroke: '#0f3326', strokeWidth: 2 }} />
    </AreaChart>
  </ResponsiveContainer>;
}
