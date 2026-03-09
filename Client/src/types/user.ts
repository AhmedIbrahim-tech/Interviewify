/** id is number from API; may be string from route/display. */
export interface User {
    id: number | string;
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
