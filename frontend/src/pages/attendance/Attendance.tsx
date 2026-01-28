import { useEffect, useState } from "react";
import { getUser } from "../../auth/auth.storage";
import { findAllAttendance, findMyAttendance, type AttendanceResponse } from "../../api/attendance.api";
import { findOneStaff } from "../../api/employee.api";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";

export default function Attendance() {
    const user = getUser();
    const isAdmin = user?.role === 'ADMIN';

    const [rows, setRows] = useState<AttendanceResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const formatDateForInput = (date: Date | null): string => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    };

    const loadData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const res = await findAllAttendance();
                setRows(res || []);
            } else {
                const staffRes = await findOneStaff(user.id);
                const staffId = staffRes?.id;

                if (staffId) {
                    const attRes = await findMyAttendance(
                        staffId, {
                        startDate: startDate?.toISOString(),
                        endDate: endDate?.toISOString()
                    });
                    setRows(attRes || []);
                }
            }
        } catch (error) {
            console.error("Failed to fetch attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const columns: GridColDef[] = [
        ...(isAdmin ? [{ field: 'name', headerName: 'Staff Name', flex: 1.5 }] : []),
        {
            field: 'attendanceDate',
            headerName: 'Date',
            flex: 1,
            valueFormatter: (value) => value ? new Date(value as string).toLocaleDateString() : '-'
        },
        {
            field: 'clockIn',
            headerName: 'Clock In',
            flex: 1,
            valueFormatter: (value) => value ? new Date(value as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
        },
        {
            field: 'clockOut',
            headerName: 'Clock Out',
            flex: 1,
            valueFormatter: (value) => value ? new Date(value as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
        },
    ];

    return (
        <Box sx={{ p: 4, maxWidth: 1200, margin: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
                {isAdmin ? "Organization Attendance" : "My Attendance Logs"}
            </Typography>

            {!isAdmin && (
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField
                            label="Start Date"
                            type="date"
                            fullWidth
                            value={formatDateForInput(startDate)}
                            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            fullWidth
                            value={formatDateForInput(endDate)}
                            onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <Button
                            variant="contained"
                            onClick={loadData}
                            sx={{ px: 4, height: 56, minWidth: 150 }}
                        >
                            Filter
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => { setStartDate(null); setEndDate(null); }}
                            sx={{ height: 56 }}
                        >
                            Reset
                        </Button>
                    </Stack>
                </Paper>
            )}

            <Paper sx={{ height: 600, width: '100%', borderRadius: 2 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row._id || row.id}
                    loading={loading}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10, page: 0 } },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                />
            </Paper>
        </Box>
    );
}
