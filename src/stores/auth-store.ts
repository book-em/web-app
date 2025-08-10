import { defineStore } from 'pinia'
import { clearJWT, getJWTId, getJWTRole, getJWTStringOrNull, getJWTUsername, setJWT, type JWTStruct } from '../api/localstorage'
import type { UserRole } from '../api/user.api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isLoggedIn: false,
        token: '' as string,
        id: -1 as number,
        username: "" as string,
        role: "" as UserRole | "",
    }),
    actions: {
        login(jwt: string) {
            setJWT(jwt);
            this.isLoggedIn = true;
            this.token = jwt;
            this.id = getJWTId();
            this.username = getJWTUsername();
            this.role = getJWTRole();
        },
        logout() {
            this.isLoggedIn = false;
            this.token = '';
            this.username = "";
            this.id = -1;
            this.role = '';
            clearJWT();
        },
        checkLocalStorage() {
            const storedToken = getJWTStringOrNull();
            if (storedToken) {
                try {
                    this.login(storedToken!);
                } catch (e) {
                    console.error('Invalid token:', e)
                    this.logout()
                }
            }
        }
    }
})