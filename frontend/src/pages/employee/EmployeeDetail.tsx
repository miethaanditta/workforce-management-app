import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { findOneStaff, updateStaff, type CreateUpdateStaffRequest, type StaffDetailResponse, type StaffFormState } from "../../api/employee.api";
import { Box, CircularProgress } from "@mui/material";
import StaffForm from "../../components/StaffForm";
import { getUser } from "../../auth/auth.storage";

export default function EmployeeDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = getUser();
    
    const [initialData, setInitialData] = useState<StaffDetailResponse | null>(null);
    const [fetching, setFetching] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const staff = await findOneStaff(id);
                setInitialData(staff);
            } catch (error) {
                console.error("Load failed", error);
            } finally {
                setFetching(false);
            }
        };
        loadData();
    }, [id]);

    const handleUpdate = async (data: StaffFormState) => {
        if (!id || !initialData) return;
        setSubmitting(true);
        try {
            const changedFields: Partial<CreateUpdateStaffRequest> = {};
            (Object.keys(data) as Array<keyof CreateUpdateStaffRequest>).forEach((key) => {
                if (data[key] !== initialData[key]) changedFields[key] = data[key] as any;
            });

            console.log(changedFields);

            if (Object.keys(changedFields).length > 0) {
                await updateStaff(user!.role, user!.id, id, changedFields);
            }
            user!.role == 'ADMIN' ? navigate('/employee') : navigate('/');
        } catch (error) {
            console.error("Update failed", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (fetching) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    return <StaffForm isEdit={true} initialData={initialData!} onSubmit={handleUpdate} loading={submitting} />;
}
