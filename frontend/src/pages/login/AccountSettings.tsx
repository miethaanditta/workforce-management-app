import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Container, Stack, Alert } from '@mui/material';
import { Lock as LockIcon, Save as SaveIcon } from '@mui/icons-material';
import { updatePassword } from '../../api/auth.api';
import { getUser } from '../../auth/auth.storage';

export default function AccountSettings() {
    const user = getUser();
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return setStatus({ type: 'error', msg: 'New passwords do not match' });
        }

        setLoading(true);
        setStatus(null);
        try {
            await updatePassword(user!.id, passwords.new);
            setStatus({ type: 'success', msg: 'Password updated successfully!' });
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to update password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Stack spacing={1} alignItems="center" mb={4}>
                    <LockIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h5" fontWeight={700}>Security Settings</Typography>
                    <Typography variant="body2" color="textSecondary">
                        Update your password to keep your account secure
                    </Typography>
                </Stack>

                {status && (
                    <Alert severity={status.type} sx={{ mb: 3 }}>{status.msg}</Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <TextField
                            label="New Password"
                            type="password"
                            fullWidth
                            required
                            value={passwords.new}
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        />
                        <TextField
                            label="Confirm New Password"
                            type="password"
                            fullWidth
                            required
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={<SaveIcon />}
                            disabled={loading}
                            sx={{ py: 1.5, fontWeight: 'bold' }}
                        >
                            {loading ? 'Updating...' : 'Save Password'}
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
}
