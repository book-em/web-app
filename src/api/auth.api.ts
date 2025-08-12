import { axiosInstance } from "./util"
import type { AxiosResponse } from "axios"
import type { UserDTO, UserRole } from "./user.api"

export interface LoginRequestDTO {
    usernameOrEmail: string
    password: string
}

export interface LoginResponseDTO {
    jwt: string
}

export interface RegisterRequestDTO {
    username: string
    password: string
    email: string
    name: string
    surname: string
    address: string
    role: UserRole
}

export class AuthAPI {
    static login(dto: LoginRequestDTO): Promise<AxiosResponse<LoginResponseDTO>> {
        return axiosInstance.post("/login", dto);
    }

    static register(dto: RegisterRequestDTO): Promise<AxiosResponse<UserDTO>> {
        return axiosInstance.post("/register", dto);
    }
}