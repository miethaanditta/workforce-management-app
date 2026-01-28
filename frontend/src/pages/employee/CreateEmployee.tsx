import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createStaff, type StaffFormState } from "../../api/employee.api";
import { getUser } from "../../auth/auth.storage";
import StaffForm from "../../components/StaffForm";
import { register } from "../../api/auth.api";

export default function CreateEmployee() {
    const navigate = useNavigate();
    const user = getUser();

    const [submitting, setSubmitting] = useState(false);

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const handleCreate = async (data: StaffFormState) => {
        setSubmitting(true);
        try {
            const newUser = await register(user!.role, {
                email: data.email!,
                password: data.password!,
                name: data.name
            });

            const generatedUserId = newUser.userId;

            await delay(3000); 

            console.log(data);

            await createStaff(user!.role, { 
               userId: generatedUserId,
               name: data.name,
               positionId: data.positionId,
               phoneNo: data.phoneNo,
               fileId: data.fileId
            });
            navigate('/employee');
        } catch (error) {
            console.error("Create failed", error);
        } finally {
            setSubmitting(false);
        }
    };

    return <StaffForm isEdit={false} onSubmit={handleCreate} loading={submitting} />;
}
