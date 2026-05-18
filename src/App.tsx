import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Activity, Target, X, Download, FilterX, Phone } from 'lucide-react';
import data from './data.json';
import './index.css';

interface BLOData {
  sl_no: number;
  ps_no: number;
  aero: number;
  name: string;
  designation: string;
  mobile: string;
  percentage: number;
}

type FilterType = { type: 'all' } | { type: 'high_performers' } | { type: 'designation', value: string } | { type: 'aero', value: number };

const COLORS = ['#16a34a', '#059669', '#10b981', '#34d399', '#6ee7b7', '#0ea5e9', '#3b82f6'];

function App() {
  const [selectedRow, setSelectedRow] = useState<BLOData & { rank: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>({ type: 'all' });
  const [showTotalModal, setShowTotalModal] = useState(false);
  const [drilledDesignation, setDrilledDesignation] = useState<string | null>(null);
  
  const scrollToTable = () => {
    setTimeout(() => {
      const tableEl = document.getElementById('main-table');
      if (tableEl) {
        tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50); // slight delay to allow React to render any UI changes first
  };

  // Filter and Sort data
  const filteredData = useMemo(() => {
    let filtered = [...data];
    if (activeFilter.type === 'high_performers') {
      filtered = filtered.filter(d => d.percentage >= 50);
    } else if (activeFilter.type === 'designation') {
      filtered = filtered.filter(d => d.designation.trim() === activeFilter.value);
    } else if (activeFilter.type === 'aero') {
      filtered = filtered.filter(d => d.aero === activeFilter.value);
    }
    
    return filtered.sort((a, b) => a.percentage - b.percentage).map((item, index) => ({
      ...item,
      computed_sl_no: index + 1 // Add logic-based serial number (Rank)
    }));
  }, [activeFilter]);

  const totalBLOs = data.length;
  const avgPercentage = (data.reduce((acc, curr) => acc + curr.percentage, 0) / totalBLOs).toFixed(2);
  const highPerformers = data.filter(d => d.percentage >= 50).length;

  // Process data for Pie Chart (Designation Distribution)
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      const desig = item.designation.trim() || 'Unknown';
      counts[desig] = (counts[desig] || 0) + 1;
    });
    return Object.keys(counts)
      .map(key => ({ name: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, []);

  // Process data for Bar Chart (Average Percentage by AERO)
  const barData = useMemo(() => {
    const aeroStats: Record<number, { sum: number, count: number }> = {};
    data.forEach(item => {
      if (!aeroStats[item.aero]) aeroStats[item.aero] = { sum: 0, count: 0 };
      aeroStats[item.aero].sum += item.percentage;
      aeroStats[item.aero].count += 1;
    });
    return Object.keys(aeroStats).map(key => ({
      name: `AERO ${key}`,
      avg: Number((aeroStats[Number(key)].sum / aeroStats[Number(key)].count).toFixed(2))
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Lowest -> Red, Mid -> Yellow, Highest -> Green
  const getStatusClass = (percentage: number) => {
    if (percentage >= 50) return 'status-high'; // Green
    if (percentage >= 25) return 'status-medium'; // Yellow
    return 'status-low'; // Red
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 50) return 'var(--success)';
    if (percentage >= 25) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getFilterDescription = () => {
    if (activeFilter.type === 'high_performers') return 'Top Performers (≥ 50%)';
    if (activeFilter.type === 'designation') return `Designation: ${activeFilter.value}`;
    if (activeFilter.type === 'aero') return `AERO Zone: ${activeFilter.value}`;
    return 'All Records';
  };

  return (
    <div className="dashboard-container">
      <header className="header animate-fade-in">
        <div className="header-content">
          <h1>BLO Mapping Overview</h1>
          <div className="header-actions">
             <button className="btn btn-secondary glass-panel"><Download size={16} style={{display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom'}}/> Export PDF</button>
             <button className="btn btn-primary glass-panel"><Download size={16} style={{display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom'}}/> Export CSV</button>
          </div>
        </div>
      </header>

      <section className="summary-cards animate-fade-in delay-1">
        <div className="card glass-panel interactive-card" onClick={() => setShowTotalModal(true)}>
          <div className="card-icon">
            <Users size={28} />
          </div>
          <div className="card-info">
            <h3>Total BLOs</h3>
            <p>{totalBLOs}</p>
            <span className="card-hint">Click to view Directory</span>
          </div>
        </div>
        <div className="card glass-panel interactive-card" onClick={() => { setActiveFilter({ type: 'all' }); scrollToTable(); }}>
          <div className="card-icon" style={{color: 'var(--warning)', background: 'rgba(234, 179, 8, 0.1)'}}>
            <Activity size={28} />
          </div>
          <div className="card-info">
            <h3>Avg Percentage</h3>
            <p>{avgPercentage}%</p>
            <span className="card-hint">Click to clear filters</span>
          </div>
        </div>
        <div className="card glass-panel interactive-card" onClick={() => { setActiveFilter({ type: 'high_performers' }); scrollToTable(); }}>
          <div className="card-icon" style={{color: 'var(--success)'}}>
            <Target size={28} />
          </div>
          <div className="card-info">
            <h3>High Performers</h3>
            <p>{highPerformers}</p>
            <span className="card-hint">Click to filter table</span>
          </div>
        </div>
      </section>

      <section className="charts-container animate-fade-in delay-2">
        <div className="chart-wrapper glass-panel">
          <h2>Designation Distribution <span className="card-hint" style={{fontWeight: 'normal', fontSize: '0.8rem', marginLeft: '8px'}}>(Click to view individuals)</span></h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(data) => setDrilledDesignation(data.name ? String(data.name) : null)}
                  style={{ cursor: 'pointer' }}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Legend onClick={(e) => setDrilledDesignation(String(e.value))} wrapperStyle={{cursor: 'pointer'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-wrapper glass-panel">
          <h2>Avg Completion by AERO <span className="card-hint" style={{fontWeight: 'normal', fontSize: '0.8rem', marginLeft: '8px'}}>(Click to filter)</span></h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(34, 197, 94, 0.05)'}}
                  contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                />
                <Bar 
                  dataKey="avg" 
                  fill="var(--accent-1)" 
                  radius={[4, 4, 0, 0]}
                  onClick={(data) => { if (data.name) { setActiveFilter({ type: 'aero', value: Number(String(data.name).split(' ')[1]) }); scrollToTable(); } }}
                  style={{ cursor: 'pointer' }}
                >
                  {barData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="table-container glass-panel animate-fade-in delay-3" id="main-table">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>
            Detailed BLO Report 
            <span style={{color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.9rem', marginLeft: '10px'}}>
              (Ranked Lowest to Highest)
            </span>
          </h2>
          
          {activeFilter.type !== 'all' && (
            <div className="filter-badge">
              <span>Showing: <strong>{getFilterDescription()}</strong></span>
              <button onClick={() => setActiveFilter({ type: 'all' })} className="clear-filter-btn" title="Clear Filter">
                <FilterX size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Rank / SL No</th>
                <th>PS No</th>
                <th>AERO</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
                    No records found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={index} onClick={() => setSelectedRow({ ...row, rank: row.computed_sl_no })}>
                    <td>#{row.computed_sl_no}</td>
                    <td>{row.ps_no}</td>
                    <td>{row.aero}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.name}</td>
                    <td>{row.designation || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(row.percentage)}`}>
                        {row.percentage}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Directory Modal for "Total BLOs" click */}
      <div className={`modal-overlay ${showTotalModal ? 'active' : ''}`} onClick={() => setShowTotalModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '700px'}}>
          <div className="modal-header">
            <h2>BLO Directory (Simplified List)</h2>
            <button className="close-btn" onClick={() => setShowTotalModal(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="modal-body" style={{display: 'block', maxHeight: '60vh', overflowY: 'auto', padding: '0'}}>
            <table style={{minWidth: 'auto', width: '100%'}}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th>Full Name</th>
                  <th>PS No. (Part No)</th>
                  <th>Mobile Number</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} style={{cursor: 'default', background: 'transparent'}}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.name}</td>
                    <td>{row.ps_no}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{row.mobile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal for Individual Officer */}
      <div className={`modal-overlay ${selectedRow ? 'active' : ''}`} onClick={() => setSelectedRow(null)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Officer Details</h2>
            <button className="close-btn" onClick={() => setSelectedRow(null)}>
              <X size={20} />
            </button>
          </div>
          {selectedRow && (
            <div className="modal-body">
              <div className="detail-item highlight">
                <div>
                  <div className="detail-label">Full Name</div>
                  <div className="detail-value">{selectedRow.name}</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div className="detail-label">Rank</div>
                  <div className="detail-value" style={{color: 'var(--text-main)'}}>#{selectedRow.rank}</div>
                </div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="detail-item">
                  <div className="detail-label">Completion Status</div>
                  <div className={`status-badge ${getStatusClass(selectedRow.percentage)}`} style={{fontSize: '1rem', padding: '0.4rem 0.8rem'}}>
                    {selectedRow.percentage}%
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Designation</div>
                  <div className="detail-value">{selectedRow.designation || 'N/A'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Polling Station (PS) No.</div>
                  <div className="detail-value">{selectedRow.ps_no}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Mobile Number</div>
                  <div className="detail-value">{selectedRow.mobile}</div>
                </div>
                <div className="detail-item" style={{gridColumn: '1 / -1'}}>
                  <div className="detail-label">AERO Division</div>
                  <div className="detail-value">{selectedRow.aero}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Designation Drill-down Chart Modal - Refactored to Responsive Performance Cards Grid */}
      <div className={`modal-overlay ${drilledDesignation ? 'active' : ''}`} onClick={() => setDrilledDesignation(null)}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '1200px'}}>
          <div className="modal-header">
            <h2>{drilledDesignation} - Individual Performance</h2>
            <button className="close-btn" onClick={() => setDrilledDesignation(null)}>
              <X size={20} />
            </button>
          </div>
          {drilledDesignation && (
            <div className="modal-body" style={{display: 'block', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem'}}>
              <div className="person-grid">
                {data
                  .filter(d => d.designation === drilledDesignation)
                  .sort((a,b) => b.percentage - a.percentage)
                  .map((person, idx) => (
                    <div className="person-card" key={idx}>
                      <div className="person-card-header">
                        <h3>{person.name}</h3>
                        <span className="ps-badge">PS No: {person.ps_no}</span>
                      </div>
                      
                      <div className="progress-container">
                        <div className="progress-header">
                          <span style={{color: 'var(--text-muted)'}}>Completion</span>
                          <span style={{color: getProgressColor(person.percentage)}}>{person.percentage}%</span>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{
                              width: `${person.percentage}%`,
                              backgroundColor: getProgressColor(person.percentage)
                            }} 
                          />
                        </div>
                      </div>
                      
                      <div className="person-card-footer">
                        <Phone size={14} />
                        <span>{person.mobile}</span>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
