import type { AxiosResponse } from "axios";
import { axiosInstanceNotifications, axiosInstanceReservations } from "./util";

export enum NotificationType {
  ReservationRequested = "reservation_requested",
  ReservationCancelled = "reservation_cancelled",
  HostReviewed = "host_reviewed",
  RoomReviewed = "room_reviewed",
  ReservationAccepted = "reservation_accepted",
  ReservationDeclined = "reservation_declined",
}

export interface NotificationDTO {
  id: string;
  receiverId: number;
  type: NotificationType;
  subject: number;
  object?: number;
  starsNumber?: number;
  isRead: boolean;
  createdAt: string; 
}

export interface NotificationPreferencesDTO {
  userID: number;
  enabledTypes: Record<NotificationType, boolean>;
}

export const allowedTypesByRole: Record<string, NotificationType[]> = {
  host: [
    NotificationType.ReservationRequested,
    NotificationType.ReservationCancelled,
    NotificationType.HostReviewed,
    NotificationType.RoomReviewed,
  ],
  guest: [
    NotificationType.ReservationAccepted,
    NotificationType.ReservationDeclined,
  ],
};

export class NotificationAPI {

    static getMyNotifications(limit: number, offset: number): Promise<AxiosResponse<NotificationDTO[]>> {
        return axiosInstanceNotifications.get(`/notifications?limit=${limit}&offset=${offset}`);
    }

    static markNotificationAsRead(id: string): Promise<AxiosResponse<void>> {
        return axiosInstanceNotifications.put(`/notifications/${id}/read`);
    }

    static getUnreadNotificationCount(): Promise<AxiosResponse<{ unreadCount: number }>> {
        return axiosInstanceNotifications.get(`/notifications/unread-count`);
    }

    static getPreferences(): Promise<AxiosResponse<NotificationPreferencesDTO>> {
        return axiosInstanceNotifications.get("/notification/preferences");
    }

    static updatePreferences(data: NotificationPreferencesDTO): Promise<AxiosResponse<NotificationPreferencesDTO>> {
        return axiosInstanceNotifications.put("/notification/preferences", data);
    }


}