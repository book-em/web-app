import type { AxiosResponse } from "axios"
import axiosInstance from "./util"

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

export interface UserUpdateDTO {
    id: number,

    username: string | null
    email: string | null
    name: string | null
    surname: string | null
    address: string | null
}

export interface UserChangePasswordDTO {
    id: number,
    oldPassword: string,
    newPassword: string,
    newPasswordConfirm: string
}

export class UserAPI {
    static findById(id: number): Promise<AxiosResponse<UserDTO>> {
        return axiosInstance.get(`/${id}`);
    }

    static update(dto: UserUpdateDTO): Promise<AxiosResponse<null>> {
        return axiosInstance.put(`/update`, dto);
    }

    static changePassword(dto: UserChangePasswordDTO): Promise<AxiosResponse<null>> {
        return axiosInstance.put(`/password`, dto);
    }

    static deleteById(id: number): Promise<AxiosResponse<null>> {
        return axiosInstance.delete(`/${id}`);
    }
}