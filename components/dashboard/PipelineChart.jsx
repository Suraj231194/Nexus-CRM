import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, } from "recharts";
const COLORS = [
    "hsl(280 67% 60%)",
    "hsl(199 89% 48%)",
    "hsl(38 92% 50%)",
    "hsl(217 91% 60%)",
    "hsl(142 71% 45%)",
];
export function PipelineChart({ data }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(value);
    };
    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length)
            return null;
        const item = payload[0].payload;
        return (<div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Value:</span>
            <span className="font-medium text-foreground">
              {formatCurrency(item.value)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Deals:</span>
            <span className="font-medium text-foreground">{item.count}</span>
          </div>
        </div>
      </div>);
    };
    return (<div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} dy={10}/>
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} dx={-10}/>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(215 28% 17% / 0.5)" }}/>
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>);
}
