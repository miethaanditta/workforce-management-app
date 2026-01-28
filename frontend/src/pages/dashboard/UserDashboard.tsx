import { Box, Typography, Button, CircularProgress, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getUser } from "../../auth/auth.storage";
import LiveClock from '../../components/LiveClock';
import { useEffect, useState } from 'react';
import { findOneStaff, type StaffDetailResponse } from '../../api/employee.api';
import { clockIn, clockOut, findTodayAttendance, type AttendanceResponse } from '../../api/attendance.api';
import LogoutIcon from '@mui/icons-material/Logout';

export default function UserDashboard() {
    const user = getUser();
    const [staff, setStaff] = useState<StaffDetailResponse | null>(null);
    const [attendance, setAttendance] = useState<AttendanceResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchStaffData = async () => {
            if (user?.id) {
                try {
                    setLoading(true);
                    const staffRes = await findOneStaff(user.id);
                    setStaff(staffRes);

                    if (staffRes.id) {
                        const attRes = await findTodayAttendance(staffRes.id);
                        setAttendance(attRes);
                    }
                } catch (error) {
                    console.error("Error loading dashboard:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchStaffData();
    }, [user?.id]);

    const formatTime = (timeData: Date | string | null): string => {
        if (!timeData) return "";

        const date = new Date(timeData);

        if (isNaN(date.getTime())) {
            return "Invalid Time";
        }

        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;

    const handleClockIn = async () => {
        if (!staff?.id) return;
        try {
            setLoading(true);
            await clockIn(staff.id);
            const attRes = await findTodayAttendance(staff.id);
            setAttendance(attRes);
        } catch (error) {
            console.error("Clock in failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        if (!attendance?.id) return;
        try {
            setLoading(true);
            await clockOut(attendance.staffId);
            const attRes = await findTodayAttendance(staff!.id);
            setAttendance(attRes);
        } catch (error) {
            console.error("Clock out failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at 50% 50%, #f0f2f5 0%, #d7dde8 100%)',
                p: 3,
                gap: 6
            }}
        >
            <Typography variant="h3" sx={{ fontWeight: 300, textAlign: 'center', color: '#2d3436' }}>
                Hi, <Box component="span" sx={{ fontWeight: 700 }}>{user?.name || 'User'}</Box>!
            </Typography>

            <LiveClock />

            <Stack direction={{ xs: 'column', md: 'row' }} gap={4}>
                {/* CLOCK IN BUTTON */}
                <Button
                    variant="contained"
                    size="large"
                    disabled={!!attendance?.clockIn} // Disables if clockin is not null
                    onClick={handleClockIn}
                    startIcon={<PlayArrowIcon />}
                    sx={{
                        px: 6, py: 2.5, borderRadius: 50, fontSize: '1.2rem', textTransform: 'none',
                        backgroundColor: attendance?.clockIn ? 'rgba(0,0,0,0.12)' : '#1a1a1a',
                        "&.Mui-disabled": { color: "#666" }
                    }}
                >
                    {attendance?.clockIn
                        ? `Clocked In at ${formatTime(attendance.clockIn)}`
                        : "Clock In"}
                </Button>

                {/* CLOCK OUT BUTTON */}
                <Button
                    variant="contained"
                    size="large"
                    color="error"
                    // Disabled if: Not yet clocked in OR Already clocked out
                    disabled={!attendance?.clockIn || !!attendance?.clockOut}
                    onClick={handleClockOut}
                    startIcon={<LogoutIcon />}
                    sx={{
                        px: 6, py: 2.5, borderRadius: 50, fontSize: '1.2rem', textTransform: 'none',
                        "&.Mui-disabled": {
                            backgroundColor: attendance?.clockOut ? 'rgba(211, 47, 47, 0.1)' : 'rgba(0,0,0,0.05)'
                        }
                    }}
                >
                    {attendance?.clockOut
                        ? `Clocked Out at ${formatTime(attendance.clockOut)}`
                        : "Clock Out"}
                </Button>
            </Stack>
        </Box>
    );
}
