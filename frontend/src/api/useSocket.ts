import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getUser } from '../auth/auth.storage'; 
import { http } from './http';

const SOCKET_URL = import.meta.env.VITE_SOCKET_BASE_URL;

export interface InboxResponse {
    recipientId: string;
    senderId: string;
    title: string;
    content: string;
    id: string;
    createdAt: Date;
};

export const getInbox = async (userId: string) => {
    const res = await http.get<InboxResponse[]>(`/notifications/inbox/${userId}`);
    return res.data;
};

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const user = getUser();

    useEffect(() => {
        if (!user?.id) return;

        const newSocket = io(SOCKET_URL, {
            query: { userId: user.id }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user?.id]);

    return socket;
};
