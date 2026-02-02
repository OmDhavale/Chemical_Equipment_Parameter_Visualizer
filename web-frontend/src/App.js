import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Typography, Box, Button, Card, Grid,
  Paper, AppBar, Toolbar, Avatar, CircularProgress, Fade,
  IconButton, Divider, Stack, Tooltip as MuiTooltip
} from "@mui/material";
import { styled } from '@mui/material/styles';
import HistoryIcon from '@mui/icons-material/History';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DownloadIcon from '@mui/icons-material/Download'; // Import Download Icon
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; // Import PDF Icon
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// --- Styled Components ---

const GlassCard = styled(Card)(({ theme, selected }) => ({
  background: "#ffffff",
  borderRadius: "24px",
  border: selected ? `2px solid #6366f1` : "1px solid #f1f5f9",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  height: '100%',
  overflow: 'hidden',
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 20px -5px rgba(0, 0, 0, 0.1)",
  },
}));

const StatPaper = styled(Paper)(({ theme }) => ({
  background: "#ffffff",
  borderRadius: "16px",
  padding: theme.spacing(2),
  border: "1px solid #e2e8f0",
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '100px'
}));

const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  borderRadius: 12,
  color: 'white',
  padding: '10px 28px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontSize: '0.875rem',
  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
  '&:hover': {
    boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)',
    filter: 'brightness(1.05)'
  },
  '&:disabled': {
    background: '#cbd5e1',
    color: 'white'
  }
});

const OutlineButton = styled(Button)({
  borderColor: '#6366f1',
  color: '#6366f1',
  borderRadius: 12,
  padding: '8px 20px',
  fontWeight: '700',
  borderWidth: 2,
  '&:hover': {
    borderWidth: 2,
    background: '#eef2ff',
    borderColor: '#4f46e5'
  }
});

const IconUploadButton = styled(IconButton)({
  border: '2px dashed #cbd5e1',
  borderRadius: '12px',
  padding: '8px',
  transition: '0.2s',
  '&:hover': {
    borderColor: '#6366f1',
    background: '#eef2ff'
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

  const activeData = selectedHistory || result;
  const summaryData = activeData ? activeData.summary : null;
  const activeId = selectedHistory ? selectedHistory.id : (result ? result.id : null);
  const activeName = selectedHistory ? selectedHistory.name : (result ? result.name : "report");
  
  const pieData = summaryData?.type_distribution ? {
    labels: Object.keys(summaryData.type_distribution),
    datasets: [{
      data: Object.values(summaryData.type_distribution),
      backgroundColor: ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6"],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 10
    }],
  } : null;

  const barData = summaryData ? {
    labels: ["Flow", "Press", "Temp"],
    datasets: [{
      label: "Average",
      data: [summaryData.avg_flowrate, summaryData.avg_pressure, summaryData.avg_temperature],
      backgroundColor: "#818cf8",
      borderRadius: 6,
      barThickness: 40,
    }],
  } : null;

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };


  const downloadPDF = async (datasetId, name, e) => {
    if(e) e.stopPropagation(); // Prevent card click event
    if(!datasetId) return;

    try {
      // NOTE: Ensure your backend supports this endpoint
      const res = await axios.get(
        `http://127.0.0.1:8000/api/report/${datasetId}/`,
        { responseType: 'blob' }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${name.replace('.csv', '')}_report.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("PDF generation failed. Ensure backend has /api/report/<id> endpoint.");
    }
  };

  return (
    <Box sx={{ 
      background: "#f8faff", 
      minHeight: '100vh',
      width: '100%',
      pb: 8
    }}>
      {/* 1. Navbar */}
      <Container maxWidth="xl" sx={{ pt: 3, px: { xs: 2, md: 5 } }}>
        <AppBar position="static" elevation={0} sx={{ 
          background: "transparent", 
          color: "#1e293b",
          borderBottom: "none"
        }}>
          <Toolbar disableGutters>
            <Avatar sx={{ background: 'linear-gradient(45deg, #6366f1, #a855f7)', mr: 2, width: 36, height: 36 }}>
              <AnalyticsIcon sx={{ fontSize: 22 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5, flexGrow: 1 }}>
              ChemViz <span style={{ color: '#6366f1' }}>Pro</span>
            </Typography>
          </Toolbar>
        </AppBar>
      </Container>

      {/* Main Content Vertical Stack */}
      <Container maxWidth="xl" sx={{ mt: 4, px: { xs: 2, md: 5 } }}>
        
        {/* 2. Control Toolbar (Horizontal Data Intake) */}
        <GlassCard sx={{ mb: 4, p: { xs: 2, md: 2 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={3}>
            <Box sx={{ minWidth: 150 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>Data Intake</Typography>
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, borderRightWidth: 2, borderColor: '#f1f5f9' }} />
            
            <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1, width: { xs: '100%', md: 'auto' } }}>
              <input 
                type="file" 
                accept=".csv" 
                style={{ display: 'none' }} 
                id="csv-upload" 
                onChange={(e) => setFile(e.target.files[0])} 
              />
              <label htmlFor="csv-upload">
                <IconUploadButton component="span">
                  <FolderOpenIcon sx={{ fontSize: 24, color: '#6366f1' }} />
                </IconUploadButton>
              </label>
              
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {file ? file.name : "Select CSV Dataset"}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Max file size: 10MB
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
               <GradientButton 
                onClick={uploadFile} 
                disabled={!file || loading}
                fullWidth
               >
                {loading ? <CircularProgress size={20} color="inherit" /> : "Run Analysis"}
              </GradientButton>
            </Box>
          </Stack>
        </GlassCard>

        {/* 3. Dashboard Results (Full Width) */}
        {summaryData && !summaryData.error ? (
          <Fade in={true} timeout={800}>
            <Box>
              {/* Header for Dashboard with Download Button */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
                   Dashboard Analysis: <span style={{color: '#6366f1', fontWeight: 500}}>{activeName}</span>
                </Typography>
                <OutlineButton 
                  startIcon={<PictureAsPdfIcon />} 
                  onClick={(e) => downloadPDF(activeId, activeName, e)}
                >
                  Download Report
                </OutlineButton>
              </Stack>

              {/* Stats Row (1x4) */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {[
                  { label: "SAMPLES", val: summaryData.count },
                  { label: "FLOW RATE", val: summaryData.avg_flowrate?.toFixed(1) },
                  { label: "PRESSURE", val: summaryData.avg_pressure?.toFixed(1) },
                  { label: "TEMPERATURE", val: summaryData.avg_temperature?.toFixed(1) }
                ].map((stat, i) => (
                  <Grid item xs={6} md={3} key={i}>
                    <StatPaper elevation={0}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', letterSpacing: 1 }}>{stat.label}</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#6366f1', mt: 1 }}>{stat.val}</Typography>
                    </StatPaper>
                  </Grid>
                ))}
              </Grid>

              {/* Charts Row (Side-by-Side) */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <GlassCard sx={{ p: 4, height: 400 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', mb: 3 }}>
                      Equipment Distribution
                    </Typography>
                    <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                      <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
                    </Box>
                  </GlassCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <GlassCard sx={{ p: 4, height: 400 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', mb: 3 }}>
                      Performance Average
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <Bar data={barData} options={chartOptions} />
                    </Box>
                  </GlassCard>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        ) : (
          /* Placeholder Full Width */
          <GlassCard sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 10, minHeight: 400, bgcolor: 'rgba(255,255,255,0.5)' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                width: 80, height: 80, borderRadius: '24px', bgcolor: '#eef2ff', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 
              }}>
                <AnalyticsIcon sx={{ fontSize: 40, color: '#6366f1' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#cbd5e1' }}>Awaiting Analysis</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
                Use the toolbar above to upload a dataset
              </Typography>
            </Box>
          </GlassCard>
        )}

        {/* 4. History Section (Bottom) */}
        <Box sx={{ mt: 6 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <HistoryIcon sx={{ color: '#6366f1' }} />
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>Recent Reports</Typography>
          </Stack>
          
          <Grid container spacing={3}>
            {history.map((item, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <GlassCard 
                  selected={selectedHistory && selectedHistory.id === item.id} 
                  onClick={() => setSelectedHistory(item)} 
                  sx={{ cursor: 'pointer', p: 3, position: 'relative' }}
                >
                  {/* Download Action for History Item */}
                  <MuiTooltip title="Download PDF Report">
                    <IconButton 
                      size="small" 
                      onClick={(e) => downloadPDF(item.id, item.name, e)}
                      sx={{ position: 'absolute', top: 12, right: 12, color: '#94a3b8', '&:hover': { color: '#6366f1' } }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </MuiTooltip>

                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CloudUploadIcon sx={{ fontSize: 20, color: '#64748b' }} />
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#6366f1', bgcolor: '#eef2ff', px: 1, py: 0.5, borderRadius: 1, mr: 4 }}>
                      {new Date(item.uploaded_at).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Samples: {item.summary?.count}
                  </Typography>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        </Box>

      </Container>
    </Box>
  );
}

export default App;