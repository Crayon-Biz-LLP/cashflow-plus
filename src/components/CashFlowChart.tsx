import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { ChartDataPoint } from "@/libs/cashflowLogic";

interface Props {
    data: ChartDataPoint[];
}

const CashFlowChart: React.FC<Props> = ({ data }) => {
    // Determine min/max for domain scaling
    const balances = data.map(d => d.balance);
    const minBalance = Math.min(...balances, 0); // Ensure 0 is visible
    const maxBalance = Math.max(...balances, 0);

    // Calculate gradient offsets if we want green/red (Optional polish)
    const offset = maxBalance > 0 ? maxBalance / (maxBalance - minBalance) : 0;

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset={offset} stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset={offset} stopColor="#ef4444" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                            <stop offset={offset} stopColor="#10b981" stopOpacity={1} />
                            <stop offset={offset} stopColor="#ef4444" stopOpacity={1} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(str) => {
                            const d = new Date(str);
                            return `${d.getDate()}/${d.getMonth() + 1}`;
                        }}
                        style={{ fontSize: '12px', opacity: 0.7 }}
                    />
                    <YAxis hide domain={[minBalance * 1.1, maxBalance * 1.1]} />

                    <Tooltip
                        // 🚀 FIX IS HERE: Type as 'any' to prevent build error
                        formatter={(value: any) => [Number(value).toLocaleString(), "Balance"]}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #333',
                            backgroundColor: '#000',
                            color: '#fff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                        }}
                    />

                    <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />

                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="url(#colorLine)"
                        fill="url(#splitColor)"
                        strokeWidth={2}
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CashFlowChart;