import {useEffect,useState} from "react";
function Input({label,...props}){return <label className="field"><span>{label}</span><input {...props}/></label>}
function metric(v){return v??0}
function ReportForm({ops}){const d=ops.dashboard,r=ops.report;const [f,setF]=useState({});
 useEffect(()=>{setF({occupancyPercent:r?.occupancyPercent??d?.occupancyPercent??0,roomsSold:r?.roomsSold??d?.rooms?.occupied??0,roomsAvailable:r?.roomsAvailable??d?.rooms?.available??0,adr:r?.adr??0,revpar:r?.revpar??0,revenue:r?.revenue??0,complaints:r?.complaints??0,staffPresent:r?.staffPresent??d?.staff?.present??0,checkIns:r?.checkIns??d?.checkIns??0,checkOuts:r?.checkOuts??d?.checkOuts??0,notes:r?.notes??""})},[r,d]);
 const set=k=>e=>setF(x=>({...x,[k]:e.target.value}));
 if(!ops.can("operations.report.create"))return <div className="panel muted">You can view daily reports but do not have permission to submit or correct them.</div>;
 return <form className="panel form-grid" onSubmit={e=>{e.preventDefault();ops.submitReport(f)}}><div className="section-title"><h2>{r?"Daily report already submitted":"Submit daily operations report"}</h2><span className="muted">{r?"Correction permission is required to overwrite it.":"One official report is allowed per hotel per business date."}</span></div>
  <Input label="Occupancy %" type="number" min="0" max="100" step="0.01" value={f.occupancyPercent??""} onChange={set("occupancyPercent")} required/>
  <Input label="Rooms sold" type="number" min="0" value={f.roomsSold??""} onChange={set("roomsSold")} required/>
  <Input label="Rooms available" type="number" min="0" value={f.roomsAvailable??""} onChange={set("roomsAvailable")} required/>
  <Input label="ADR" type="number" min="0" step="0.01" value={f.adr??""} onChange={set("adr")} required/>
  <Input label="RevPAR" type="number" min="0" step="0.01" value={f.revpar??""} onChange={set("revpar")} required/>
  <Input label="Total revenue" type="number" min="0" step="0.01" value={f.revenue??""} onChange={set("revenue")} required/>
  <Input label="Guest complaints" type="number" min="0" value={f.complaints??""} onChange={set("complaints")}/>
  <Input label="Staff present" type="number" min="0" value={f.staffPresent??""} onChange={set("staffPresent")} required/>
  <Input label="Check-ins" type="number" min="0" value={f.checkIns??""} onChange={set("checkIns")}/>
  <Input label="Check-outs" type="number" min="0" value={f.checkOuts??""} onChange={set("checkOuts")}/>
  <Input label="Important notes / correction reason" value={f.notes??""} onChange={set("notes")} />
  <div><button className="primary">{r?"Correct daily report":"Submit daily report"}</button></div>
 </form>}
function Card({label,value,sub}){return <div className="stat-card"><span>{label}</span><strong>{value}</strong>{sub&&<small>{sub}</small>}</div>}
export default function OperationsView({hotels,ops}){
 const d=ops.dashboard;
 return <section>
  <div className="page-heading"><div><p className="eyebrow">DAILY OPERATIONS</p><h1>Hotel command center</h1><p className="muted">Current operational state, daily reporting and exceptions for the selected hotel.</p></div>
   <div className="header-actions"><select className="hotel-picker" value={ops.hotelId} onChange={e=>ops.setHotelId(e.target.value)}>{hotels.map(h=><option key={h._id} value={h._id}>{h.name}</option>)}</select><input className="date-picker" type="date" value={ops.date} onChange={e=>ops.setDate(e.target.value)}/></div>
  </div>
  {ops.error&&<div className="error-banner">{ops.error}</div>}
  {ops.loading?<div className="loading">Loading operational data…</div>:<>
   {d&&<><div className="stats-grid"><Card label="Occupancy" value={metric(d.occupancyPercent)+"%"} sub={metric(d.rooms?.occupied)+" rooms occupied"}/><Card label="Rooms available" value={metric(d.rooms?.available)}/><Card label="Check-ins" value={metric(d.checkIns)}/><Card label="Check-outs" value={metric(d.checkOuts)}/><Card label="Dirty rooms" value={metric(d.rooms?.dirty)}/><Card label="Cleaning" value={metric(d.rooms?.cleaning)}/><Card label="Ready rooms" value={metric(d.rooms?.ready)}/><Card label="Pending tasks" value={metric(d.pendingTasks)}/><Card label="Maintenance open" value={metric(d.maintenance?.open)}/><Card label="Urgent maintenance" value={metric(d.maintenance?.urgent)}/><Card label="Open complaints" value={metric(d.maintenance?.openComplaints)}/><Card label="Open incidents" value={metric(d.maintenance?.openIncidents)}/><Card label="Overdue tasks" value={metric(d.maintenance?.overdueTasks)}/></div>
    <div className="two-column"><div className="panel"><div className="section-title"><h2>Staff</h2></div><div className="mini-stats"><Card label="Scheduled" value={metric(d.staff?.scheduled)}/><Card label="Present" value={metric(d.staff?.present)}/><Card label="Absent" value={metric(d.staff?.absent)}/><Card label="Late" value={metric(d.staff?.late)}/><Card label="On leave" value={metric(d.staff?.onLeave)}/></div></div>
     <div className="panel"><div className="section-title"><h2>Operational alerts</h2></div>{ops.exceptions.length?<div className="exception-list">{ops.exceptions.map((x,i)=><div className="exception-item" key={i}><strong>{x.severity.toUpperCase()}</strong><span>{x.message}</span></div>)}</div>:<p className="muted">No current exceptions require attention.</p>}</div>
    </div></>}
   {ops.can("operations.report.view")&&<><ReportForm ops={ops}/><div className="panel"><div className="section-title"><h2>Recent daily reports</h2><span className="muted">Last 90 business days</span></div><div className="table-wrap"><table><thead><tr><th>Date</th><th>Occupancy</th><th>Rooms sold</th><th>Revenue</th><th>Staff present</th><th>Submitted by</th><th>Status</th></tr></thead><tbody>{ops.reports.map(r=><tr key={r._id}><td>{new Date(r.businessDate).toLocaleDateString("en-IN")}</td><td>{r.occupancyPercent}%</td><td>{r.roomsSold}</td><td>₹{Number(r.revenue||0).toLocaleString("en-IN")}</td><td>{r.staffPresent}</td><td>{r.submittedBy?.name||"—"}</td><td><span className="status">{r.status}</span></td></tr>)}</tbody></table></div></div></>}
   {ops.can("operations.group.view")&&ops.groupSummary&&<div className="panel"><div className="section-title"><div><h2>Group view</h2><span className="muted">{ops.groupSummary.date?new Date(ops.groupSummary.date).toLocaleDateString("en-IN"):"Today"}</span></div></div><div className="stats-grid"><Card label="Hotels" value={ops.groupSummary.totalHotels}/><Card label="Reports submitted" value={ops.groupSummary.submitted}/><Card label="Reports pending" value={ops.groupSummary.pending}/><Card label="Group occupancy" value={ops.groupSummary.groupOccupancy+"%"}/><Card label="Revenue" value={"₹"+Number(ops.groupSummary.revenue||0).toLocaleString("en-IN")}/></div></div>}
  </>}
 </section>
}