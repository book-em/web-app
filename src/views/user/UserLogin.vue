<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { AuthAPI, type LoginRequestDTO, type LoginResponseDTO } from '../../api/auth.api';
import type { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth-store';
import { Form } from '@primevue/forms';

const auth = useAuthStore();
const router = useRouter();
const formUsernameOrEmail = ref('');
const formPassword = ref('');
const error = ref('');
const loading = ref(false);

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
    loading.value = true;

    AuthAPI.login(dto).then((res: AxiosResponse<LoginResponseDTO>) => {
        const jwt = res.data.jwt;
        auth.login(jwt);
        router.push('/');
    }).catch((err: AxiosError) => {
        if (err.response?.status == 400) {
            error.value = "Unknown user or password";
        } else {
            console.error(err);
            error.value = "Unknown error. Check the console";
        }
    }).finally(() => {
        loading.value = false;
    });
}

</script>

<template>
    <div class="login-background">
        <Card class="center">
            <template #title>
                <h2>Login</h2>
            </template>
            <template #content>
                <Form @submit="doLogin">
                    <div class="form-div">
                        <InputText type="text" placeholder="Username or email" v-model.trim="formUsernameOrEmail"
                            fluid />
                        <InputText type="password" placeholder="Password" v-model.trim="formPassword" fluid />

                        <Button class="btn" type="submit" severity="success" :disabled="loading">
                            Log in
                        </Button>

                        <Message v-show="error.length > 0" severity="error" size="small" variant="simple">{{ error }}
                        </Message>
                    </div>
                </Form>
            </template>
            <template #footer>
                <RouterLink class="text-center mt" to="/register">Or create an account</RouterLink>
            </template>
        </Card>
    </div>
</template>

<style lang="css" scoped>
.login-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-image: url('bg-houses.jpg');
    background-position: center;
    z-index: -100;
    background-position: 8px -22px;
}

.center {
    margin: auto;
    width: 40%;
    margin-top: 8em;
    background-color: rgba(255, 255, 255, 0.85);
    padding: 2em;
    border-radius: 10px;
    box-shadow: 16px 32px 32px rgba(0, 0, 0, 0.4);
}

h2 {
    text-align: center;
    font-size: 2em;
}

.text-center {
    display: block;
    text-align: center;
}

.form-div {
    margin-top: 1em;
}

.form-div>* {
    margin-top: 1em;
}

.form-div .btn {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 32%;
}
</style>