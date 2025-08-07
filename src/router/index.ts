
import 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/user/Login.vue';
import Register from '../views/user/Register.vue';
import Settings from '../views/user/Settings.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/update', component: Settings },
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});