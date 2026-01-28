import { http } from './http';

export interface PositionResponse {
    id: string;
    name: string;
}

export interface BufferResponse {
    type: 'Buffer';
    data: number[];
};

export interface FileResponse {
    id: string;
    name: string;
    content: BufferResponse;
}

export interface CreateUpdateStaffRequest {
    userId: string;
    name: string;
    positionId: string;
    phoneNo: string | null;
    fileId: string | null;
}

export interface StaffFormState extends CreateUpdateStaffRequest {
    email?: string;
    password?: string;
}

export interface StaffResponse {
    id: string;
    userId: string;
    email: string;
    name: string;
    phoneNo: string | null;
    positionId: string;
    fileId: string | null;
};

export interface StaffDetailResponse {
    id: string;
    userId: string;
    email: string;
    name: string;
    phoneNo: string | null;
    positionId: string;
    positionName: string;
    fileId: string | null;
    fileName: string | null;
    fileContent: BufferResponse | null;
}

export const uploadFile = async (selectedFile: File) => {
    const formData = new FormData();
    formData.append('file', selectedFile);

    const res = await http.post<FileResponse>('/workforce/files', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return res.data
};

export const findPositions = async (keyword?: string) => {
    const res = await http.get<PositionResponse[]>('/workforce/positions', {
        params: {
            keyword: keyword
        }
    });

    return res.data;
};

export const createStaff = async (userRole: string, payload: CreateUpdateStaffRequest) => {
    const res = await http.post<StaffResponse>('/workforce/staff', payload, {
        headers: {
            'x-user-role': userRole 
        },
    });

    return res.data
};

export const updateStaff = async (userRole: string, userId: string, id: string, payload: Partial<CreateUpdateStaffRequest>) => {
    const res = await http.put<StaffResponse>(`/workforce/staff/${id}`, payload, {
        headers: {
            'x-user-role': userRole,
            'x-user-id': userId
        },
    });

    return res.data
};

export const deleteStaff = async (id: string) => {
    const res = await http.delete<StaffResponse>(`/workforce/staff/${id}`);

    return res.data
};

export const findAllStaff = async (keyword?: string) => {
    const res = await http.get<StaffDetailResponse[]>('/workforce/staff', {
        params: {
            keyword: keyword
        }
    });

    return res.data;
};

export const findOneStaff = async (userId: string) => {
    const res = await http.get<StaffDetailResponse>(`/workforce/staff/${userId}`);

    return res.data;
};
