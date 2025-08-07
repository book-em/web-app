
import 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import UserLogin from '../views/user/UserLogin.vue';
import UserRegister from '../views/user/UserRegister.vue';
import UserSettings from '../views/user/UserSettings.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: UserLogin },
    { path: '/register', component: UserRegister },
    { path: '/update', component: UserSettings },
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});