// src/components/CashFlowChart.tsx
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { ChartDataPoint } from "@/libs/cashflowLogic";

interface Props {
    data: ChartDataPoint[];
}

export default function CashFlowChart({ data }: Props) {
    // Find minimum value to set scale
    const minBalance = Math.min(...data.map(d => d.balance));
    const hasCrunch = minBalance < 0;

    return (
        <div className="h-64 w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Projected Cash Balance</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDanger" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(str) => {
                            const d = new Date(str);
                            return `${d.getDate()}/${d.getMonth() + 1}`;
                        }}
                    />
                    <YAxis hide domain={[Math.min(0, minBalance), 'auto']} />
                    <Tooltip
                        formatter={(value: number) => [value.toLocaleString(), "Balance"]}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />

                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />

                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke={hasCrunch ? "#ef4444" : "#3b82f6"}
                        fillOpacity={1}
                        fill={hasCrunch ? "url(#colorDanger)" : "url(#colorBal)"}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}