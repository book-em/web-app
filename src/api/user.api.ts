export enum UserRole {
    Guest = "guest",
    Host = "host",
    Admin = "admin",
}

export interface UserDTO {
    id: number,
    username: string
    email: string
    name: string
    surname: string
    address: string
    role: UserRole
}

export class UserAPI {

}