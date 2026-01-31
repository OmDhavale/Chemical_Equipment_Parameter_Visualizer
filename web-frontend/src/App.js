import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Typography, Box, Button, Card, CardContent, Grid,
  Paper, AppBar, Toolbar, Avatar, CircularProgress, Fade
} from "@mui/material";
import { styled } from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HistoryIcon from '@mui/icons-material/History';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// --- Responsive Glossy Components ---

const GlassCard = styled(Card)(({ theme, selected }) => ({
  background: "rgba(255, 255, 255, 0.75)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: "24px",
  border: selected ? `2px solid #6366f1` : "1px solid rgba(255, 255, 255, 0.4)",
  boxShadow: "0 8px 32px rgba(31, 38, 135, 0.05)",
  height: '100%',
  overflow: 'hidden', // Prevents chart overlap
  transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 12px 40px rgba(31, 38, 135, 0.1)",
  },
}));

const StatPaper = styled(Paper)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.8)",
  borderRadius: "20px",
  padding: theme.spacing(3, 1),
  border: "1px solid rgba(255, 255, 255, 0.3)",
  textAlign: 'center',
  minHeight: '110px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  // Responsive sizing for labels
  [theme.breakpoints.down('sm')]: {
    minHeight: '90px',
    padding: theme.spacing(2, 1),
  }
}));

const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  borderRadius: 14,
  color: 'white',
  padding: '14px 20px',
  fontWeight: '700',
  textTransform: 'none',
  boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.3)',
  '&:hover': {
    boxShadow: '0 12px 20px -4px rgba(99, 102, 241, 0.4)',
    filter: 'brightness(1.05)'
  }
});

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/history/");
      setHistory(res.data);
    } catch (err) { setHistory([]); }
  };

  const uploadFile = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/upload/", formData);
      setResult(res.data);
      setSelectedHistory(null);
      fetchHistory();
    } catch (err) { setResult({ error: "Upload failed" }); }
    setLoading(false);
  };

  const summaryData = selectedHistory ? selectedHistory.summary : result;
  
  const pieData = summaryData?.type_distribution ? {
    labels: Object.keys(summaryData.type_distribution),
    datasets: [{
      data: Object.values(summaryData.type_distribution),
      backgroundColor: ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6"],
      hoverOffset: 10
    }],
  } : null;

  const barData = summaryData ? {
    labels: ["Flow", "Press", "Temp"],
    datasets: [{
      label: "Average",
      data: [summaryData.avg_flowrate, summaryData.avg_pressure, summaryData.avg_temperature],
      backgroundColor: "rgba(99, 102, 241, 0.85)",
      borderRadius: 8,
    }],
  } : null;

  return (
    <Box sx={{ 
      background: "radial-gradient(at top left, #f1f5f9 0%, #e0e7ff 100%)", 
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden' 
    }}>
      {/* Navbar Container */}
      <Container maxWidth="lg" sx={{ pt: { xs: 1, sm: 3 } }}>
        <AppBar position="static" elevation={0} sx={{ 
          background: "rgba(255,255,255,0.6)", 
          backdropFilter: "blur(12px)", 
          borderRadius: "24px", 
          border: "1px solid rgba(255,255,255,0.4)",
          color: "#1e293b"
        }}>
          <Toolbar>
            <Avatar sx={{ background: 'linear-gradient(45deg, #6366f1, #a855f7)', mr: 2, width: 32, height: 32 }}>
              <AnalyticsIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
              ChemViz <span style={{ color: '#6366f1', fontWeight: 500 }}>Pro</span>
            </Typography>
          </Toolbar>
        </AppBar>
      </Container>

      <Container maxWidth="lg" sx={{ mt: { xs: 3, md: 6 }, pb: 6 }}>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          
          {/* Upload Section - Responsive Stack */}
          <Grid item xs={12} md={4}>
            <GlassCard sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#1e293b' }}>Data Intake</Typography>
              <Typography variant="body2" sx={{ mb: 4, color: '#64748b' }}>Precision analysis for equipment metrics</Typography>
              
              <Box sx={{ 
                border: '2px dashed #cbd5e1', borderRadius: '20px', p: 4, textAlign: 'center', 
                bgcolor: 'rgba(255,255,255,0.3)', mb: 4,
                transition: '0.3s', '&:hover': { borderColor: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.05)' }
              }}>
                <input type="file" accept=".csv" style={{ display: 'none' }} id="csv-upload" onChange={(e) => setFile(e.target.files[0])} />
                <label htmlFor="csv-upload" style={{ cursor: 'pointer', width: '100%' }}>
                  <CloudUploadIcon sx={{ fontSize: 44, color: '#6366f1', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', wordBreak: 'break-all' }}>
                    {file ? file.name : "Select CSV Dataset"}
                  </Typography>
                </label>
              </Box>
              <GradientButton fullWidth onClick={uploadFile} disabled={!file || loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "Run Analysis"}
              </GradientButton>
            </GlassCard>
          </Grid>

          {/* Visualization Section */}
          <Grid item xs={12} md={8}>
            {summaryData && !summaryData.error ? (
              <Fade in={true} timeout={600}>
                <Box>
                  {/* Stats Row with spacing fix */}
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[
                      { label: "SAMPLES", val: summaryData.count },
                      { label: "FLOW", val: summaryData.avg_flowrate?.toFixed(1) },
                      { label: "PRESS", val: summaryData.avg_pressure?.toFixed(1) },
                      { label: "TEMP", val: summaryData.avg_temperature?.toFixed(1) }
                    ].map((stat, i) => (
                      <Grid item xs={6} sm={3} key={i}>
                        <StatPaper elevation={0}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8' }}>{stat.label}</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: i === 0 ? '#1e293b' : '#6366f1' }}>{stat.val}</Typography>
                        </StatPaper>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Charts Grid */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <GlassCard sx={{ p: 3, minHeight: 300 }}>
                        <Typography variant="button" sx={{ fontWeight: 800, color: '#64748b', display: 'block', mb: 3 }}>Type Distribution</Typography>
                        <Box sx={{ height: 200 }}>
                          <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
                        </Box>
                      </GlassCard>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <GlassCard sx={{ p: 3, minHeight: 300 }}>
                        <Typography variant="button" sx={{ fontWeight: 800, color: '#64748b', display: 'block', mb: 3 }}>Performance Average</Typography>
                        <Box sx={{ height: 200 }}>
                          <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                        </Box>
                      </GlassCard>
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            ) : (
              <GlassCard sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 8, minHeight: { md: '100%' } }}>
                <Box sx={{ textAlign: 'center', opacity: 0.4 }}>
                  <AnalyticsIcon sx={{ fontSize: 60, color: '#6366f1', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>No Data Analyzed</Typography>
                  <Typography variant="body2">Upload a CSV to view the dashboard</Typography>
                </Box>
              </GlassCard>
            )}
          </Grid>

          {/* History Section */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <HistoryIcon sx={{ mr: 1.5, color: '#6366f1' }} />
              <Typography variant="h6" sx={{ fontWeight: 900 }}>Recent Reports</Typography>
            </Box>
            <Grid container spacing={2}>
              {history.length === 0 ? (
                 <Grid item xs={12}><Typography variant="body2" sx={{ opacity: 0.5 }}>Empty archive...</Typography></Grid>
              ) : history.map((item, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <GlassCard 
                    selected={selectedHistory === item} 
                    onClick={() => setSelectedHistory(item)} 
                    sx={{ cursor: 'pointer', p: 2.5 }}
                  >
                    <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 900 }}>
                      {new Date(item.uploaded_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, mt: 0.5, mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ px: 1, py: 0.5, bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px' }}>
                        <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700 }}>N: {item.summary?.count}</Typography>
                      </Box>
                    </Box>
                  </GlassCard>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;