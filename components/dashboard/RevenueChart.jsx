import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
export function RevenueChart({ data }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(value);
    };
    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload)
            return null;
        return (<div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry, index) => (<div key={index} className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }}/>
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {formatCurrency(entry.value)}
            </span>
          </div>))}
      </div>);
    };
    return (<div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.2}/>
              <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} dy={10}/>
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} dx={-10}/>
          <Tooltip content={<CustomTooltip />}/>
          <Area type="monotone" dataKey="target" name="Target" stroke="hsl(142 71% 45%)" strokeWidth={2} fill="url(#targetGradient)" strokeDasharray="4 4"/>
          <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(217 91% 60%)" strokeWidth={2} fill="url(#revenueGradient)"/>
        </AreaChart>
      </ResponsiveContainer>
    </div>);
}
