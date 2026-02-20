import { useState, useEffect } from 'react';
import axios from './config/axiosConfig'; 
import { 
  Box, Button, Container, TextField, Typography, Paper, 
  Alert, InputAdornment, CssBaseline, ThemeProvider, createTheme, Fade, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions 
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';

const theme = createTheme({
  palette: {
    primary: { main: '#00897b', contrastText: '#fff' },
    secondary: { main: '#e64a19' },
    background: { default: '#eceff1' }
  }
});

function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  
  // PASSWORD VISIBILITY (LOGIN)
  const [showPassword, setShowPassword] = useState(false);
  
  // PASSWORD VISIBILITY (RESET) <--- NUEVOS ESTADOS
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  // STATES ERROR/SUCCESS
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // --- LOGICA DE RECUPERACIÓN ---
  const [openForgot, setOpenForgot] = useState(false); 
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState(null); 
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
        setResetToken(token); 
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      if (resetToken) {
          // --- MODO RESET PASSWORD ---
          if(newPass !== confirmPass) { setError("Las contraseñas no coinciden"); return; }
          await axios.post('http://localhost:8080/auth/reset-password', { token: resetToken, password: newPass });
          setSuccessMsg("Contraseña cambiada con éxito. Ahora inicia sesión.");
          setTimeout(() => {
              window.history.replaceState({}, document.title, "/"); 
              setResetToken(null);
          }, 3000);

      } else if (isRegistering) {
        // --- MODO REGISTRO ---
        await axios.post('http://localhost:8080/auth/register', { username: email, password, nombreCompleto: nombre, dni, telefono, rol: 'PACIENTE' });
        setSuccessMsg("¡Cuenta creada! Por favor, inicia sesión.");
        setIsRegistering(false); 
        setPassword(''); 
        
      } else {
        // --- MODO LOGIN ---
        const response = await axios.post('http://localhost:8080/auth/login', { username: email, password });
        onLoginSuccess(response.data.token, response.data.rol);
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Ocurrió un error. Verifica los datos.");
    }
  };

  const handleSendForgot = async () => {
      try {
          await axios.post('http://localhost:8080/auth/forgot-password', { email: forgotEmail });
          setOpenForgot(false);
          setSuccessMsg("Si el correo existe, recibirás un enlace para recuperar tu cuenta.");
      } catch (err) {
          setOpenForgot(false);
          setSuccessMsg("Si el correo existe, recibirás un enlace para recuperar tu cuenta."); 
      }
  };

  // --- VISTA: RESET PASSWORD (SI HAY TOKEN) ---
  if (resetToken) {
      return (
        <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 4, width: '100%' }}>
                <Box sx={{ mb: 2, bgcolor: 'secondary.main', p: 2, borderRadius: '50%' }}><KeyIcon sx={{ fontSize: 40, color: 'white' }} /></Box>
                <Typography component="h1" variant="h5" fontWeight="bold">Restablecer Contraseña</Typography>
                {error && <Alert severity="error" sx={{ width: '100%', my: 2 }}>{error}</Alert>}
                {successMsg && <Alert severity="success" sx={{ width: '100%', my: 2 }}>{successMsg}</Alert>}
                {!successMsg && (
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        
                        {/* NUEVA CONTRASEÑA CON OJITO */}
                        <TextField 
                            margin="normal" fullWidth label="Nueva Contraseña" 
                            type={showNewPass ? "text" : "password"} required 
                            value={newPass} onChange={(e) => setNewPass(e.target.value)} 
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowNewPass(!showNewPass)} edge="end">
                                            {showNewPass ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        
                        {/* CONFIRMAR CONTRASEÑA CON OJITO */}
                        <TextField 
                            margin="normal" fullWidth label="Confirmar Contraseña" 
                            type={showConfirmPass ? "text" : "password"} required 
                            value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} 
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirmPass(!showConfirmPass)} edge="end">
                                            {showConfirmPass ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2 }}>Cambiar Contraseña</Button>
                    </Box>
                )}
                {successMsg && <Button fullWidth onClick={() => { setResetToken(null); window.history.replaceState({}, document.title, "/"); }}>Volver al Login</Button>}
            </Paper>
        </Container>
        </ThemeProvider>
      );
  }

  // --- VISTA: LOGIN / REGISTER ---
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Fade in={true} timeout={800}>
          <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 4, width: '100%' }}>
            
            <Box sx={{ mb: 2, bgcolor: isRegistering ? 'secondary.main' : 'primary.main', p: 2, borderRadius: '50%' }}>
              <LocalHospitalIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            
            <Typography component="h1" variant="h5" fontWeight="bold" color={isRegistering ? 'secondary' : 'primary'}>
              {isRegistering ? "Registro de Paciente" : "Clínica Integral"}
            </Typography>

            {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{successMsg}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              
              <TextField margin="normal" fullWidth label="Email / Usuario" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }} />
              
              <TextField margin="normal" fullWidth label="Contraseña" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                InputProps={{ 
                    startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                    endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>)
                }}
              />

              {isRegistering && (
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField fullWidth label="Nombre Completo" required size="small" value={nombre} onChange={(e) => setNombre(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> }} />
                    <TextField fullWidth label="DNI" required size="small" value={dni} onChange={(e) => setDni(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon color="action" /></InputAdornment> }} />
                    <TextField fullWidth label="Teléfono" required size="small" value={telefono} onChange={(e) => setTelefono(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment> }} />
                </Stack>
              )}
              
              <Button type="submit" fullWidth variant="contained" size="large" color={isRegistering ? "secondary" : "primary"} sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }} startIcon={isRegistering ? <AppRegistrationIcon /> : <LoginIcon />}>
                {isRegistering ? "REGISTRARME" : "INGRESAR"}
              </Button>

              {!isRegistering && (
                  <Button fullWidth size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => setOpenForgot(true)}>
                      ¿Olvidaste tu contraseña?
                  </Button>
              )}

              <Button fullWidth onClick={() => setIsRegistering(!isRegistering)}>
                 {isRegistering ? "¿Ya tienes cuenta? Inicia Sesión" : "¿Nuevo paciente? Regístrate aquí"}
              </Button>

            </Box>
          </Paper>
        </Fade>

        <Dialog open={openForgot} onClose={() => setOpenForgot(false)}>
            <DialogTitle>Recuperar Contraseña</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{mb: 2}}>
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu clave.
                </DialogContentText>
                <TextField autoFocus margin="dense" label="Correo Electrónico" type="email" fullWidth variant="outlined" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenForgot(false)}>Cancelar</Button>
                <Button onClick={handleSendForgot} variant="contained">Enviar Enlace</Button>
            </DialogActions>
        </Dialog>

      </Container>
    </ThemeProvider>
  );
}

export default Login;