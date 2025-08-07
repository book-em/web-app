import { Buffer } from 'buffer';
import { UserRole } from './user.api';

export interface JWTStruct {
    username: string
    sub: number,
    role: UserRole,

};

export function setJWT(jwt: string) {
    localStorage.setItem("jwt", jwt);
}

export function clearJWT() {
    localStorage.removeItem("jwt");
}

export function getJWTStringOrNull(): string | null {
    return localStorage.getItem("jwt");
}

export function getJWT(jwt: string): JWTStruct {
    let parts = jwt.split(".");
    for (let i = 0; i < parts.length; i++) {
        parts[i] = Buffer.from(parts[i], 'base64').toString();
    }
    let token: JWTStruct = JSON.parse(parts[1]);
    return token;
}

export function getJWTRole(): UserRole {
    const jwtString = getJWTStringOrNull();
    if (jwtString == null) {
        return UserRole.Guest;
    }
    return getJWT(jwtString).role as UserRole;
}

export function getJWTUsername(): string {
    const jwtString = getJWTStringOrNull();
    if (jwtString == null) {
        return "";
    }
    return getJWT(jwtString).username;
}

export function getJWTId(): number {
    const jwtString = getJWTStringOrNull();
    if (jwtString == null) {
        return -1;
    }
    return getJWT(jwtString).sub;
}