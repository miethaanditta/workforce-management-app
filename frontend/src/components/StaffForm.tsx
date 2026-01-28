import React, { useEffect, useState } from "react";
import {
    findPositions,
    uploadFile,
    type FileResponse,
    type PositionResponse,
    type StaffDetailResponse,
    type StaffFormState
} from "../api/employee.api";
import { getUser } from "../auth/auth.storage";
import {
    Alert,
    TextField,
    Typography,
    Paper,
    Autocomplete,
    CircularProgress,
    Button,
    Grid,
    Box,
    Badge,
    Avatar,
    IconButton
} from "@mui/material";
import {
    CameraAlt as CameraIcon,
    Save as SaveIcon
} from "@mui/icons-material";

interface StaffFormProps {
    initialData?: StaffDetailResponse;
    isEdit: boolean;
    onSubmit: (data: StaffFormState) => Promise<void>;
    loading?: boolean;
}

export default function StaffForm({ initialData, isEdit, onSubmit, loading }: StaffFormProps) {
    const user = getUser();
    const isAdmin = user?.role === 'ADMIN';

    const [formData, setFormData] = useState<StaffFormState>({
        userId: '',
        name: '',
        positionId: '',
        phoneNo: '',
        fileId: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof StaffFormState, string>>>({});

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [positions, setPositions] = useState<PositionResponse[]>([]);
    const [posLoading, setPosLoading] = useState(false);
    const [posSearch, setPosSearch] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    useEffect(() => {
        const fetchPositions = async () => {
            setPosLoading(true);
            try {
                const res = await findPositions(posSearch);
                setPositions(res || []);
            } catch (error) {
                console.error("Failed to fetch positions", error);
            } finally {
                setPosLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchPositions, 500);
        return () => clearTimeout(timeoutId);
    }, [posSearch]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof StaffFormState, string>> = {};

        // Name validation (required, max 255)
        if (!formData.name.trim()) {
            newErrors.name = "Full name is required";
        }
        else if (formData.name.length > 255) {
            newErrors.name = "Full name must be under 255 characters";
        }

        // Name validation (required)
        if (!formData.positionId) newErrors.positionId = "Please select a position";
        
        // Phone validation (numbers only, min 10, max 20)
        if (formData.phoneNo && !/^\d+$/.test(formData.phoneNo)) {
            newErrors.phoneNo = "Phone number must contain only digits";
        }
        else if (formData.phoneNo && formData.phoneNo.length > 20) {
            newErrors.phoneNo = "Phone No must be under 20 digits";
        }

        // Account registration validation
        if (!isEdit) {
            if (!formData.email) {
                newErrors.email = "Email is required";
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Invalid email format";
            }
            if (!formData.password) {
                newErrors.password = "Password is required";
            } else if (formData.password.length < 6) {
                newErrors.password = "Password must be at least 6 characters";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAction = async () => {
        if (validate()) {
            await onSubmit(formData);
        }
    };

    const bufferToImage = (bufferResponse: any): string | undefined => {
        if (!bufferResponse || !bufferResponse.data) return undefined;

        // Convert number array to a Base64 string
        const base64String = btoa(
            bufferResponse.data.reduce((data: string, byte: number) => data + String.fromCharCode(byte), '')
        );

        return `data:image/png;base64,${base64String}`; // Adjust 'png' if it could be 'jpeg'
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

        setUploading(true);
        setUploadError(null);

        try {
            const res: FileResponse = await uploadFile(file);
            setFormData((prev) => ({ ...prev, fileId: res.id }));
        } catch (error) {
            setUploadError("Failed to upload file. Please try again.");
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
        }
    };

    const isRestricted = isEdit && !isAdmin;

    return (
        <Paper sx={{ p: 4, maxWidth: 700, mx: 'auto', mt: 4, borderRadius: 3 }} elevation={3}>
            <Typography variant="h5" fontWeight={700} mb={3}>
                {isEdit ? 'Update Employee Profile' : 'Create New Employee'}
            </Typography>

            {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                        <IconButton
                            component="label"
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                border: '3px solid white',
                                '&:hover': { bgcolor: 'primary.dark' },
                                width: 40,
                                height: 40
                            }}
                        >
                            <CameraIcon fontSize="small" />
                            <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                        </IconButton>
                    }
                >
                    <Avatar
                        src={
                            previewUrl ||
                            (initialData?.fileContent ? bufferToImage(initialData.fileContent) : undefined)
                        }
                        sx={{
                            width: 120,
                            height: 120,
                            border: '2px solid',
                            borderColor: 'divider',
                            boxShadow: 2
                        }}
                    >
                        {formData.name?.charAt(0) || 'U'}
                    </Avatar>
                </Badge>

                {uploading && <CircularProgress size={24} sx={{ mt: 1 }} />}

                <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 600, cursor: 'pointer' }} component="label">
                    Edit Picture
                    <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {!isEdit && (
                    <>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Email Address"
                                fullWidth
                                required
                                error={!!errors.email}
                                helperText={errors.email} 
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Initial Password"
                                fullWidth
                                required
                                error={!!errors.password}
                                helperText={errors.password} 
                                type="password"
                                value={formData.password || ''}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </Grid>
                    </>
                )}

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Full Name"
                        fullWidth
                        required
                        error={!!errors.name}
                        helperText={errors.name}
                        disabled={isRestricted}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Autocomplete
                        disabled={isRestricted}
                        options={positions}
                        loading={posLoading}
                        getOptionLabel={(option) => option.name || ''}
                        value={positions.find((p) => p.id === formData.positionId) || null}
                        onInputChange={(_, newInputValue) => setPosSearch(newInputValue)}
                        onChange={(_, newValue) => {
                            setFormData({ ...formData, positionId: newValue?.id || '' });
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                required
                                error={!!errors.positionId}
                                helperText={errors.positionId}
                                label="Position"
                                slotProps={{
                                    input: {
                                        ...params.InputProps,
                                        endAdornment: (
                                            <React.Fragment>
                                                {posLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </React.Fragment>
                                        ),
                                    },
                                }}
                            />
                        )}
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <TextField
                        label="Phone Number"
                        error={!!errors.phoneNo}
                        helperText={errors.phoneNo}
                        fullWidth
                        placeholder="e.g. +62812345678"
                        value={formData.phoneNo || ''}
                        onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                    />
                </Grid>

                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={!loading && <SaveIcon />}
                        onClick={handleAction}
                        disabled={loading || uploading}
                        sx={{ height: 56, borderRadius: 2 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : isEdit ? 'Update Profile' : 'Create Staff'}
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
}
