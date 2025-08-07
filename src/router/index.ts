
import 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import UserLogin from '../views/user/UserLogin.vue';
import UserRegister from '../views/user/UserRegister.vue';
import UserSettings from '../views/user/UserSettings.vue';
import { UserRole } from '../api/user.api';
import { useAuthStore } from '../stores/auth-store';
import type { RouteRecordRaw } from 'vue-router';

/**
 * A special type for route guards.
 * 
 * If `"signed-in"`, then any signed in user is allowed.
 * If `"all"`, then everyone (including signed out users) is allowed.
 * If `"signed-out"`, then only signed out users are allowed.
 * If list of `UserRole`, then only those roles are allowed.
 */
type RouteGuardRoles = UserRole[] | "signed-in" | "all" | "signed-out";

// https://router.vuejs.org/guide/advanced/meta#TypeScript
declare module 'vue-router' {
    interface RouteMeta {
        role: RouteGuardRoles
    }
}

const routes: RouteRecordRaw[] = [
    { path: "/", component: Home, meta: { role: "all" } },

    { path: "/login", component: UserLogin, meta: { role: "signed-out" } },
    { path: "/register", component: UserRegister, meta: { role: "signed-out" } },

    { path: "/my-settings", component: UserSettings, meta: { role: "signed-in" } },
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, _) => {
    const requiredRole = to.meta.role ?? "all";
    const auth = useAuthStore();

    let have_required_role = false;
    let redirect_on_fail = "/";

    switch (requiredRole) {
        case 'all':
            have_required_role = true;
            break;
        case 'signed-out':
            have_required_role = !auth.isLoggedIn;
            redirect_on_fail = "/";
            break;
        case 'signed-in':
            have_required_role = auth.isLoggedIn;
            redirect_on_fail = "/login";
            break;
        default:
            const requiredRolesList = requiredRole as (UserRole[]);
            have_required_role = requiredRolesList.some((e) => e == auth.role);
            redirect_on_fail = "/login";
            break;
    }

    if (!have_required_role) {
        console.info("Route", to.fullPath, "requires", requiredRole, "but I have", auth.role);
        console.info("Redirecting to", redirect_on_fail);
        return { path: redirect_on_fail };
    }

    return have_required_role;
});