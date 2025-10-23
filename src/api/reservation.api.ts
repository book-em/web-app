import type { AxiosResponse } from "axios";
import { axiosInstanceReservations } from "./util";

export enum ReservationRequestStatus {
    Pending = "pending",
    Accepted = "accepted",
    Rejected = "rejected",
}

export interface CreateReservationRequestDTO {
    roomId: number;
    dateFrom: string; // ISO string format
    dateTo: string;
    guestCount: number;
}

export interface ReservationRequestDTO {
    id: number;
    roomId: number;
    dateFrom: string;
    dateTo: string;
    guestCount: number;
    guestId: number;
    status: ReservationRequestStatus;
    cost: number;
}

export interface ReservationDTO {
    id: number;
    roomId: number;
    dateFrom: string;
    dateTo: string;
    guestCount: number;
    guestId: number;
    cancelled: boolean;
    cost: number;
}

export class ReservationAPI {
    static createRequest(dto: CreateReservationRequestDTO): Promise<AxiosResponse<ReservationRequestDTO>> {
        return axiosInstanceReservations.post("/req", dto);
    }

    static getRequestsByGuest(): Promise<AxiosResponse<ReservationRequestDTO[]>> {
        return axiosInstanceReservations.get("/req/user");
    }

    static getActiveReservationsByGuest(): Promise<AxiosResponse<ReservationDTO[]>> {
        return axiosInstanceReservations.get('/reservations/guest/active');
    }

    static getActiveReservationsByHost(): Promise<AxiosResponse<ReservationDTO[]>> {
        return axiosInstanceReservations.get('/reservations/host/active');
    }

    static getRequestsByRoom(roomId: number): Promise<AxiosResponse<ReservationRequestDTO[]>> {
        return axiosInstanceReservations.get(`/req/room/${roomId}`);
    }

    static deleteRequest(requestId: number): Promise<AxiosResponse<null>> {
        return axiosInstanceReservations.delete(`/req/${requestId}`);
    }

    static checkAvailability(roomId: number, from: string, to: string): Promise<AxiosResponse<{ available: boolean }>> {
        return axiosInstanceReservations.get(`/room/${roomId}/availability`, {
            params: { from, to },
        });
    }

    static rejectRequest(id: number): Promise<AxiosResponse<void>> {
        return axiosInstanceReservations.put(`/req/${id}/reject`);
    }

    static approveRequest(id: number): Promise<AxiosResponse<any>> {
        return axiosInstanceReservations.put(`/req/${id}/approve`);
    }

    static cancelReservation(reservationId: number): Promise<AxiosResponse<any>> {
        return axiosInstanceReservations.delete(`/reservations/${reservationId}/cancel`);
    }
}