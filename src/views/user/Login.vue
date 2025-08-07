<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { AuthAPI, type LoginRequestDTO, type LoginResponseDTO } from '../../api/auth.api';
import type { AxiosError, AxiosResponse } from 'axios';
import { getJWTId, getJWTRole, getJWTUsername, setJWT } from '../../api/localstorage';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth-store';

const auth = useAuthStore();
const router = useRouter();
const formUsernameOrEmail = ref('');
const formPassword = ref('');
const error = ref('');

onMounted(() => {
    auth.checkLocalStorage();
});

const doLogin = () => {
    const usernameOrEmail = formUsernameOrEmail.value;
    const password = formPassword.value;
    const dto: LoginRequestDTO = {
        usernameOrEmail,
        password
    };

    error.value = "";

    AuthAPI.login(dto).then((res: AxiosResponse<LoginResponseDTO>) => {
        const jwt = res.data.jwt;
        auth.login(jwt);
        router.push('/');

        console.log(getJWTId());
        console.log(getJWTUsername());
        console.log(getJWTRole());

    }).catch((err: AxiosError) => {
        if (err.response?.status == 400) {
            error.value = "Unknown user or password";
        } else {
            console.error(err);
            error.value = "Unknown error. Check the console";
        }
    });
}

</script>

<template>
    <p v-if="error.length > 0" class="error">
        {{ error }}
    </p>

    Login
    <form @submit.prevent="doLogin">
        <label>
            <input v-model.trim="formUsernameOrEmail" type="text" />
            Username or email
        </label>
        <br />

        <label>
            <input v-model.trim="formPassword" type="password" />
            Password
        </label>
        <br />

        <button type="submit">Log In</button>
    </form>
</template>

<style lang="css" scoped>
.error {
    color: red;
}
</style>