import type { AxiosResponse } from "axios"
import { axiosInstanceRooms } from "./util"

export interface RoomDTO {
    id: number,
    hostID: number,
    name: string,
    description: string,
    address: string,
    minGuests: number,
    maxGuests: number,
    photos: string[],
    commodities: string[],
}

export interface RoomCreateDTO {
    hostID: number,
    name: string,
    description: string,
    address: string,
    minGuests: number,
    maxGuests: number,
    photosPayload: string[],
    commodities: string[],
}

export class RoomAPI {
    static create(dto: RoomCreateDTO): Promise<AxiosResponse<RoomDTO>> {
        return axiosInstanceRooms.post(`/new`, dto);
    }

    static findById(id: number): Promise<AxiosResponse<RoomDTO>> {
        return axiosInstanceRooms.get(`/${id}`);
    }

    static findByHostId(hostId: number): Promise<AxiosResponse<RoomDTO[]>> {
        return axiosInstanceRooms.get(`/host/${hostId}`);
    }
}