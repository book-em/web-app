<script setup lang="ts">
import { ref } from 'vue';
import { AuthAPI, type LoginRequestDTO, type LoginResponseDTO } from '../../api/auth.api';
import type { AxiosError, AxiosResponse } from 'axios';
import { setJWT } from '../../api/localstorage';
import { useRouter } from 'vue-router';

const router = useRouter();
const formUsernameOrEmail = ref('');
const formPassword = ref('');
const error = ref('');

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
        setJWT(jwt);
        router.push('/');
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