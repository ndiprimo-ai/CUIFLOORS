import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine,
  PieChart, Pie, Cell, Legend
} from "recharts";

// ─── DESIGN TOKENS (Upflow-faithful) ────────────────────────────────────────
// Navy sidebar: #0f1b35  Page bg: #f4f6fa  White cards: #ffffff
// Blue primary: #2563eb  Green: #16a34a  Red: #dc2626  Amber: #d97706
// Text primary: #111827  Text secondary: #6b7280  Border: #e5e7eb

// ─── DATA ───────────────────────────────────────────────────────────────────
const MONTHS = ["Oct","Nov","Dec","Jan","Feb","Mar"];

const CUSTOMERS = {
  riverside: {
    name:"Riverside Contractors", initials:"RC", email:"billing@riverside.com",
    terms:30, latefee:1.5, grace:5, limit:15000, outstanding:4200,
    remind:"standard", tier:"preferred", review:"2026-06-01",
    avgPay:22, totalInvoiced:41200, totalInvoices:14,
    risk:18, riskLabel:"Low", riskColor:"#16a34a",
    payTrend:[18,22,20,25,19,22],
    monthly:[5200,4800,6100,3900,5100,4200], collected:38200,
    lastContact:"Mar 10", lastAction:"Reminder sent",
    notes:"Reliable payer. Usually pays within terms.",
    history:[
      {inv:"INV-4821",date:"Feb 12",amt:4200,paid:null,days:null,st:"open",daysOpen:29},
      {inv:"INV-4790",date:"Jan 15",amt:3800,paid:"Feb 6",days:22,st:"paid",daysOpen:null},
      {inv:"INV-4762",date:"Dec 10",amt:5100,paid:"Jan 1",days:22,st:"paid",daysOpen:null},
    ],
    timeline:[
      {date:"Mar 10",type:"email",text:"Automated reminder sent for INV-4821"},
      {date:"Feb 6",type:"payment",text:"Payment received $3,800 for INV-4790"},
      {date:"Jan 15",type:"invoice",text:"Invoice INV-4790 issued for $3,800"},
    ]
  },
  elmwood: {
    name:"Elmwood Builders", initials:"EB", email:"ap@elmwoodbuilders.com",
    terms:30, latefee:1.5, grace:3, limit:10000, outstanding:7850,
    remind:"aggressive", tier:"watch", review:"2026-04-01",
    avgPay:28, totalInvoiced:89500, totalInvoices:22,
    risk:52, riskLabel:"Medium", riskColor:"#d97706",
    payTrend:[24,27,30,28,32,28],
    monthly:[8200,9100,11300,7800,9400,7850], collected:81650,
    lastContact:"Mar 8", lastAction:"2nd reminder sent",
    notes:"Tends to pay 5-7 days late. Follow up proactively.",
    history:[
      {inv:"INV-4798",date:"Feb 14",amt:7850,paid:null,days:null,st:"open",daysOpen:27},
      {inv:"INV-4768",date:"Jan 10",amt:6200,paid:"Feb 7",days:28,st:"paid",daysOpen:null},
    ],
    timeline:[
      {date:"Mar 8",type:"email",text:"2nd reminder sent for INV-4798"},
      {date:"Mar 1",type:"email",text:"1st reminder sent for INV-4798"},
      {date:"Feb 14",type:"invoice",text:"Invoice INV-4798 issued for $7,850"},
      {date:"Feb 7",type:"payment",text:"Payment received $6,200 for INV-4768"},
    ]
  },
  summit: {
    name:"Summit Flooring Co.", initials:"SF", email:"finance@summitfloor.com",
    terms:30, latefee:0, grace:7, limit:20000, outstanding:2100,
    remind:"gentle", tier:"vip", review:"2026-09-01",
    avgPay:19, totalInvoiced:23100, totalInvoices:9,
    risk:12, riskLabel:"Low", riskColor:"#16a34a",
    payTrend:[20,18,21,19,17,19],
    monthly:[2800,3100,4200,2900,3500,2100], collected:21000,
    lastContact:"Mar 5", lastAction:"Invoice sent",
    notes:"VIP account. Always pays early or on time.",
    history:[
      {inv:"INV-4803",date:"Feb 17",amt:2100,paid:null,days:null,st:"open",daysOpen:24},
      {inv:"INV-4775",date:"Jan 20",amt:3300,paid:"Feb 8",days:19,st:"paid",daysOpen:null},
    ],
    timeline:[
      {date:"Mar 5",type:"invoice",text:"Invoice INV-4803 issued for $2,100"},
      {date:"Feb 8",type:"payment",text:"Payment received $3,300 for INV-4775 — 11 days early"},
    ]
  },
  hargrove: {
    name:"Hargrove Properties", initials:"HP", email:"accounts@hargrove.com",
    terms:60, latefee:1, grace:5, limit:15000, outstanding:9400,
    remind:"standard", tier:"preferred", review:"2026-05-01",
    avgPay:31, totalInvoiced:112000, totalInvoices:31,
    risk:61, riskLabel:"Medium", riskColor:"#d97706",
    payTrend:[26,29,33,30,35,31],
    monthly:[9800,11200,14300,8900,12100,9400], collected:102600,
    lastContact:"Mar 12", lastAction:"Promise to pay logged",
    notes:"NET 60 customer. Currently has open promise to pay.",
    history:[
      {inv:"INV-4815",date:"Feb 19",amt:9400,paid:null,days:null,st:"open",daysOpen:22},
      {inv:"INV-4784",date:"Jan 14",amt:8700,paid:"Feb 14",days:31,st:"paid",daysOpen:null},
    ],
    timeline:[
      {date:"Mar 12",type:"promise",text:"Promise to pay logged — Mar 20 — Sarah"},
      {date:"Mar 5",type:"email",text:"Reminder sent for INV-4815"},
      {date:"Feb 19",type:"invoice",text:"Invoice INV-4815 issued for $9,400"},
      {date:"Feb 14",type:"payment",text:"Payment received $8,700 for INV-4784"},
    ]
  },
  beacon: {
    name:"Beacon Construction", initials:"BC", email:"ar@beaconcon.com",
    terms:30, latefee:2, grace:0, limit:8000, outstanding:6300,
    remind:"aggressive", tier:"hold", review:"2026-03-20",
    avgPay:38, totalInvoiced:67800, totalInvoices:18,
    risk:82, riskLabel:"High", riskColor:"#dc2626",
    payTrend:[29,33,38,41,37,38],
    monthly:[7200,8100,9800,6900,8100,6300], collected:61500,
    lastContact:"Mar 5", lastAction:"Final notice sent",
    notes:"30 days overdue. Account on hold. Escalate immediately.",
    history:[
      {inv:"INV-4744",date:"Jan 11",amt:6300,paid:null,days:null,st:"overdue",daysOpen:60},
      {inv:"INV-4715",date:"Dec 8",amt:5800,paid:"Jan 20",days:43,st:"late",daysOpen:null},
    ],
    timeline:[
      {date:"Mar 5",type:"call",text:"Final notice sent. No response. Recommend escalation."},
      {date:"Feb 20",type:"email",text:"3rd reminder sent — 30 days overdue"},
      {date:"Feb 13",type:"email",text:"2nd reminder sent — 23 days overdue"},
      {date:"Feb 6",type:"email",text:"1st reminder sent — 16 days overdue"},
      {date:"Jan 11",type:"invoice",text:"Invoice INV-4744 issued for $6,300"},
    ]
  },
  greenfield: {
    name:"Greenfield Homes", initials:"GH", email:"billing@greenfieldhomes.com",
    terms:45, latefee:1.5, grace:3, limit:4000, outstanding:3470,
    remind:"aggressive", tier:"watch", review:"2026-04-15",
    avgPay:33, totalInvoiced:31400, totalInvoices:11,
    risk:74, riskLabel:"High", riskColor:"#dc2626",
    payTrend:[27,30,34,33,36,33],
    monthly:[3200,3800,4400,2900,3600,3470], collected:27930,
    lastContact:"Mar 8", lastAction:"Promise logged",
    notes:"14 days overdue. Promise to pay Mar 15.",
    history:[
      {inv:"INV-4761",date:"Jan 27",amt:3470,paid:null,days:null,st:"overdue",daysOpen:44},
      {inv:"INV-4733",date:"Dec 22",amt:4100,paid:"Feb 5",days:45,st:"late",daysOpen:null},
    ],
    timeline:[
      {date:"Mar 8",type:"call",text:"Called — spoke with owner. Promise to pay by Mar 15."},
      {date:"Mar 1",type:"email",text:"2nd reminder sent — 14 days overdue"},
      {date:"Feb 22",type:"email",text:"1st reminder sent — 7 days overdue"},
      {date:"Jan 27",type:"invoice",text:"Invoice INV-4761 issued for $3,470"},
    ]
  },
  pinnacle: {
    name:"Pinnacle Remodeling", initials:"PR", email:"ap@pinnacleremodel.com",
    terms:30, latefee:1, grace:5, limit:12000, outstanding:1850,
    remind:"standard", tier:"standard", review:"2026-07-01",
    avgPay:26, totalInvoiced:18900, totalInvoices:7,
    risk:44, riskLabel:"Medium", riskColor:"#d97706",
    payTrend:[22,25,27,26,28,26],
    monthly:[2800,3100,2900,2600,3100,1850], collected:17050,
    lastContact:"Mar 10", lastAction:"Reminder sent",
    notes:"7 days overdue. First time late — likely oversight.",
    history:[
      {inv:"INV-4779",date:"Feb 4",amt:1850,paid:null,days:null,st:"overdue",daysOpen:37},
      {inv:"INV-4751",date:"Jan 2",amt:3200,paid:"Jan 28",days:26,st:"paid",daysOpen:null},
    ],
    timeline:[
      {date:"Mar 10",type:"email",text:"Reminder sent — 7 days overdue"},
      {date:"Mar 5",type:"invoice",text:"Due date passed — INV-4779"},
      {date:"Feb 4",type:"invoice",text:"Invoice INV-4779 issued for $1,850"},
    ]
  }
};

const INVOICES = [
  {id:"INV-4821",customer:"riverside",amt:4200,issued:"Feb 12",due:"Mar 13",st:"open",opened:true,daysOverdue:0},
  {id:"INV-4798",customer:"elmwood",amt:7850,issued:"Feb 14",due:"Mar 15",st:"open",opened:false,daysOverdue:0},
  {id:"INV-4803",customer:"summit",amt:2100,issued:"Feb 17",due:"Mar 17",st:"open",opened:true,daysOverdue:0},
  {id:"INV-4815",customer:"hargrove",amt:9400,issued:"Feb 19",due:"Mar 19",st:"open",opened:true,daysOverdue:0},
  {id:"INV-4744",customer:"beacon",amt:6300,issued:"Jan 11",due:"Feb 10",st:"overdue",opened:true,daysOverdue:30},
  {id:"INV-4761",customer:"greenfield",amt:3470,issued:"Jan 27",due:"Feb 26",st:"overdue",opened:true,daysOverdue:14},
  {id:"INV-4779",customer:"pinnacle",amt:1850,issued:"Feb 4",due:"Mar 5",st:"overdue",opened:true,daysOverdue:7},
];

// ─── COMPUTED DATA HOOK ──────────────────────────────────────────────────────
function useARData(customers) {
  return useMemo(() => {
    const keys = Object.keys(customers);
    const totalAR = keys.reduce((s,k) => s + customers[k].outstanding, 0);
    const totalCollected = keys.reduce((s,k) => s + customers[k].collected, 0);
    const totalSales = keys.reduce((s,k) => s + customers[k].totalInvoiced, 0);
    const overdueCust = keys.filter(k => customers[k].risk >= 70).length;
    const avgPay = Math.round(keys.reduce((s,k) => s + customers[k].avgPay, 0) / keys.length);
    const overdueAmt = keys.filter(k => customers[k].risk >= 70).reduce((s,k) => s + customers[k].outstanding, 0);

    // Monthly cash collection chart: billed vs payments
    const monthly = MONTHS.map((m,i) => {
      const billed = keys.reduce((s,k) => s + customers[k].monthly[i], 0);
      const payments = keys.reduce((s,k) => s + Math.round(customers[k].monthly[i]*(customers[k].collected/customers[k].totalInvoiced)), 0);
      return {month:m, Billed:billed, Payments:payments};
    });

    // Aging balance — stacked bar by month (simulated buckets)
    const aging = MONTHS.map((m,i) => {
      const total = keys.reduce((s,k) => s + customers[k].monthly[i], 0);
      const paid = keys.reduce((s,k) => s + Math.round(customers[k].monthly[i]*0.7), 0);
      return {
        month: m,
        Current: Math.round(total * 0.58),
        "1-30d": Math.round(total * 0.22),
        "31-60d": Math.round(total * 0.12),
        "60d+": Math.round(total * 0.08),
      };
    });

    // DSO
    const PERIOD = 180;
    const companyDSO = Math.round((totalAR / totalSales) * PERIOD);
    const weightedTerms = Math.round(keys.reduce((s,k) => s + customers[k].terms * customers[k].totalInvoiced, 0) / totalSales);
    const bpDSO = Math.round(keys.reduce((s,k) => s + (customers[k].outstanding/totalSales)*customers[k].terms, 0) * PERIOD / weightedTerms);

    // DSO trend line + area
    const dsoTrend = MONTHS.map((m,i) => {
      const inv = keys.reduce((s,k) => s + customers[k].monthly[i], 0);
      const col = keys.reduce((s,k) => s + Math.round(customers[k].monthly[i]*(customers[k].collected/customers[k].totalInvoiced)), 0);
      const ar = Math.max(inv-col, 0);
      return {month:m, DSO: Math.round((ar/Math.max(inv,1))*30), Target:weightedTerms, BestPossible:bpDSO};
    });

    const dsoHealth = companyDSO <= weightedTerms ? "green" : companyDSO <= weightedTerms*1.3 ? "amber" : "red";

    // CEI — Collection Effectiveness Index = (beg AR + invoiced - end AR) / (beg AR + invoiced) * 100
    const ceiTrend = MONTHS.map((m,i) => {
      const inv = keys.reduce((s,k) => s + customers[k].monthly[i], 0);
      const col = keys.reduce((s,k) => s + Math.round(customers[k].monthly[i]*(customers[k].collected/customers[k].totalInvoiced)), 0);
      return {month:m, CEI: Math.round((col/Math.max(inv,1))*100)};
    });

    // Actions queue — ranked by priority
    const queue = keys
      .filter(k => customers[k].risk >= 40 || customers[k].outstanding > 3000)
      .map(k => {
        const c = customers[k];
        const daysLate = c.risk >= 70 ? Math.round(c.risk/3) : 0;
        const score = Math.round((c.outstanding * Math.max(daysLate,1)) / (c.limit * 10));
        return {key:k, ...c, daysLate, score};
      })
      .sort((a,b) => b.score - a.score);

    return {totalAR, totalCollected, totalSales, overdueCust, avgPay, overdueAmt,
      monthly, aging, companyDSO, weightedTerms, bpDSO, dsoTrend, ceiTrend, dsoHealth, queue};
  }, [customers]);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = n => "$" + Number(n).toLocaleString();
const fmtK = v => "$" + Math.round(v/1000) + "k";

function NavIcon({ icon, label, active, badge, onClick }) {
  return (
    <button onClick={onClick} title={label} style={{
      width:40, height:40, borderRadius:10, border:"none", cursor:"pointer", position:"relative",
      background: active ? "rgba(37,99,235,0.18)" : "transparent",
      color: active ? "#60a5fa" : "rgba(255,255,255,0.5)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:18, transition:"all .15s", margin:"2px 0"
    }}>
      {icon}
      {badge > 0 && <span style={{
        position:"absolute", top:4, right:4, background:"#dc2626", color:"#fff",
        fontSize:9, fontWeight:700, minWidth:14, height:14, borderRadius:7,
        display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px"
      }}>{badge}</span>}
    </button>
  );
}

function Pill({ color, children }) {
  const colors = {
    green:  {bg:"#dcfce7", text:"#15803d"},
    red:    {bg:"#fee2e2", text:"#b91c1c"},
    amber:  {bg:"#fef3c7", text:"#b45309"},
    blue:   {bg:"#dbeafe", text:"#1d4ed8"},
    gray:   {bg:"#f3f4f6", text:"#374151"},
    purple: {bg:"#ede9fe", text:"#6d28d9"},
  };
  const c = colors[color] || colors.gray;
  return <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:11,fontWeight:500,padding:"2px 8px",borderRadius:20,background:c.bg,color:c.text,whiteSpace:"nowrap"}}>{children}</span>;
}

function StatCard({ label, value, sub, color, trend, small }) {
  return (
    <div style={{background:"#fff", borderRadius:12, padding:small?"14px":"18px", border:"1px solid #e5e7eb", flex:1}}>
      <div style={{fontSize:11, fontWeight:500, color:"#6b7280", textTransform:"uppercase", letterSpacing:".06em", marginBottom:8}}>{label}</div>
      <div style={{fontSize:small?22:28, fontWeight:700, color:color||"#111827", letterSpacing:"-0.5px", lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:11, color:"#9ca3af", marginTop:6}}>{sub}</div>}
      {trend !== undefined && <div style={{fontSize:11, color:trend<0?"#16a34a":"#dc2626", marginTop:4, fontWeight:500}}>{trend>0?`▲ +${trend}d`:`▼ ${Math.abs(trend)}d`} vs last month</div>}
    </div>
  );
}

function SectionHeader({ title, sub, action }) {
  return (
    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16}}>
      <div>
        <h2 style={{fontSize:16, fontWeight:600, color:"#111827", margin:0}}>{title}</h2>
        {sub && <div style={{fontSize:12, color:"#6b7280", marginTop:2}}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

function Btn({ children, primary, small, danger, onClick, style={} }) {
  return (
    <button onClick={onClick} style={{
      padding: small ? "4px 10px" : "7px 14px",
      fontSize: small ? 11 : 12,
      fontWeight: 500, borderRadius: 8, cursor:"pointer", fontFamily:"inherit",
      border: primary ? "none" : "1px solid #e5e7eb",
      background: danger ? "#fee2e2" : primary ? "#2563eb" : "#fff",
      color: danger ? "#b91c1c" : primary ? "#fff" : "#374151",
      transition:"all .12s", whiteSpace:"nowrap", ...style
    }}>{children}</button>
  );
}

const CustomTooltip = ({active, payload, label}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px 12px",fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,.08)"}}>
      <div style={{fontWeight:600,color:"#111827",marginBottom:4}}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{display:"flex",justifyContent:"space-between",gap:16,color:"#6b7280"}}>
          <span style={{color:p.color}}>{p.name}</span>
          <span style={{fontWeight:500,color:"#111827"}}>{typeof p.value === "number" && p.value > 100 ? fmt(p.value) : p.value+(p.name==="CEI"||p.name==="DSO"||p.name==="Target"||p.name==="BestPossible"?"d":"")}</span>
        </div>
      ))}
    </div>
  );
};

// ─── VIEWS ───────────────────────────────────────────────────────────────────

function OverviewView({ ar, customers, onCustomer, onAction }) {
  return (
    <div>
      {/* KPI strip */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:24}}>
        <StatCard label="Total AR Outstanding" value={fmt(ar.totalAR)} sub="Across all customers" color="#111827"/>
        <StatCard label="Overdue Amount" value={fmt(ar.overdueAmt)} sub={`${ar.overdueCust} customers at risk`} color="#dc2626"/>
        <StatCard label="DSO" value={`${ar.companyDSO}d`} sub={`Target: ${ar.weightedTerms}d`} color={ar.dsoHealth==="green"?"#16a34a":ar.dsoHealth==="amber"?"#d97706":"#dc2626"} trend={ar.companyDSO - ar.weightedTerms}/>
        <StatCard label="Collected (6mo)" value={fmt(ar.totalCollected)} sub="Total cash received" color="#16a34a"/>
        <StatCard label="Avg Days to Pay" value={`${ar.avgPay}d`} sub={`vs weighted NET ${ar.weightedTerms}d`} color="#2563eb"/>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24}}>
        {/* DSO Chart */}
        <div style={{background:"#fff", borderRadius:12, padding:20, border:"1px solid #e5e7eb"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4}}>
            <div>
              <div style={{fontSize:13, fontWeight:600, color:"#111827"}}>DSO</div>
              <div style={{fontSize:11, color:"#6b7280", marginTop:1}}>Days Sales Outstanding trend</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:28, fontWeight:700, color:ar.dsoHealth==="green"?"#16a34a":ar.dsoHealth==="amber"?"#d97706":"#dc2626", letterSpacing:"-1px"}}>{ar.companyDSO} days</div>
              <div style={{fontSize:11, color:"#16a34a", fontWeight:500}}>↓ {Math.max(0, ar.companyDSO - ar.bpDSO)} days from best possible</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={ar.dsoTrend} margin={{top:8,right:4,left:0,bottom:0}}>
              <defs>
                <linearGradient id="dsoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.15}/>
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={v=>v+"d"} width={26}/>
              <Tooltip content={<CustomTooltip/>}/>
              <ReferenceLine y={ar.weightedTerms} stroke="#dc2626" strokeDasharray="4 3" strokeWidth={1.5} label={{value:`Target ${ar.weightedTerms}d`,position:"insideTopRight",fontSize:9,fill:"#dc2626"}}/>
              <Area type="monotone" dataKey="DSO" stroke="#2563eb" strokeWidth={2.5} fill="url(#dsoGrad)" dot={{r:3,fill:"#2563eb"}}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{display:"flex", gap:16, fontSize:11, color:"#6b7280", marginTop:4}}>
            <span><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"#2563eb",marginRight:4}}/>DSO</span>
            <span><span style={{display:"inline-block",width:16,height:2,background:"#dc2626",marginRight:4,verticalAlign:"middle",borderTop:"2px dashed #dc2626"}}/>Target</span>
          </div>
        </div>

        {/* Aging Balance */}
        <div style={{background:"#fff", borderRadius:12, padding:20, border:"1px solid #e5e7eb"}}>
          <div style={{fontSize:13, fontWeight:600, color:"#111827", marginBottom:2}}>Aging Balance</div>
          <div style={{fontSize:11, color:"#6b7280", marginBottom:12}}>Outstanding AR by aging bucket per month</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ar.aging} margin={{top:4,right:4,left:0,bottom:0}} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={fmtK} width={32}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="Current" stackId="a" fill="#2563eb" radius={[0,0,0,0]}/>
              <Bar dataKey="1-30d" stackId="a" fill="#f59e0b"/>
              <Bar dataKey="31-60d" stackId="a" fill="#f97316"/>
              <Bar dataKey="60d+" stackId="a" fill="#dc2626" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex", gap:12, fontSize:11, color:"#6b7280", marginTop:4, flexWrap:"wrap"}}>
            {[["Current","#2563eb"],["1-30d","#f59e0b"],["31-60d","#f97316"],["60d+","#dc2626"]].map(([l,c])=>
              <span key={l}><span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:c,marginRight:3}}/>{l}</span>)}
          </div>
        </div>
      </div>

      {/* Actions to do */}
      <div style={{background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:20}}>
        <SectionHeader
          title={`Actions to do today`}
          sub={`${ar.queue.length} accounts require attention`}
          action={<Btn primary onClick={()=>onAction("queue")}>View all →</Btn>}
        />
        <div style={{display:"flex", flexDirection:"column", gap:1}}>
          {ar.queue.slice(0,5).map((c,i) => {
            const overdue = c.risk >= 70;
            return (
              <div key={c.key} onClick={()=>onCustomer(c.key)} style={{
                display:"flex", alignItems:"center", gap:12, padding:"10px 12px",
                borderRadius:8, cursor:"pointer", background:"#fff",
                transition:"background .1s",
              }}
              onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                <div style={{width:24,height:24,borderRadius:"50%",background:overdue?"#fee2e2":"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:overdue?"#dc2626":"#1d4ed8",flexShrink:0}}>{i+1}</div>
                <div style={{width:32,height:32,borderRadius:8,background:overdue?"#fee2e2":"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:overdue?"#dc2626":"#374151",flexShrink:0}}>{c.initials}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,color:"#111827"}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#6b7280"}}>{c.lastAction} · {c.lastContact}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:overdue?"#dc2626":"#111827"}}>{fmt(c.outstanding)}</div>
                  <div style={{fontSize:11,marginTop:1}}>
                    {overdue ? <Pill color="red">{c.daysLate}d overdue</Pill> : <Pill color="amber">Due soon</Pill>}
                  </div>
                </div>
                <div style={{color:"#d1d5db",fontSize:16}}>›</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CustomersView({ customers, ar, onCustomer }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const keys = Object.keys(customers);
  const filtered = keys.filter(k => {
    const c = customers[k];
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="all" || (filter==="overdue"&&c.risk>=70) || (filter==="watch"&&c.tier==="watch") || (filter==="vip"&&c.tier==="vip");
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <SectionHeader title="Customers" sub={`${keys.length} accounts · ${fmt(keys.reduce((s,k)=>s+customers[k].outstanding,0))} outstanding`}/>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#9ca3af",fontSize:14}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search customers…"
            style={{width:"100%",padding:"7px 10px 7px 32px",fontSize:12,border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",fontFamily:"inherit",color:"#111827"}}/>
        </div>
        {["all","overdue","watch","vip"].map(f => (
          <Btn key={f} onClick={()=>setFilter(f)} primary={filter===f} small style={filter===f?{}:{border:"1px solid #e5e7eb"}}>
            {f==="all"?"All":f==="overdue"?"At Risk":f==="watch"?"Watch":"VIP"}
          </Btn>
        ))}
      </div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#f9fafb",borderBottom:"1px solid #e5e7eb"}}>
              {["Customer","Outstanding","Terms","Tier","Avg Pay","Risk","Last Action",""].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:11,fontWeight:500,color:"#6b7280",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((k,i) => {
              const c = customers[k];
              const pct = Math.round((c.outstanding/c.limit)*100);
              return (
                <tr key={k} onClick={()=>onCustomer(k)} style={{borderBottom:"1px solid #f3f4f6",cursor:"pointer",transition:"background .1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                  onMouseLeave={e=>e.currentTarget.style.background=""}>
                  <td style={{padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:32,height:32,borderRadius:8,background:c.risk>=70?"#fee2e2":c.risk>=50?"#fef3c7":"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:c.risk>=70?"#dc2626":c.risk>=50?"#b45309":"#1d4ed8",flexShrink:0}}>{c.initials}</div>
                      <div>
                        <div style={{fontWeight:500,color:"#111827"}}>{c.name}</div>
                        <div style={{fontSize:11,color:"#9ca3af"}}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:"12px 14px"}}>
                    <div style={{fontWeight:600,color:c.risk>=70?"#dc2626":"#111827"}}>{fmt(c.outstanding)}</div>
                    <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>
                      <div style={{width:60,height:3,background:"#f3f4f6",borderRadius:2,overflow:"hidden",display:"inline-block",verticalAlign:"middle",marginRight:4}}>
                        <div style={{height:"100%",width:Math.min(pct,100)+"%",background:pct>=85?"#dc2626":pct>=65?"#f59e0b":"#2563eb",borderRadius:2}}/>
                      </div>
                      {pct}% of limit
                    </div>
                  </td>
                  <td style={{padding:"12px 14px"}}><Pill color={c.terms<=30?"blue":c.terms<=45?"amber":"gray"}>NET {c.terms}</Pill></td>
                  <td style={{padding:"12px 14px"}}><Pill color={c.tier==="vip"?"purple":c.tier==="preferred"?"blue":c.tier==="watch"?"amber":c.tier==="hold"?"red":"gray"}>{c.tier.charAt(0).toUpperCase()+c.tier.slice(1)}</Pill></td>
                  <td style={{padding:"12px 14px",color:c.avgPay>c.terms?"#dc2626":c.avgPay<c.terms?"#16a34a":"#111827",fontWeight:500}}>{c.avgPay}d</td>
                  <td style={{padding:"12px 14px"}}><Pill color={c.riskLabel==="Low"?"green":c.riskLabel==="High"?"red":"amber"}>{c.riskLabel}</Pill></td>
                  <td style={{padding:"12px 14px",color:"#6b7280",fontSize:12}}>{c.lastAction}</td>
                  <td style={{padding:"12px 14px",color:"#d1d5db",fontSize:16}}>›</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoicesView({ customers }) {
  const [filter, setFilter] = useState("all");
  const filtered = INVOICES.filter(inv => filter==="all" || inv.st===filter);
  return (
    <div>
      <SectionHeader title="Invoices" sub={`${INVOICES.length} total · ${INVOICES.filter(i=>i.st==="overdue").length} overdue`}/>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {["all","open","overdue"].map(f=>(
          <Btn key={f} onClick={()=>setFilter(f)} primary={filter===f} small>{f==="all"?"All":f==="open"?"Open":"Overdue"}</Btn>
        ))}
      </div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#f9fafb",borderBottom:"1px solid #e5e7eb"}}>
              {["Invoice","Customer","Amount","Issued","Due","Status","Email","Actions"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:11,fontWeight:500,color:"#6b7280",textTransform:"uppercase",letterSpacing:".05em"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => {
              const c = customers[inv.customer];
              return (
                <tr key={inv.id} style={{borderBottom:"1px solid #f3f4f6",transition:"background .1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                  onMouseLeave={e=>e.currentTarget.style.background=""}>
                  <td style={{padding:"12px 14px",fontWeight:500,color:"#111827"}}>{inv.id}</td>
                  <td style={{padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:26,height:26,borderRadius:6,background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,color:"#374151"}}>{c.initials}</div>
                      <span style={{color:"#374151"}}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{padding:"12px 14px",fontWeight:600,color:inv.st==="overdue"?"#dc2626":"#111827"}}>{fmt(inv.amt)}</td>
                  <td style={{padding:"12px 14px",color:"#6b7280"}}>{inv.issued}</td>
                  <td style={{padding:"12px 14px",color:inv.daysOverdue>0?"#dc2626":"#374151",fontWeight:inv.daysOverdue>0?500:400}}>{inv.due}{inv.daysOverdue>0 && <span style={{fontSize:10,marginLeft:4,color:"#dc2626"}}>+{inv.daysOverdue}d</span>}</td>
                  <td style={{padding:"12px 14px"}}>
                    {inv.st==="overdue" ? <Pill color="red">Overdue {inv.daysOverdue}d</Pill> : <Pill color="blue">Open</Pill>}
                  </td>
                  <td style={{padding:"12px 14px"}}>
                    {inv.opened ? <Pill color="green">Opened</Pill> : <Pill color="amber">Not opened</Pill>}
                  </td>
                  <td style={{padding:"12px 14px"}}>
                    <div style={{display:"flex",gap:6}}>
                      <Btn small>Send reminder</Btn>
                      {inv.st==="overdue" && <Btn small danger>Escalate</Btn>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsView({ ar }) {
  return (
    <div>
      <SectionHeader title="Analytics" sub="Accounts Receivable · All customers · Last 6 months"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>

        {/* DSO area chart */}
        <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #e5e7eb"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"#111827"}}>DSO</div>
              <div style={{fontSize:11,color:"#6b7280"}}>Days Sales Outstanding · Best Possible DSO</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:22,fontWeight:700,color:ar.dsoHealth==="green"?"#16a34a":ar.dsoHealth==="amber"?"#d97706":"#dc2626"}}>{ar.companyDSO}d</div>
              <div style={{fontSize:10,color:"#9ca3af"}}>-{ar.companyDSO - ar.bpDSO}d vs best possible</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={ar.dsoTrend} margin={{top:4,right:4,left:0,bottom:0}}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2}/>
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={v=>v+"d"} width={26}/>
              <Tooltip content={<CustomTooltip/>}/>
              <ReferenceLine y={ar.weightedTerms} stroke="#dc2626" strokeDasharray="5 3" strokeWidth={1.5}/>
              <Area type="monotone" dataKey="DSO" stroke="#2563eb" strokeWidth={2.5} fill="url(#ag1)" dot={{r:3,fill:"#2563eb"}}/>
              <Line type="monotone" dataKey="BestPossible" stroke="#16a34a" strokeWidth={1.5} strokeDasharray="4 2" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* CEI */}
        <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #e5e7eb"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"#111827"}}>Collection Effectiveness Index</div>
              <div style={{fontSize:11,color:"#6b7280"}}>% of invoiced amount collected per month</div>
            </div>
            <div style={{fontSize:22,fontWeight:700,color:"#16a34a"}}>{ar.ceiTrend[ar.ceiTrend.length-1].CEI}%</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={ar.ceiTrend} margin={{top:4,right:4,left:0,bottom:0}}>
              <defs>
                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity={0.15}/>
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={v=>v+"%"} width={30} domain={[0,100]}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="CEI" stroke="#16a34a" strokeWidth={2.5} fill="url(#ag2)" dot={{r:3,fill:"#16a34a"}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cash Collection */}
        <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #e5e7eb"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"#111827"}}>Cash Collection</div>
              <div style={{fontSize:11,color:"#6b7280"}}>Billed vs Payments per month</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ar.monthly} margin={{top:4,right:4,left:0,bottom:0}} barGap={3} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={fmtK} tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false} width={36}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="Billed" fill="#93c5fd" radius={[3,3,0,0]}/>
              <Bar dataKey="Payments" fill="#2563eb" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:16,fontSize:11,color:"#6b7280",marginTop:4}}>
            <span><span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:"#93c5fd",marginRight:3}}/>Billed</span>
            <span><span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:"#2563eb",marginRight:3}}/>Payments</span>
          </div>
        </div>

        {/* Aging Balance stacked */}
        <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #e5e7eb"}}>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:600,color:"#111827"}}>Aging Balance</div>
            <div style={{fontSize:11,color:"#6b7280"}}>AR breakdown by overdue bucket</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ar.aging} margin={{top:4,right:4,left:0,bottom:0}} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={fmtK} tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false} width={36}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="Current" stackId="a" fill="#2563eb"/>
              <Bar dataKey="1-30d" stackId="a" fill="#f59e0b"/>
              <Bar dataKey="31-60d" stackId="a" fill="#f97316"/>
              <Bar dataKey="60d+" stackId="a" fill="#dc2626" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:12,fontSize:11,color:"#6b7280",marginTop:4,flexWrap:"wrap"}}>
            {[["Current","#2563eb"],["1-30d","#f59e0b"],["31-60d","#f97316"],["60d+","#dc2626"]].map(([l,c])=>
              <span key={l}><span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:c,marginRight:3}}/>{l}</span>)}
          </div>
        </div>
      </div>

      {/* DSO Breakdown table */}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:20}}>
        <div style={{fontSize:13,fontWeight:600,color:"#111827",marginBottom:14}}>DSO by Customer</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{background:"#f9fafb",borderBottom:"1px solid #e5e7eb"}}>
              {["Customer","DSO","NET Terms","Over/Under Terms","Avg Actual","Outstanding","Risk"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:11,fontWeight:500,color:"#6b7280",textTransform:"uppercase",letterSpacing:".05em"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(CUSTOMERS).map(k => {
              const c = CUSTOMERS[k];
              const dso = Math.round((c.outstanding/c.totalInvoiced)*180);
              const delta = dso - c.terms;
              return (
                <tr key={k} style={{borderBottom:"1px solid #f3f4f6"}}>
                  <td style={{padding:"10px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:26,height:26,borderRadius:6,background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600}}>{c.initials}</div>
                      <span style={{fontWeight:500,color:"#111827"}}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{padding:"10px 12px",fontWeight:700,color:delta>10?"#dc2626":delta>0?"#d97706":"#16a34a"}}>{dso}d</td>
                  <td style={{padding:"10px 12px"}}><Pill color={c.terms<=30?"blue":"amber"}>NET {c.terms}</Pill></td>
                  <td style={{padding:"10px 12px",fontWeight:500,color:delta>0?"#dc2626":"#16a34a"}}>{delta>0?`+${delta}d over`:delta===0?"On terms":`${Math.abs(delta)}d early`}</td>
                  <td style={{padding:"10px 12px",color:"#374151"}}>{c.avgPay}d</td>
                  <td style={{padding:"10px 12px",fontWeight:500,color:"#111827"}}>{fmt(c.outstanding)}</td>
                  <td style={{padding:"10px 12px"}}><Pill color={c.riskLabel==="Low"?"green":c.riskLabel==="High"?"red":"amber"}>{c.riskLabel}</Pill></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionsView({ ar, customers, onCustomer, showToast }) {
  return (
    <div>
      <SectionHeader title={`${ar.queue.length} actions to do`} sub="Prioritized by outstanding amount × days overdue"/>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#f9fafb",borderBottom:"1px solid #e5e7eb"}}>
              {["#","Customer","Outstanding","Terms","Days Late","Priority","Last Action","Actions"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:11,fontWeight:500,color:"#6b7280",textTransform:"uppercase",letterSpacing:".05em"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ar.queue.map((c,i) => {
              const overdue = c.risk >= 70;
              return (
                <tr key={c.key} style={{borderBottom:"1px solid #f3f4f6",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                  onMouseLeave={e=>e.currentTarget.style.background=""}>
                  <td style={{padding:"12px 14px"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:overdue?"#fee2e2":"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:overdue?"#dc2626":"#1d4ed8"}}>{i+1}</div>
                  </td>
                  <td style={{padding:"12px 14px"}} onClick={()=>onCustomer(c.key)}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:32,height:32,borderRadius:8,background:overdue?"#fee2e2":"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:overdue?"#dc2626":"#374151"}}>{c.initials}</div>
                      <div>
                        <div style={{fontWeight:500,color:"#2563eb",textDecoration:"underline",textDecorationColor:"rgba(37,99,235,.3)"}}>{c.name}</div>
                        <div style={{fontSize:11,color:"#9ca3af"}}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:"12px 14px",fontWeight:600,color:overdue?"#dc2626":"#111827"}}>{fmt(c.outstanding)}</td>
                  <td style={{padding:"12px 14px"}}><Pill color={c.terms<=30?"blue":"amber"}>NET {c.terms}</Pill></td>
                  <td style={{padding:"12px 14px",color:overdue?"#dc2626":"#d97706",fontWeight:500}}>{c.daysLate > 0 ? `${c.daysLate}d overdue` : "Due soon"}</td>
                  <td style={{padding:"12px 14px"}}>
                    {i===0 ? <Pill color="red">Critical</Pill> : i<=2 ? <Pill color="amber">High</Pill> : <Pill color="blue">Medium</Pill>}
                  </td>
                  <td style={{padding:"12px 14px",color:"#6b7280",fontSize:12}}>{c.lastAction} · {c.lastContact}</td>
                  <td style={{padding:"12px 14px"}}>
                    <div style={{display:"flex",gap:6}}>
                      <Btn small primary onClick={()=>showToast(`Reminder sent to ${c.name}`)}>Send reminder</Btn>
                      <Btn small onClick={()=>onCustomer(c.key)}>View</Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerProfile({ k, customers, setCustomers, onBack, showToast }) {
  const c = customers[k];
  const [tab, setTab] = useState("timeline");
  const pct = Math.round((c.outstanding/c.limit)*100);
  const dso = Math.round((c.outstanding/c.totalInvoiced)*180);

  const trendData = MONTHS.map((m,i) => ({month:m, "Days to Pay":c.payTrend[i], Terms:c.terms}));

  const timelineIcons = {email:"✉", payment:"💰", invoice:"📄", call:"📞", promise:"🤝", invoice:"📄"};

  return (
    <div>
      {/* Back */}
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:13,marginBottom:16,display:"flex",alignItems:"center",gap:4,padding:0,fontFamily:"inherit"}}>
        ← Back to customers
      </button>

      {/* Header */}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:20,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:52,height:52,borderRadius:12,background:c.risk>=70?"#fee2e2":c.risk>=50?"#fef3c7":"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:c.risk>=70?"#dc2626":c.risk>=50?"#b45309":"#1d4ed8"}}>{c.initials}</div>
            <div>
              <h1 style={{fontSize:20,fontWeight:700,color:"#111827",margin:0}}>{c.name}</h1>
              <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{c.email} · <Pill color={c.tier==="vip"?"purple":c.tier==="preferred"?"blue":c.tier==="watch"?"amber":c.tier==="hold"?"red":"gray"}>{c.tier.charAt(0).toUpperCase()+c.tier.slice(1)}</Pill></div>
              {c.notes && <div style={{fontSize:12,color:"#374151",marginTop:6,fontStyle:"italic"}}>"{c.notes}"</div>}
            </div>
          </div>
          <div style={{display:"flex",gap:8",flexWrap:"wrap"}}>
            <Btn onClick={()=>showToast(`Reminder sent to ${c.name}`)}>Send reminder</Btn>
            <Btn onClick={()=>showToast(`Statement emailed to ${c.email}`)}>Email statement</Btn>
            <Btn primary onClick={()=>showToast(`Pay Now link sent to ${c.email}`)}>Send Pay Now link</Btn>
          </div>
        </div>

        {/* Mini KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginTop:16}}>
          {[
            {l:"Outstanding",v:fmt(c.outstanding),c:c.outstanding>5000?"#dc2626":"#111827"},
            {l:"Avg Pay Time",v:`${c.avgPay}d`,c:c.avgPay>c.terms?"#dc2626":c.avgPay<c.terms?"#16a34a":"#111827"},
            {l:"DSO",v:`${dso}d`,c:dso>c.terms?"#dc2626":"#16a34a"},
            {l:"Credit Used",v:`${pct}%`,c:pct>=85?"#dc2626":"#16a34a"},
            {l:"Total Invoiced",v:fmt(c.totalInvoiced),c:"#111827"},
          ].map(m=>(
            <div key={m.l} style={{background:"#f9fafb",borderRadius:8,padding:12}}>
              <div style={{fontSize:10,color:"#6b7280",textTransform:"uppercase",letterSpacing:".05em",marginBottom:4,fontWeight:500}}>{m.l}</div>
              <div style={{fontSize:16,fontWeight:700,color:m.c}}>{m.v}</div>
            </div>
          ))}
        </div>

        {/* Credit bar */}
        <div style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6b7280",marginBottom:4}}>
            <span>Credit utilization · {fmt(c.outstanding)} of {fmt(c.limit)}</span>
            <span style={{color:pct>=85?"#dc2626":"#16a34a",fontWeight:500}}>{pct}%</span>
          </div>
          <div style={{height:6,background:"#f3f4f6",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:Math.min(pct,100)+"%",background:pct>=85?"#dc2626":pct>=65?"#f59e0b":"#2563eb",borderRadius:3,transition:"width .3s"}}/>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid #e5e7eb",marginBottom:16}}>
        {[["timeline","Timeline"],["invoices","Invoices"],["trend","Payment Trend"],["terms","Terms & Credit"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            padding:"8px 16px",fontSize:13,fontWeight:tab===id?600:400,
            color:tab===id?"#111827":"#6b7280",background:"none",border:"none",cursor:"pointer",
            borderBottom:tab===id?"2px solid #2563eb":"2px solid transparent",
            marginBottom:-1,fontFamily:"inherit",transition:"color .1s"
          }}>{lbl}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab==="timeline" && (
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:20}}>
          <div style={{fontSize:13,fontWeight:600,color:"#111827",marginBottom:16}}>Account Timeline</div>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {c.timeline.map((item,i)=>(
              <div key={i} style={{display:"flex",gap:14,paddingBottom:i<c.timeline.length-1?16:0,position:"relative"}}>
                {i<c.timeline.length-1 && <div style={{position:"absolute",left:15,top:32,bottom:0,width:1,background:"#e5e7eb"}}/>}
                <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,background:item.type==="payment"?"#dcfce7":item.type==="email"?"#dbeafe":item.type==="call"?"#fef3c7":item.type==="promise"?"#ede9fe":"#f3f4f6",zIndex:1}}>{timelineIcons[item.type]||"•"}</div>
                <div style={{flex:1,paddingTop:4}}>
                  <div style={{fontSize:13,color:"#111827"}}>{item.text}</div>
                  <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{item.date}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid #f3f4f6"}}>
            <textarea placeholder="Add a note…" style={{width:"100%",padding:"8px 10px",fontSize:12,border:"1px solid #e5e7eb",borderRadius:8,fontFamily:"inherit",resize:"vertical",minHeight:60,color:"#111827",background:"#fff"}}/>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
              <Btn primary small onClick={()=>showToast("Note saved!")}>Save note</Btn>
            </div>
          </div>
        </div>
      )}

      {tab==="invoices" && (
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"#f9fafb",borderBottom:"1px solid #e5e7eb"}}>
              {["Invoice","Date","Amount","Paid","Days","Status"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:11,fontWeight:500,color:"#6b7280",textTransform:"uppercase",letterSpacing:".05em"}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {c.history.map(h=>(
                <tr key={h.inv} style={{borderBottom:"1px solid #f3f4f6"}}>
                  <td style={{padding:"12px 14px",fontWeight:500,color:"#111827"}}>{h.inv}</td>
                  <td style={{padding:"12px 14px",color:"#6b7280"}}>{h.date}</td>
                  <td style={{padding:"12px 14px",fontWeight:600,color:h.st==="overdue"?"#dc2626":"#111827"}}>{fmt(h.amt)}</td>
                  <td style={{padding:"12px 14px",color:"#6b7280"}}>{h.paid||"—"}</td>
                  <td style={{padding:"12px 14px",color:"#374151"}}>{typeof h.days==="number"?`${h.days}d`:h.days||"—"}</td>
                  <td style={{padding:"12px 14px"}}><Pill color={h.st==="paid"?"green":h.st==="overdue"?"red":h.st==="late"?"amber":"blue"}>{h.st.charAt(0).toUpperCase()+h.st.slice(1)}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==="trend" && (
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:20}}>
          <div style={{fontSize:13,fontWeight:600,color:"#111827",marginBottom:4}}>Payment Speed — Last 6 Months</div>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:16}}>Blue line = actual days to pay · Red dashed = NET {c.terms} terms</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{top:4,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={v=>v+"d"} width={28}/>
              <Tooltip content={<CustomTooltip/>}/>
              <ReferenceLine y={c.terms} stroke="#dc2626" strokeDasharray="5 3" strokeWidth={1.5} label={{value:`NET ${c.terms}`,position:"insideTopRight",fontSize:9,fill:"#dc2626"}}/>
              <Line type="monotone" dataKey="Days to Pay" stroke="#2563eb" strokeWidth={2.5} dot={{r:4,fill:"#2563eb"}} activeDot={{r:5}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab==="terms" && (
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,color:"#111827"}}>Terms & Credit Settings</div>
            <Btn primary small onClick={()=>showToast("Terms saved!")}>Save changes</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[
              {label:"Pay Terms",value:`NET ${c.terms} days`},
              {label:"Account Tier",value:c.tier.charAt(0).toUpperCase()+c.tier.slice(1)},
              {label:"Credit Limit",value:fmt(c.limit)},
              {label:"Late Fee",value:c.latefee>0?`${c.latefee}% / month`:"None"},
              {label:"Grace Period",value:c.grace>0?`${c.grace} days`:"None"},
              {label:"Reminder Schedule",value:c.remind.charAt(0).toUpperCase()+c.remind.slice(1)},
              {label:"Review Date",value:c.review},
              {label:"Hold Trigger",value:"At 90% credit"},
            ].map(f=>(
              <div key={f.label}>
                <label style={{display:"block",fontSize:11,fontWeight:500,color:"#6b7280",textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>{f.label}</label>
                <div style={{padding:"8px 12px",background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:8,fontSize:13,color:"#111827"}}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsView() {
  return (
    <div>
      <SectionHeader title="Settings" sub="Integrations, automation rules, and account configuration"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {[
          {title:"RFMS Connection",icon:"🔌",items:[{l:"API Key",v:"Not configured",danger:true},{l:"Store Code",v:"Not set",danger:true},{l:"API Docs",v:"api2docs.rfms.online"}],btn:"Connect RFMS"},
          {title:"Gmail Integration",icon:"✉",items:[{l:"Sender address",v:"ar@cuifloors.com"},{l:"Status",v:"Connect via claude.ai",warn:true}],btn:"Connect Gmail"},
          {title:"Automation Rules",icon:"⚙",items:[{l:"Invoice open timeout",v:"48h → auto resend"},{l:"Overdue notices",v:"+1, +7, +14 days"},{l:"Missed promise",v:"+1d → escalate"},{l:"Daily digest",v:"7:00 AM"}]},
          {title:"Pay Now Button",icon:"💳",items:[{l:"Processor",v:"Stripe / Square"},{l:"In emails",v:"Active"},{l:"Payment URL",v:"Not configured",warn:true}],btn:"Configure"},
        ].map(card=>(
          <div key={card.title} style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:20}}>
            <div style={{fontSize:16,marginBottom:4}}>{card.icon}</div>
            <div style={{fontSize:14,fontWeight:600,color:"#111827",marginBottom:14}}>{card.title}</div>
            {card.items.map(item=>(
              <div key={item.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,fontSize:13,gap:8}}>
                <span style={{color:"#6b7280"}}>{item.l}</span>
                <span style={{fontWeight:500,color:item.danger?"#dc2626":item.warn?"#d97706":"#111827"}}>{item.v}</span>
              </div>
            ))}
            {card.btn && <Btn primary style={{width:"100%",marginTop:6,textAlign:"center"}}>{card.btn}</Btn>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ROOT APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [view, setView] = useState("overview");
  const [profileKey, setProfileKey] = useState(null);
  const [toast, setToast] = useState("");
  const ar = useARData(customers);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const openCustomer = key => {
    setProfileKey(key);
    setView("customer");
  };

  const NAV = [
    {id:"overview",  icon:"⊞",  label:"Overview"},
    {id:"customers", icon:"👤", label:"Customers"},
    {id:"invoices",  icon:"📄", label:"Invoices"},
    {id:"actions",   icon:"⚡", label:"Actions", badge: ar.queue.length},
    {id:"analytics", icon:"📊", label:"Analytics"},
    {id:"settings",  icon:"⚙",  label:"Settings"},
  ];

  const activeNav = view === "customer" ? "customers" : view;

  return (
    <div style={{display:"flex", height:"100vh", background:"#f4f6fa", fontFamily:"'DM Sans',system-ui,sans-serif", overflow:"hidden"}}>

      {/* LEFT SIDEBAR */}
      <div style={{width:56, background:"#0f1b35", display:"flex", flexDirection:"column", alignItems:"center", padding:"12px 0", flexShrink:0, zIndex:10}}>
        {/* Logo */}
        <div style={{marginBottom:16, padding:"4px 0"}}>
          <img src="https://carpetsunlimitedinc.com/wp-content/uploads/2023/10/Mascot-Full-color.svg"
            style={{width:32,height:32,objectFit:"contain"}}
            onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}
          />
          <div style={{display:"none",width:32,height:32,borderRadius:8,background:"#ef4344",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:13}}>C</div>
        </div>

        <div style={{width:"100%",height:1,background:"rgba(255,255,255,.08)",margin:"4px 0 8px"}}/>

        {/* Nav items */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,width:"100%",padding:"0 8px",gap:2}}>
          {NAV.map(n => (
            <NavIcon key={n.id} icon={n.icon} label={n.label} active={activeNav===n.id} badge={n.badge} onClick={()=>setView(n.id)}/>
          ))}
        </div>

        {/* Bottom */}
        <div style={{width:"100%",height:1,background:"rgba(255,255,255,.08)",margin:"8px 0 4px"}}/>
        <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,.6)",fontSize:13,fontWeight:600,cursor:"pointer"}}>N</div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{flex:1, display:"flex", flexDirection:"column", overflow:"hidden"}}>

        {/* TOP BAR */}
        <div style={{background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"0 24px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src="https://carpetsunlimitedinc.com/wp-content/uploads/2023/10/Primary-Gradient.svg"
              style={{height:30}} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="block";}}/>
            <span style={{display:"none",fontSize:14,fontWeight:600,color:"#111827"}}>Carpets Unlimited, Inc.</span>
            <span style={{color:"#e5e7eb",fontSize:16,margin:"0 4px"}}>|</span>
            <span style={{fontSize:13,color:"#6b7280"}}>AR Collections</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {ar.dsoHealth !== "green" && (
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#d97706",background:"#fef3c7",padding:"4px 10px",borderRadius:20,border:"1px solid #fde68a",fontWeight:500}}>
                ⚠ RFMS: Awaiting API Key
              </div>
            )}
            <Btn primary small onClick={()=>showToast("Daily digest sent to team!")}>Send digest</Btn>
          </div>
        </div>

        {/* PAGE */}
        <div style={{flex:1,overflowY:"auto",padding:24}}>
          {view==="overview"  && <OverviewView ar={ar} customers={customers} onCustomer={openCustomer} onAction={setView}/>}
          {view==="customers" && !profileKey && <CustomersView customers={customers} ar={ar} onCustomer={openCustomer}/>}
          {view==="customer"  && profileKey && <CustomerProfile k={profileKey} customers={customers} setCustomers={setCustomers} onBack={()=>{setView("customers");setProfileKey(null);}} showToast={showToast}/>}
          {view==="invoices"  && <InvoicesView customers={customers}/>}
          {view==="actions"   && <ActionsView ar={ar} customers={customers} onCustomer={openCustomer} showToast={showToast}/>}
          {view==="analytics" && <AnalyticsView ar={ar}/>}
          {view==="settings"  && <SettingsView/>}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"#111827",color:"#fff",padding:"10px 18px",borderRadius:10,fontSize:13,fontWeight:500,zIndex:999,boxShadow:"0 8px 24px rgba(0,0,0,.2)",whiteSpace:"nowrap"}}>
          {toast}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
        button:focus { outline: none; }
      `}</style>
    </div>
  );
}
