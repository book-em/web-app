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

export interface CreateRoomAvailabilityListDTO {
    roomId: number,
    items: CreateRoomAvailabilityItemDTO[],
}

export interface RoomAvailabilityListDTO {
    id: number,
    roomId: number,
    /**
     * Date object
     */
    effectiveFrom: string,
    items: RoomAvailabilityItemDTO[],
}

export interface CreateRoomAvailabilityItemDTO {
    /**
     * Date object
     */
    dateFrom: string,
    /**
     * Date object
     */
    dateTo: string,
    available: boolean
}

export interface RoomAvailabilityItemDTO {
    id: number,
    /**
     * Date object
     */
    dateFrom: string,
    /**
     * Date object
     */
    dateTo: string,
    available: boolean
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

    static findCurrentAvailabilityListOfRoom(roomId: number): Promise<AxiosResponse<RoomAvailabilityListDTO>> {
        return axiosInstanceRooms.get(`/available/room/${roomId}`);
    }

    static findAvailabilityListsByRoomId(roomId: number): Promise<AxiosResponse<RoomAvailabilityListDTO[]>> {
        return axiosInstanceRooms.get(`/available/room/all/${roomId}`);
    }

    static findAvailabilityListById(id: number): Promise<AxiosResponse<RoomAvailabilityListDTO>> {
        return axiosInstanceRooms.get(`/available//${id}`);
    }

    static updateAvailability(dto: CreateRoomAvailabilityListDTO): Promise<AxiosResponse<RoomAvailabilityListDTO>> {
        return axiosInstanceRooms.post(`/available`, dto);
    }
}