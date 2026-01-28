import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, TextField, Button, Typography, Paper, 
    Container, InputAdornment, IconButton, Alert, CircularProgress 
} from '@mui/material';
import { 
    Email as EmailIcon, 
    Lock as LockIcon, 
    Visibility, VisibilityOff, 
    Login as LoginIcon 
} from '@mui/icons-material';
import { login } from '../../api/auth.api';
import { saveAuth } from '../../auth/auth.storage';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await login({ email, password });
            saveAuth(res);

            if (res.user.role === 'ADMIN') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box 
            sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', // Matches MUI Primary
                p: 2 
            }}
        >
            <Container maxWidth="xs">
                <Paper 
                    elevation={6} 
                    sx={{ 
                        p: 4, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        borderRadius: 3
                    }}
                >
                    <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                        DEXA
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mb={3}>
                        Please enter your credentials to continue
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={onSubmit} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Email Address"
                            variant="outlined"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            startIcon={!loading && <LoginIcon />}
                            sx={{ 
                                mt: 3, 
                                py: 1.5, 
                                borderRadius: 2,
                                fontWeight: 'bold' 
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                    </Box>
                </Paper>
                
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'white' }}>
                    © {new Date().getFullYear()} Dexa Workforce Management
                </Typography>
            </Container>
        </Box>
    );
}
