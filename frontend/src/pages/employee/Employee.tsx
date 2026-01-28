import { useCallback, useEffect, useState } from "react";
import { deleteStaff, findAllStaff, type StaffDetailResponse } from "../../api/employee.api";
import { useNavigate } from "react-router-dom";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box, TextField, IconButton, Paper, Stack, Typography, Button } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';

export default function Employee() {
    const navigate = useNavigate();
    const [rows, setRows] = useState<StaffDetailResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const [keyword, setKeyword] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedKeyword(keyword);
        }, 500);

        return () => clearTimeout(handler);
    }, [keyword]);

    const loadStaff = useCallback(async (searchQuery: string) => {
        setLoading(true);
        try {
            const res = await findAllStaff(searchQuery);
            setRows(res || []);
        } catch (error) {
            console.error("Failed to fetch staff:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStaff(debouncedKeyword);
    }, [debouncedKeyword, loadStaff]);

    const handleCreate = () => navigate('/employee/create');

    const handleUpdate = (id: string) => navigate(`/employee/${id}`);

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            await deleteStaff(id);
            loadStaff(debouncedKeyword);
        }
    };

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'phoneNo', headerName: 'Phone', flex: 1 },
        { field: 'positionName', headerName: 'Position', flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <IconButton color="primary" onClick={() => handleUpdate(params.row.userId)}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(params.row.id, params.row.name)}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            ),
        },
    ];

    return (
        <Box sx={{ p: 4, maxWidth: 1200, margin: 'auto' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Employee List
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Add New Employee
                </Button>
            </Stack>

            <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center' }}>
                <SearchIcon sx={{ color: 'action.active', mr: 2 }} />
                <TextField
                    label="Search by Name/Email/Position..."
                    variant="standard"
                    fullWidth
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)} // Update typing state
                />
            </Paper>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => row.id || row._id}
                    disableRowSelectionOnClick
                />
            </Paper>
        </Box>
    );
}
