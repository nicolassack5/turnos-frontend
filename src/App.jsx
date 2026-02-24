import { useEffect, useState, useRef } from 'react'; 
import axios from './config/axiosConfig'; 
import Login from './Login';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Container, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Button, 
  AppBar, Toolbar, IconButton, Box, Dialog, DialogTitle, 
  DialogContent, TextField, DialogActions, FormControl, 
  InputLabel, Select, MenuItem, Alert, Chip, Switch, FormControlLabel,
  createTheme, ThemeProvider, CssBaseline, Stack, Divider,
  Snackbar, Tooltip, CircularProgress, Tabs, Tab, Avatar, Card, CardContent, 
  InputAdornment, DialogContentText, Grid, TablePagination, Fade,
  useMediaQuery, Badge 
} from '@mui/material';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// ICONOS
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import KeyIcon from '@mui/icons-material/Key';
import WarningIcon from '@mui/icons-material/Warning';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HistoryIcon from '@mui/icons-material/History'; 
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; 
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'; 
import DownloadIcon from '@mui/icons-material/Download';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const theme = createTheme({
  palette: {
    primary: { main: '#00897b', contrastText: '#fff' }, 
    secondary: { main: '#e64a19' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    text: { primary: '#37474f', secondary: '#546e7a' }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' }
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 12 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } }, 
    MuiInputBase: { styleOverrides: { root: { backgroundColor: '#f9f9f9' } } } 
  }
});

const listaEspecialidades = ["Cardiología", "Clínica Médica", "Dermatología", "Ginecología", "Neurología", "Nutrición", "Pediatría", "Traumatología", "Urología"];
const COLORS = ['#00897b', '#e64a19', '#ffa726', '#2196f3', '#9c27b0', '#00bcd4', '#4caf50'];

function App() {
  const [token, setToken] = useState(sessionStorage.getItem('jwt_token')); 
  const [rol, setRol] = useState(sessionStorage.getItem('user_role')); 
  const [usuarioNombre, setUsuarioNombre] = useState(''); 

  const [turnos, setTurnos] = useState([]);
  const [medicos, setMedicos] = useState([]); 
  const [usuarios, setUsuarios] = useState([]); 
  const [stats, setStats] = useState({ especialidades: [], asistencia: [] });
  
  const [open, setOpen] = useState(false); 
  const [openUser, setOpenUser] = useState(false); 
  const [openProfile, setOpenProfile] = useState(false); 
  const [openPassword, setOpenPassword] = useState(false); 
  const [openLogout, setOpenLogout] = useState(false); 
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, type: null, text: '' });
  
  const [openImageModal, setOpenImageModal] = useState(false);

  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [cargando, setCargando] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const [tabValue, setTabValue] = useState(0); 
  const [adminTab, setAdminTab] = useState(0); 
  const [medicoTab, setMedicoTab] = useState(0); 

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');

  const [chatOpen, setChatOpen] = useState(false);
  const [userMsg, setUserMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([{ sender: 'bot', text: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?' }]);
  const chatEndRef = useRef(null); 

  const [form, setForm] = useState({ id: null, especialidad: '', medicoId: '', fecha: '', hora: '', descripcion: '', diagnostico: '', asistio: false, cliente: '' });
  const [profile, setProfile] = useState({ nombreCompleto: '', dni: '', telefono: '', username: '', fotoPerfil: '' });
  
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [codigoEnviado, setCodigoEnviado] = useState(false); 
  const [codigoVerificacion, setCodigoVerificacion] = useState('');

  const [formUser, setFormUser] = useState({ id: null, username: '', password: '', rol: 'MEDICO', nombreCompleto: '', dni: '', telefono: '', especialidad: '' });

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verifyToken');
    if (verifyToken) {
        axios.get(`/auth/verify-account?token=${verifyToken}`)
            .then(() => {
                setNotification("¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.");
                window.history.replaceState({}, document.title, window.location.pathname);
            })
            .catch(() => setError("Error verificando cuenta."));
    }
    if (token) cargarDatosCompletos();
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const cargarDatosCompletos = async () => {
    setCargando(true);
    try {
      const resPerfil = await axios.get('/usuario/perfil');
      setUsuarioNombre(resPerfil.data.nombreCompleto || resPerfil.data.username);
      setProfile(resPerfil.data);
      const resUsuarios = await axios.get('/usuario/todos');
      setUsuarios(resUsuarios.data);
      setMedicos(resUsuarios.data.filter(u => u.rol === 'MEDICO'));
      const resTurnos = await axios.get('/turnos');
      setTurnos(resTurnos.data.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)));
      if (rol === 'ADMIN') {
        const resStats = await axios.get('/api/stats/dashboard');
        setStats(resStats.data);
      }
    } catch (err) { console.error(err); } 
    finally { setCargando(false); }
  };

  const getTurnosPaciente = () => {
    const ahora = new Date();
    const misTurnos = turnos.filter(t => 
        t.pacienteUsername?.toLowerCase() === profile.username?.toLowerCase() || 
        t.cliente?.toLowerCase() === usuarioNombre?.toLowerCase()
    );
    if (tabValue === 2) return misTurnos; 
    return tabValue === 0 
      ? misTurnos.filter(t => new Date(t.fechaHora) >= ahora).sort((a,b) => new Date(a.fechaHora) - new Date(b.fechaHora))
      : misTurnos.filter(t => new Date(t.fechaHora) < ahora).sort((a,b) => new Date(b.fechaHora) - new Date(a.fechaHora));
  };

  const getHistorialClinico = () => {
    return turnos
      .filter(t => t.cliente === form.cliente && t.id !== form.id && t.diagnostico && t.asistio)
      .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
  };

  const generarHorariosDisponibles = () => {
    if (!form.fecha || !form.medicoId) return [];
    const horariosBase = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
        "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
    ];
    const turnosOcupados = turnos.filter(t => {
        const esMismoMedico = t.medicoId === form.medicoId;
        const esMismaFecha = t.fechaHora.split('T')[0] === form.fecha;
        const noEsElTurnoActual = t.id !== form.id; 
        return esMismoMedico && esMismaFecha && noEsElTurnoActual;
    }).map(t => t.fechaHora.split('T')[1].substring(0, 5));

    return horariosBase.filter(h => !turnosOcupados.includes(h));
  };

  const handleChangeFechaMedico = (campo, valor) => {
      setForm(prev => ({ ...prev, [campo]: valor, hora: '' }));
  };

  const handleSubirFoto = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("archivo", file);

      try {
          setNotification("Subiendo foto de perfil...");
          const res = await axios.post('/usuario/perfil/foto', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          setProfile(prev => ({ ...prev, fotoPerfil: res.data.fotoPerfil }));
          setNotification("¡Foto actualizada con éxito!");
      } catch (err) {
          setError("Hubo un error al subir la foto. Intenta de nuevo.");
      }
  };

  const handleDescargarExcel = async () => {
    try {
      setNotification("Generando reporte Excel...");
      const res = await axios.get('/api/reportes/excel', { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Reporte_Clinica.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      setNotification("¡Excel descargado correctamente!");
    } catch (e) { 
      setError("Error al descargar el Excel."); 
    }
  };

  const handleSendChat = async () => {
    if (!userMsg.trim()) return;
    const msg = userMsg;
    setUserMsg(""); 
    setChatHistory(prev => [...prev, { sender: 'user', text: msg }]);

    const turnosContexto = turnos
        .filter(t => t.pacienteUsername === profile.username || t.cliente === usuarioNombre)
        .map(t => `Fecha: ${new Date(t.fechaHora).toLocaleDateString()} a las ${t.fechaHora.split('T')[1].substring(0,5)}, Médico: ${t.nombreMedico}, Motivo: ${t.descripcion}`)
        .join(' | ');
    const contextoOculto = `El paciente se llama ${usuarioNombre || 'Desconocido'}. Sus turnos son: ${turnosContexto || 'Ninguno registrado por ahora'}.`;

    const historialParaIA = chatHistory.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant', 
        content: m.text
    }));
    historialParaIA.push({ role: 'user', content: msg });

    try {
        const response = await fetch('https://turnos-backend-ns8s.onrender.com/chat/preguntar', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ historial: historialParaIA, contexto: contextoOculto }) 
        });
        if (!response.ok) throw new Error("Error en la respuesta del chat");
        const data = await response.json();
        const botReply = data.respuesta || "No entendí, pero aquí estoy.";
        setChatHistory(prev => [...prev, { sender: 'bot', text: botReply }]);
    } catch (e) {
        setChatHistory(prev => [...prev, { sender: 'bot', text: "Hubo un error de conexión, intenta de nuevo." }]);
    }
  };

  const handleDescargarPdf = async (id) => {
    try {
      setNotification("Generando PDF...");
      const res = await axios.get(`/turnos/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Turno_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setNotification("PDF descargado correctamente.");
    } catch (e) { setError("Error al descargar PDF."); }
  };

  const handleGuardarUsuario = async () => {
    try {
      if (formUser.id) await axios.put(`/usuario/${formUser.id}`, formUser);
      else await axios.post('/auth/register', formUser);
      setOpenUser(false);
      cargarDatosCompletos();
      setNotification("Usuario guardado.");
    } catch (err) { setError("Error al guardar."); }
  };

  const handleGuardarTurno = async () => {
    try {
      if(!form.fecha || !form.hora) {
          setError("Debe seleccionar una fecha y una hora.");
          return;
      }
      const fechaHoraFinal = `${form.fecha}T${form.hora}:00`;
      const payload = { ...form, fechaHora: fechaHoraFinal };
      if (form.id) await axios.put(`/turnos/${form.id}`, payload);
      else await axios.post('/turnos', payload);
      setOpen(false); 
      cargarDatosCompletos();
      setNotification("Turno guardado con éxito.");
    } catch (err) { 
      // 👇 Ahora leemos el error real que manda Java
      setError(typeof err.response?.data === 'string' ? err.response.data : "Error al procesar el turno."); 
    }
  };

  const handleSolicitarCodigo = async () => {
    try {
        await axios.post('/usuario/perfil/password/solicitar-codigo');
        setCodigoEnviado(true); 
        setNotification("Código enviado al email.");
    } catch (err) { setError("Error al solicitar código."); }
  };

  const handleConfirmarCambio = async () => {
    try {
        await axios.put('/usuario/perfil/password/confirmar', {
            currentPassword: passForm.currentPassword,
            newPassword: passForm.newPassword,
            verificationCode: codigoVerificacion
        });
        setNotification("¡Contraseña actualizada!");
        setOpenPassword(false);
    } catch (err) { setError("Código incorrecto."); }
  };

  const confirmLogout = () => {
    sessionStorage.clear();
    window.location.reload(); 
  };

  const abrirModalTurno = (turno = null) => {
    if (turno) {
      setForm({ ...turno, fecha: turno.fechaHora.split('T')[0], hora: turno.fechaHora.split('T')[1].substring(0, 5), diagnostico: turno.diagnostico || '', asistio: turno.asistio || false });
    } else {
      setForm({ id: null, especialidad: '', medicoId: '', descripcion: '', fecha: new Date().toISOString().split('T')[0], hora: '', diagnostico: '', asistio: false });
    }
    setOpen(true);
  };

  const clickEliminar = (id, type, name) => {
    setDeleteDialog({ open: true, id, type, text: `¿Estás seguro que deseas cancelar y eliminar ${name}?` });
  };

  const confirmarEliminacion = async () => {
    try {
        if (deleteDialog.type === 'USUARIO') await axios.delete(`/usuario/${deleteDialog.id}`);
        else await axios.delete(`/turnos/${deleteDialog.id}`);
        setNotification("Eliminado con éxito.");
        setDeleteDialog({ ...deleteDialog, open: false });
        cargarDatosCompletos();
    } catch (err) { setError("Error al eliminar."); }
  };

  const hoyStr = new Date().toDateString();
  const turnosHoyMedico = turnos.filter(t => new Date(t.fechaHora).toDateString() === hoyStr);
  const turnosProximosMedico = turnos.filter(t => new Date(t.fechaHora) > new Date() && new Date(t.fechaHora).toDateString() !== hoyStr).sort((a,b) => new Date(a.fechaHora) - new Date(b.fechaHora));

  const filtrarUsuarios = (lista) => lista.filter(u => (u.nombreCompleto || "").toLowerCase().includes(searchTerm.toLowerCase()) || (u.dni || "").includes(searchTerm));
  const usuariosPaginados = (lista) => {
    const filtrados = filtrarUsuarios(lista);
    return { data: filtrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), count: filtrados.length };
  };

  const eventosCalendario = turnos
    .filter(t => (rol === 'MEDICO' && t.medicoId === profile.id) || (rol === 'PACIENTE' && (t.pacienteUsername === profile.username || t.cliente === usuarioNombre)))
    .map(t => ({
      id: t.id,
      title: rol === 'MEDICO' ? `Paciente: ${t.cliente}` : `Dr. ${t.nombreMedico}`,
      start: new Date(t.fechaHora),
      end: new Date(new Date(t.fechaHora).getTime() + 30 * 60000), 
      resource: t
    }));

  if (!token) return <Login onLoginSuccess={(t, r) => { sessionStorage.setItem('jwt_token', t); sessionStorage.setItem('user_role', r); window.location.reload(); }} />;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', pb: 5 }}>
        <AppBar position="static" elevation={0} sx={{ backgroundColor: theme.palette.primary.main }}>
          <Toolbar>
            <LocalHospitalIcon sx={{ mr: 2, fontSize: 28 }} />
            <Typography variant="h6" sx={{ flexGrow: 1, letterSpacing: 1 }}>CLÍNICA INTEGRAL</Typography>
            
            <Tooltip title="Mi Perfil">
              <IconButton color="inherit" onClick={() => setOpenProfile(true)} sx={{ mr: 1 }}>
                {profile.fotoPerfil ? (
                  <Avatar src={profile.fotoPerfil} sx={{ width: 34, height: 34, border: '1px solid white' }} />
                ) : (
                  <AccountCircleIcon />
                )}
              </IconButton>
            </Tooltip>

            <Button color="inherit" onClick={() => setOpenLogout(true)} startIcon={<LogoutIcon />}>Salir</Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 5 }}>
          <Paper elevation={2} sx={{ p: isMobile ? 2 : 4 }}>
            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'} mb={2} gap={isMobile ? 2 : 0}>
               <div>
                  <Typography variant="h5" fontWeight="bold" color="primary">{rol === 'ADMIN' ? 'Panel de Gestión' : (rol === 'MEDICO' ? 'Dashboard Médico' : 'Mi Agenda de Salud')}</Typography>
                  <Typography variant="body2" color="text.secondary">Bienvenido, <strong>{usuarioNombre}</strong></Typography>
               </div>
              {rol === 'PACIENTE' && <Button variant="contained" fullWidth={isMobile} color="secondary" size="large" startIcon={<AddCircleIcon />} onClick={() => abrirModalTurno()}>Nuevo Turno</Button>}
              {rol === 'ADMIN' && adminTab !== 0 && <Button variant="contained" fullWidth={isMobile} color="secondary" startIcon={<PersonAddIcon />} onClick={() => { setFormUser({ id: null, username: '', password: '', rol: 'MEDICO', nombreCompleto: '', dni: '', telefono: '', especialidad: '' }); setOpenUser(true); }}>Nuevo Usuario</Button>}
            </Box>

            {rol === 'ADMIN' && (
                 <Tabs value={adminTab} onChange={(e,v) => { setAdminTab(v); setPage(0); }} variant={isMobile ? "scrollable" : "standard"} scrollButtons="auto" sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Tab icon={<DashboardIcon/>} label="Dashboard" iconPosition="start" />
                    <Tab icon={<GroupIcon/>} label="Pacientes" iconPosition="start" />
                    <Tab icon={<MedicalServicesIcon/>} label="Médicos" iconPosition="start" />
                </Tabs>
            )}

            {rol === 'PACIENTE' && (
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant={isMobile ? "scrollable" : "standard"} scrollButtons="auto" sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Tab icon={<CalendarMonthIcon/>} label="Próximos" iconPosition="start" />
                    <Tab icon={<HistoryIcon/>} label="Historial" iconPosition="start" />
                    <Tab icon={<EventAvailableIcon/>} label="Calendario" iconPosition="start" />
                </Tabs>
            )}

            {rol === 'MEDICO' && (
                <Tabs value={medicoTab} onChange={(e, v) => setMedicoTab(v)} variant={isMobile ? "scrollable" : "standard"} scrollButtons="auto" sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Tab icon={<HistoryIcon/>} label="Agenda Lista" iconPosition="start" />
                    <Tab icon={<CalendarMonthIcon/>} label="Calendario" iconPosition="start" />
                </Tabs>
            )}

            {cargando ? <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box> : (
              <>
                {rol === 'ADMIN' && adminTab === 0 && (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
                        <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DashboardIcon /> Resumen Estadístico
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="success" 
                            startIcon={<DownloadIcon />} 
                            onClick={handleDescargarExcel}
                            sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' }, borderRadius: 2, textTransform: 'none', boxShadow: 2 }}
                        >
                            Exportar Reporte Excel
                        </Button>
                    </Box>

                    <Grid container spacing={3} mb={4}>
                      <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: 'white', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', p: 2 }}>
                          <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1565c0', width: 60, height: 60, mr: 2 }}>
                            <GroupIcon sx={{ fontSize: 32 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary" fontWeight="bold">TOTAL PACIENTES</Typography>
                            <Typography variant="h4" fontWeight="bold" color="text.primary">{usuarios.filter(u=>u.rol==='PACIENTE').length}</Typography>
                          </Box>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: 'white', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', p: 2 }}>
                          <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', width: 60, height: 60, mr: 2 }}>
                            <MedicalServicesIcon sx={{ fontSize: 32 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary" fontWeight="bold">TOTAL MÉDICOS</Typography>
                            <Typography variant="h4" fontWeight="bold" color="text.primary">{medicos.length}</Typography>
                          </Box>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: 'white', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', p: 2 }}>
                          <Avatar sx={{ bgcolor: '#fff3e0', color: '#e65100', width: 60, height: 60, mr: 2 }}>
                            <EventAvailableIcon sx={{ fontSize: 32 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary" fontWeight="bold">TURNOS HISTÓRICOS</Typography>
                            <Typography variant="h4" fontWeight="bold" color="text.primary">{turnos.length}</Typography>
                          </Box>
                        </Card>
                      </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: 350 }}>
                          <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">Turnos por Especialidad</Typography>
                          <Divider sx={{ mb: 2 }} />
                          <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie data={stats.especialidades} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {stats.especialidades.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: 350 }}>
                          <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">Asistencia Mensual</Typography>
                          <Divider sx={{ mb: 2 }} />
                          <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={stats.asistencia}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <RechartsTooltip/>
                                <Bar dataKey="value" fill="#00897b" radius={[6,6,0,0]} barSize={40}/>
                            </BarChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {rol === 'ADMIN' && adminTab !== 0 && (
                  <>
                    <TextField fullWidth placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ mb: 2 }} size="small" InputProps={{ startAdornment: <SearchIcon sx={{mr:1}}/> }} />
                    {isMobile ? (
                      <Stack spacing={2}>
                        {usuariosPaginados(adminTab === 1 ? usuarios.filter(u=>u.rol==='PACIENTE') : medicos).data.map(u => (
                          <Card key={u.id} variant="outlined" sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ pb: 1 }}>
                              <Typography variant="h6" color="primary">{u.nombreCompleto}</Typography>
                              <Typography variant="body2"><strong>DNI:</strong> {u.dni}</Typography>
                              <Typography variant="body2"><strong>Email:</strong> {u.username}</Typography>
                            </CardContent>
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                              <IconButton color="primary" onClick={() => { setFormUser(u); setOpenUser(true); }}><EditIcon/></IconButton>
                              <IconButton color="error" onClick={() => clickEliminar(u.id, 'USUARIO', u.nombreCompleto)}><DeleteIcon/></IconButton>
                            </Box>
                          </Card>
                        ))}
                      </Stack>
                    ) : (
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead sx={{ bgcolor: adminTab === 1 ? '#e3f2fd' : '#e0f2f1' }}>
                            <TableRow><TableCell>Nombre</TableCell><TableCell>DNI</TableCell><TableCell>Email</TableCell><TableCell align="center">Acciones</TableCell></TableRow>
                          </TableHead>
                          <TableBody>
                            {usuariosPaginados(adminTab === 1 ? usuarios.filter(u=>u.rol==='PACIENTE') : medicos).data.map(u => (
                              <TableRow key={u.id}><TableCell>{u.nombreCompleto}</TableCell><TableCell>{u.dni}</TableCell><TableCell>{u.username}</TableCell><TableCell align="center"><IconButton color="primary" onClick={() => { setFormUser(u); setOpenUser(true); }}><EditIcon/></IconButton><IconButton color="error" onClick={() => clickEliminar(u.id, 'USUARIO', u.nombreCompleto)}><DeleteIcon/></IconButton></TableCell></TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                    <TablePagination component="div" count={usuariosPaginados(adminTab === 1 ? usuarios.filter(u=>u.rol==='PACIENTE') : medicos).count} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))} />
                  </>
                )}

                {rol === 'MEDICO' && medicoTab === 0 && (
                  <Stack spacing={4}>
                    <Box>
                      <Typography variant="h6" color="primary" gutterBottom sx={{display:'flex', alignItems:'center', gap:1}}><HistoryIcon/> Pacientes de Hoy</Typography>
                      {isMobile ? (
                        <Stack spacing={2}>
                          {turnosHoyMedico.length === 0 ? <Typography align="center" sx={{py:3}}>Sin pacientes hoy.</Typography> : turnosHoyMedico.map(t=>(
                            <Card key={t.id} variant="outlined" sx={{ borderRadius: 3 }}>
                              <CardContent sx={{ pb: 1 }}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                  <Typography variant="subtitle1" fontWeight="bold" color="secondary">{t.fechaHora.split('T')[1].substring(0,5)} hs</Typography>
                                  <Chip label={t.asistio ? "Atendido" : "Pendiente"} color={t.asistio ? "success" : "default"} size="small"/>
                                </Box>
                                <Typography variant="h6">{t.cliente}</Typography>
                                <Typography variant="body2" color="text.secondary">Motivo: {t.descripcion}</Typography>
                              </CardContent>
                              <Divider />
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                                <Button variant="contained" size="small" onClick={() => abrirModalTurno(t)}>Atender</Button>
                              </Box>
                            </Card>
                          ))}
                        </Stack>
                      ) : (
                        <TableContainer component={Paper} variant="outlined">
                          <Table><TableHead sx={{bgcolor:'#f5f5f5'}}><TableRow><TableCell>Hora</TableCell><TableCell>Paciente</TableCell><TableCell>Motivo</TableCell><TableCell>Estado</TableCell><TableCell align="center">Acción</TableCell></TableRow></TableHead>
                          <TableBody>{turnosHoyMedico.length === 0 ? <TableRow><TableCell colSpan={5} align="center">Sin pacientes hoy.</TableCell></TableRow> : turnosHoyMedico.map(t=>(<TableRow key={t.id}><TableCell><strong>{t.fechaHora.split('T')[1].substring(0,5)}</strong></TableCell><TableCell>{t.cliente}</TableCell><TableCell>{t.descripcion}</TableCell><TableCell><Chip label={t.asistio ? "Atendido" : "Pendiente"} color={t.asistio ? "success" : "default"} size="small"/></TableCell><TableCell align="center"><Button variant="contained" size="small" onClick={() => abrirModalTurno(t)}>Atender</Button></TableCell></TableRow>))}</TableBody></Table>
                        </TableContainer>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="h6" color="text.secondary" gutterBottom sx={{display:'flex', alignItems:'center', gap:1}}><CalendarMonthIcon/> Agenda Próxima</Typography>
                      {isMobile ? (
                        <Stack spacing={2}>
                          {turnosProximosMedico.length === 0 ? <Typography align="center" sx={{py:3}}>Sin turnos próximos.</Typography> : turnosProximosMedico.map(t=>(
                            <Card key={t.id} variant="outlined" sx={{ borderRadius: 3 }}>
                              <CardContent>
                                <Typography variant="subtitle2" color="primary">{new Date(t.fechaHora).toLocaleDateString()} - {t.fechaHora.split('T')[1].substring(0,5)} hs</Typography>
                                <Typography variant="h6">{t.cliente}</Typography>
                                <Typography variant="body2" color="text.secondary">{t.descripcion}</Typography>
                              </CardContent>
                            </Card>
                          ))}
                        </Stack>
                      ) : (
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small"><TableHead sx={{bgcolor:'#fafafa'}}><TableRow><TableCell>Fecha</TableCell><TableCell>Hora</TableCell><TableCell>Paciente</TableCell><TableCell>Motivo</TableCell></TableRow></TableHead>
                          <TableBody>{turnosProximosMedico.length === 0 ? <TableRow><TableCell colSpan={4} align="center">Sin turnos próximos.</TableCell></TableRow> : turnosProximosMedico.map(t=>(<TableRow key={t.id} hover><TableCell>{new Date(t.fechaHora).toLocaleDateString()}</TableCell><TableCell>{t.fechaHora.split('T')[1].substring(0,5)}</TableCell><TableCell>{t.cliente}</TableCell><TableCell>{t.descripcion}</TableCell></TableRow>))}</TableBody></Table>
                        </TableContainer>
                      )}
                    </Box>
                  </Stack>
                )}

                {((rol === 'MEDICO' && medicoTab === 1) || (rol === 'PACIENTE' && tabValue === 2)) && (
                   <Paper sx={{ p: isMobile ? 1 : 2, height: isMobile ? '500px' : '600px', borderRadius: 4, overflowX: 'auto' }} variant="outlined">
                     <Calendar
                        localizer={localizer}
                        events={eventosCalendario}
                        startAccessor="start"
                        endAccessor="end"
                        culture="es"
                        date={calendarDate}
                        onNavigate={(newDate) => setCalendarDate(newDate)}
                        view={calendarView}
                        onView={(newView) => setCalendarView(newView)}
                        messages={{
                          next: "Siguiente",
                          previous: "Anterior",
                          today: "Hoy",
                          month: "Mes",
                          week: "Semana",
                          day: "Día",
                          agenda: "Agenda",
                          noEventsInRange: "No hay turnos en este rango."
                        }}
                        onSelectEvent={(event) => abrirModalTurno(event.resource)}
                        eventPropGetter={(event) => {
                           const backgroundColor = new Date(event.start) < new Date() ? '#9e9e9e' : '#00897b';
                           return { style: { backgroundColor, borderRadius: '6px', color: 'white', border: 'none' } };
                        }}
                     />
                   </Paper>
                )}

                {rol === 'PACIENTE' && tabValue !== 2 && (
                  <>
                    {isMobile ? (
                      <Stack spacing={2}>
                        {getTurnosPaciente().length === 0 ? <Typography align="center" sx={{py:3}}>Sin turnos registrados.</Typography> : getTurnosPaciente().map(t=>(
                          <Card key={t.id} variant="outlined" sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ pb: 1 }}>
                              <Typography variant="subtitle2" color="secondary" fontWeight="bold">{new Date(t.fechaHora).toLocaleString()}</Typography>
                              <Typography variant="h6">Dr. {t.nombreMedico}</Typography>
                              <Typography variant="body2" color="text.secondary">Motivo: {t.descripcion}</Typography>
                            </CardContent>
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                              {t.asistio && (
                                <IconButton color="secondary" onClick={() => handleDescargarPdf(t.id)}>
                                  <PictureAsPdfIcon/>
                                </IconButton>
                              )}
                              <IconButton color="primary" onClick={() => abrirModalTurno(t)}><EditIcon/></IconButton>
                              <IconButton color="error" onClick={() => clickEliminar(t.id, 'TURNO', 'este turno')}><DeleteIcon/></IconButton>
                            </Box>
                          </Card>
                        ))}
                      </Stack>
                    ) : (
                      <TableContainer component={Paper} variant="outlined">
                        <Table><TableHead sx={{bgcolor:'#f5f5f5'}}><TableRow><TableCell>Fecha/Hora</TableCell><TableCell>Médico</TableCell><TableCell>Motivo</TableCell><TableCell align="center">Acciones</TableCell></TableRow></TableHead>
                        <TableBody>{getTurnosPaciente().map(t=>(<TableRow key={t.id}><TableCell>{new Date(t.fechaHora).toLocaleString()}</TableCell><TableCell>{t.nombreMedico}</TableCell><TableCell>{t.descripcion}</TableCell><TableCell align="center">
                              {t.asistio && (
                                <IconButton color="secondary" onClick={() => handleDescargarPdf(t.id)}>
                                  <PictureAsPdfIcon/>
                                </IconButton>
                              )}
                              <IconButton color="primary" onClick={() => abrirModalTurno(t)}><EditIcon/></IconButton>
                              <IconButton color="error" onClick={() => clickEliminar(t.id, 'TURNO', 'este turno')}><DeleteIcon/></IconButton>
                          </TableCell></TableRow>))}</TableBody></Table>
                      </TableContainer>
                    )}
                  </>
                )}
              </>
            )}
          </Paper>
        </Container>

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth={rol === 'MEDICO' ? 'md' : 'sm'}>
          <DialogTitle sx={{bgcolor:'primary.main', color:'white'}}>
            {rol === 'MEDICO' ? `Historia Clínica - ${form.cliente}` : 'Gestionar Turno'}
          </DialogTitle>
          <DialogContent sx={{pt:3}}>
            {rol === 'MEDICO' ? (
              <Grid container spacing={3} sx={{mt: 0}}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" color="primary" gutterBottom>Consulta Actual</Typography>
                    <Stack spacing={2}>
                        <TextField label="Motivo del paciente" disabled fullWidth value={form.descripcion || ''} />
                        <TextField label="Diagnóstico y Notas de Evolución" multiline rows={6} fullWidth value={form.diagnostico || ''} onChange={(e) => setForm({...form, diagnostico: e.target.value})} placeholder="Escriba aquí los detalles de la atención de hoy..." />
                        <FormControlLabel control={<Switch checked={form.asistio} onChange={(e) => setForm({...form, asistio: e.target.checked})}/>} label="El paciente asistió a la consulta" />
                    </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" color="primary" gutterBottom>Historial Previo</Typography>
                    <Paper variant="outlined" sx={{ height: '280px', overflowY: 'auto', p: 2, bgcolor: '#fafafa' }}>
                        {getHistorialClinico().length === 0 ? (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{mt: 4}}>
                                No hay registros clínicos previos guardados para este paciente.
                            </Typography>
                        ) : (
                            getHistorialClinico().map(h => (
                                <Box key={h.id} sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="secondary">
                                        {new Date(h.fechaHora).toLocaleDateString()} - Dr. {h.nombreMedico}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 0.5, color: '#546e7a' }}>
                                        Motivo: {h.descripcion}
                                    </Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {h.diagnostico}
                                    </Typography>
                                    <Divider sx={{ mt: 1.5 }} />
                                </Box>
                            ))
                        )}
                    </Paper>
                </Grid>
              </Grid>
            ) : (
              <Stack spacing={2} sx={{mt:1}}>
                <FormControl fullWidth><InputLabel>Especialidad</InputLabel><Select value={form.especialidad} label="Especialidad" onChange={(e) => handleChangeFechaMedico('especialidad', e.target.value)}>{listaEspecialidades.map(esp => <MenuItem key={esp} value={esp}>{esp}</MenuItem>)}</Select></FormControl>
                <FormControl fullWidth disabled={!form.especialidad}><InputLabel>Médico</InputLabel><Select value={form.medicoId} label="Médico" onChange={(e) => handleChangeFechaMedico('medicoId', e.target.value)}>{medicos.filter(m => m.especialidad === form.especialidad).map(m => <MenuItem key={m.id} value={m.id}>{m.nombreCompleto}</MenuItem>)}</Select></FormControl>
                
                <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                  <TextField 
                      label="Fecha"
                      type="date" 
                      fullWidth 
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: new Date().toISOString().split("T")[0] }}
                      value={form.fecha} 
                      onChange={(e) => handleChangeFechaMedico('fecha', e.target.value)} 
                  />
                  
                  <FormControl fullWidth disabled={!form.fecha || !form.medicoId}>
                      <InputLabel>Hora</InputLabel>
                      <Select 
                          value={form.hora} 
                          label="Hora" 
                          onChange={(e) => setForm({...form, hora: e.target.value})}
                      >
                          {generarHorariosDisponibles().length === 0 ? (
                              <MenuItem disabled value="">Sin horarios libres</MenuItem>
                          ) : (
                              generarHorariosDisponibles().map(h => (
                                  <MenuItem key={h} value={h}>{h} hs</MenuItem>
                              ))
                          )}
                      </Select>
                  </FormControl>
                </Stack>

                <TextField label="Motivo" fullWidth value={form.descripcion} onChange={(e) => setForm({...form, descripcion: e.target.value})} />
              </Stack>
            )}
          </DialogContent>
          <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={handleGuardarTurno}>Guardar</Button></DialogActions>
        </Dialog>

        <Dialog open={openUser} onClose={() => setOpenUser(false)} fullWidth maxWidth="sm">
            <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white' }}>Gestionar Usuario</DialogTitle>
            <DialogContent sx={{ pt: 3 }}><Stack spacing={2} sx={{ mt: 1 }}>
                <FormControl fullWidth><InputLabel>Rol</InputLabel><Select value={formUser.rol} label="Rol" onChange={(e) => setFormUser({...formUser, rol: e.target.value})}><MenuItem value="PACIENTE">Paciente</MenuItem><MenuItem value="MEDICO">Médico</MenuItem><MenuItem value="ADMIN">Admin</MenuItem></Select></FormControl>
                {formUser.rol === 'MEDICO' && (<FormControl fullWidth><InputLabel>Especialidad</InputLabel><Select value={formUser.especialidad} label="Especialidad" onChange={(e) => setFormUser({...formUser, especialidad: e.target.value})}>{listaEspecialidades.map(esp => <MenuItem key={esp} value={esp}>{esp}</MenuItem>)}</Select></FormControl>)}
                <TextField label="Email" fullWidth value={formUser.username} onChange={(e) => setFormUser({...formUser, username: e.target.value})} />
                {!formUser.id && (<TextField label="Password" type="password" fullWidth value={formUser.password} onChange={(e) => setFormUser({...formUser, password: e.target.value})} />)}
                <TextField label="Nombre Completo" fullWidth value={formUser.nombreCompleto} onChange={(e) => setFormUser({...formUser, nombreCompleto: e.target.value})} />
                <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                  <TextField label="DNI" fullWidth value={formUser.dni} onChange={(e) => setFormUser({...formUser, dni: e.target.value})} />
                  <TextField label="Teléfono" fullWidth value={formUser.telefono} onChange={(e) => setFormUser({...formUser, telefono: e.target.value})} />
                </Stack>
            </Stack></DialogContent>
            <DialogActions><Button onClick={() => setOpenUser(false)}>Cancelar</Button><Button variant="contained" color="secondary" onClick={handleGuardarUsuario}>Guardar</Button></DialogActions>
        </Dialog>

        <Dialog open={openProfile} onClose={() => setOpenProfile(false)} maxWidth="xs" fullWidth>
            <Card>
                <Box sx={{ bgcolor: 'primary.dark', height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input
                        accept="image/jpeg, image/png, image/webp"
                        style={{ display: 'none' }}
                        id="upload-avatar"
                        type="file"
                        onChange={handleSubirFoto}
                    />
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            <label htmlFor="upload-avatar" style={{ cursor: 'pointer', display: 'flex' }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', border: '2px solid white', '&:hover': { bgcolor: 'secondary.dark' } }}>
                                    <PhotoCameraIcon sx={{ fontSize: 18 }} />
                                </Avatar>
                            </label>
                        }
                    >
                        <Avatar 
                            src={profile.fotoPerfil || ''} 
                            onClick={() => { if (profile.fotoPerfil) setOpenImageModal(true); }}
                            sx={{ width: 90, height: 90, bgcolor: 'white', color: 'primary.main', fontSize: 40, border: '4px solid white', cursor: profile.fotoPerfil ? 'zoom-in' : 'default', '&:hover': { opacity: profile.fotoPerfil ? 0.8 : 1 }, boxShadow: 3 }}
                        >
                            {!profile.fotoPerfil && profile.nombreCompleto?.charAt(0)}
                        </Avatar>
                    </Badge>
                </Box>
                <CardContent sx={{ pt: 4 }}>
                    <Typography variant="h6" align="center">{profile.nombreCompleto}</Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2, fontStyle: 'italic' }}>
                        {profile.fotoPerfil ? "Toca tu foto para verla en grande" : "Sube una foto desde el ícono de cámara"}
                    </Typography>
                    <Stack spacing={2}>
                        <TextField label="Nombre" size="small" fullWidth value={profile.nombreCompleto || ''} onChange={(e) => setProfile({...profile, nombreCompleto: e.target.value})} />
                        <TextField label="DNI" size="small" fullWidth value={profile.dni || ''} onChange={(e) => setProfile({...profile, dni: e.target.value})} />
                        <Button fullWidth startIcon={<KeyIcon />} onClick={() => { setOpenProfile(false); setOpenPassword(true); }} sx={{ mt: 1, color: 'secondary.main' }}>Cambiar Clave</Button>
                    </Stack>
                </CardContent>
                <DialogActions sx={{p: 2, justifyContent: 'center'}}><Button onClick={() => setOpenProfile(false)}>Cerrar</Button><Button variant="contained" onClick={async () => { await axios.put('/usuario/perfil', profile); setNotification("Perfil actualizado"); setOpenProfile(false); cargarDatosCompletos(); }}>Actualizar</Button></DialogActions>
            </Card>
        </Dialog>

        <Dialog open={openImageModal} onClose={() => setOpenImageModal(false)} maxWidth="sm" fullWidth>
            <Box sx={{ position: 'relative', bgcolor: '#000', textAlign: 'center' }}>
                <IconButton onClick={() => setOpenImageModal(false)} sx={{ position: 'absolute', top: 8, right: 8, color: 'white', bgcolor: 'rgba(0,0,0,0.4)', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}>
                    <CloseIcon />
                </IconButton>
                <img 
                    src={profile.fotoPerfil} 
                    alt="Perfil Ampliado" 
                    style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }} 
                />
            </Box>
        </Dialog>

        <Dialog open={openPassword} onClose={() => setOpenPassword(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', textAlign:'center' }}>Seguridad</DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Stack spacing={2}>
                    <TextField label="Clave Actual" type="password" fullWidth value={passForm.currentPassword} onChange={(e) => setPassForm({...passForm, currentPassword: e.target.value})} />
                    <TextField label="Nueva Clave" type="password" fullWidth value={passForm.newPassword} onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})} />
                    {codigoEnviado && <TextField label="Código Email" fullWidth value={codigoVerificacion} onChange={(e) => setCodigoVerificacion(e.target.value)} />}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, flexDirection: 'column', gap: 1 }}>
                {!codigoEnviado ? <Button variant="contained" fullWidth onClick={handleSolicitarCodigo}>Solicitar Código</Button> : <Button variant="contained" color="success" fullWidth onClick={handleConfirmarCambio}>Confirmar Cambio</Button>}
                <Button onClick={() => setOpenPassword(false)} fullWidth>Cancelar</Button>
            </DialogActions>
        </Dialog>

        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}>
            <DialogTitle><WarningIcon color="error"/> Confirmar Eliminación</DialogTitle>
            <DialogContent><DialogContentText>{deleteDialog.text}</DialogContentText></DialogContent>
            <DialogActions><Button onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}>Cancelar</Button><Button onClick={confirmarEliminacion} color="error" variant="contained">Eliminar</Button></DialogActions>
        </Dialog>

        <Dialog open={openLogout} onClose={() => setOpenLogout(false)}><DialogTitle>¿Cerrar sesión?</DialogTitle><DialogActions><Button onClick={() => setOpenLogout(false)}>No</Button><Button onClick={confirmLogout} color="error" variant="contained">Salir</Button></DialogActions></Dialog>
        
        <IconButton 
            onClick={() => setChatOpen(!chatOpen)}
            sx={{ position: 'fixed', bottom: 30, right: isMobile ? 20 : 30, bgcolor: 'primary.main', color: 'white', '&:hover': {bgcolor: 'primary.dark'}, width: 60, height: 60, boxShadow: 3, zIndex: 1000 }}
        >
            {chatOpen ? <CloseIcon /> : <ChatIcon />}
        </IconButton>

        {chatOpen && (
            <Paper sx={{ position: 'fixed', bottom: 100, right: isMobile ? 10 : 30, left: isMobile ? 10 : 'auto', width: isMobile ? 'auto' : 320, height: 450, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 5, borderRadius: 4, zIndex: 1000 }}>
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold">Asistente Virtual</Typography>
                    <LocalHospitalIcon fontSize="small"/>
                </Box>
                <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#f9f9f9' }}>
                    {chatHistory.map((m, i) => (
                        <Box key={i} sx={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', bgcolor: m.sender === 'user' ? 'primary.main' : 'white', color: m.sender === 'user' ? 'white' : 'text.primary', p: 1.5, borderRadius: m.sender === 'user' ? '15px 15px 0 15px' : '15px 15px 15px 0', maxWidth: '85%', boxShadow: 1 }}>
                            <Typography variant="body2">{m.text}</Typography>
                        </Box>
                    ))}
                    <div ref={chatEndRef} />
                </Box>
                <Divider />
                <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', gap: 1 }}>
                    <TextField fullWidth size="small" placeholder="Escribe tu duda..." value={userMsg} onChange={(e) => setUserMsg(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendChat()} variant="outlined" />
                    <IconButton onClick={handleSendChat} color="primary" disabled={!userMsg.trim()}><SendIcon /></IconButton>
                </Box>
            </Paper>
        )}

        <Snackbar open={!!notification} autoHideDuration={4000} onClose={() => setNotification(null)} message={notification} />
      </Box>
    </ThemeProvider>
  );
}

export default App;