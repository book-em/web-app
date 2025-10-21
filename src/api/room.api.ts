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
    autoApprove: boolean
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
    autoApprove: boolean
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
     * ID of the existing room availability item.
     * If 0, then this is a brand new one
     */
    existingId: number,
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

export interface CreateRoomPriceItemDTO {
    existingId: number;
    dateFrom: string; // ISO date string
    dateTo: string;   // ISO date string
    price: number;
}

export interface RoomPriceItemDTO {
    id: number;
    dateFrom: string;
    dateTo: string;
    price: number;
}

export interface CreateRoomPriceListDTO {
    roomId: number;
    items: CreateRoomPriceItemDTO[];
    basePrice: number;
    perGuest: boolean;
}

export interface RoomPriceListDTO {
    id: number;
    roomId: number;
    effectiveFrom: string; // ISO date string
    basePrice: number;
    items: RoomPriceItemDTO[];
    perGuest: boolean;
}

export interface RoomReservationQueryDTO {
    roomId: number;
    dateFrom: string; // ISO date string
    dateTo: string;
    guestCount: number;
}

export interface RoomReservationQueryResponseDTO {
    available: boolean;
    totalCost: number;
}

export interface QueryRoomsDTO {
    address: string;
    guestsNumber: number;
    dateFrom: string;
    dateTo: string;
    pageNumber: number;
    pageSize: number;
}

export interface PaginatedResultInfoDTO {
	page: number,
    pageSize: number,
    totalPages: number,
    totalHits: number,
}

export interface RoomResultDTO {
    id: number,
    name: string,
    description: string,
    address: string,
    photos: string[],
    perGuest: boolean,
    unitPrice: number,
    totalPrice: number,
}

export interface RoomsResultDTO {
    hits: RoomResultDTO[],
    info: PaginatedResultInfoDTO,
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
    
    static findAvailableRooms(dto: QueryRoomsDTO): Promise<AxiosResponse<RoomsResultDTO>> {
        return axiosInstanceRooms.get(`/all`, {params: {...dto}});
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

    static findCurrentPriceListOfRoom(roomId: number): Promise<AxiosResponse<RoomPriceListDTO>> {
        return axiosInstanceRooms.get(`/price/room/${roomId}`);
    }

    static findPriceListsByRoomId(roomId: number): Promise<AxiosResponse<RoomPriceListDTO[]>> {
        return axiosInstanceRooms.get(`/price/room/all/${roomId}`);
    }

    static findPriceListById(id: number): Promise<AxiosResponse<RoomPriceListDTO>> {
        return axiosInstanceRooms.get(`/price/${id}`);
    }

    static updatePriceList(dto: CreateRoomPriceListDTO): Promise<AxiosResponse<RoomPriceListDTO>> {
        return axiosInstanceRooms.post(`/price`, dto);
    }

    static queryForReservation(dto: RoomReservationQueryDTO): Promise<AxiosResponse<RoomReservationQueryResponseDTO>> {
        return axiosInstanceRooms.post(`/reservation/query`, dto);
    }
}