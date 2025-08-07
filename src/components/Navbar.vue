<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth-store';

const auth = useAuthStore();

onMounted(() => {
    auth.checkLocalStorage();
});

const logOut = () => {
    auth.logout();
}

</script>

<template>
    <nav class="navbar">
        <RouterLink to="/"><strong>Book'em</strong></RouterLink>

        <div v-if="!auth.isLoggedIn">
            <RouterLink to="/login">Login</RouterLink> <br />
            <RouterLink to="/register">Register</RouterLink> <br />
        </div>
        <div v-else>
            <span><i>{{ auth.username }}</i></span> <br />
            <RouterLink to="/" @click.prevent="logOut">Sign out</RouterLink> <br />
        </div>
    </nav>
</template>