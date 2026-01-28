import { http } from './http';

export interface AttendanceResponse {
    staffId: string;
    staffName?: string;
    attendanceDate: Date;
    clockIn: Date | null;
    clockOut: Date | null;
    id: string;
};

export interface AttendanceQuery {
  startDate?: string; 
  endDate?: string;
};

export const findTodayAttendance = async (staffId: string) => {
  const res = await http.get<AttendanceResponse>(`/workforce/today-attendance/${staffId}`);
  return res.data;
};

export const clockIn = async (staffId: string) => {
  const res = await http.post<AttendanceResponse>(`/workforce/${staffId}/clock-in`);
  return res.data;
};

export const clockOut = async (staffId: string) => {
  const res = await http.put<AttendanceResponse>(`/workforce/${staffId}/clock-out`);
  return res.data;
};

export const findMyAttendance = async (staffId: string, query: AttendanceQuery) => {
  console.log(query);
  const res = await http.get<AttendanceResponse[]>(`/workforce/attendance/${staffId}`, {
    params: query
  });
  return res.data;
};

export const findAllAttendance = async () => {
  const res = await http.get<AttendanceResponse[]>('/workforce/attendance');
  return res.data;
};
