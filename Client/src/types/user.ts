export interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: string;
    profilePicture?: string;
}

export interface CreateUserDto {
    fullName: string;
    email: string;
    password?: string;
    role: string;
    profilePicture?: string;
}

export interface UpdateUserDto {
    fullName: string;
    email: string;
    role: string;
    profilePicture?: string;
}
