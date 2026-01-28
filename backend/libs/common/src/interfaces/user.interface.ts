export interface IUser {
    id: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAuthUser extends Pick<IUser, 'id' | 'email'>{
    roles: string[];
}
