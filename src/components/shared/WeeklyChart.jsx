import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeeklyChart({ data = [], dataKey = 'value', colour = '#6b4f3a', height = 200, label = '' }) {
  return (
    <div>
      {label && <div className="text-xs text-muted" style={{ marginBottom: '8px' }}>{label}</div>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8a7a6a' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#8a7a6a' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: 'white',
              border: '1px solid #e2d8c8',
              borderRadius: '6px',
              fontSize: '0.85rem',
            }}
          />
          <Bar dataKey={dataKey} fill={colour} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
