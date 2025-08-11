<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { AuthAPI, type RegisterRequestDTO, type LoginRequestDTO, type LoginResponseDTO } from '../../api/auth.api';
import type { AxiosError, AxiosResponse } from 'axios';
import { setJWT } from '../../api/localstorage';
import { UserRole, type UserDTO } from '../../api/user.api';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth-store';
import { Form } from '@primevue/forms';

const auth = useAuthStore();
const router = useRouter();
const formConfirmPassword = ref('');
const formDTO = ref<RegisterRequestDTO>({
    username: "",
    email: "",
    password: "",
    name: "",
    surname: "",
    address: "",
    role: UserRole.Guest,
});
const error = ref('');
const loading = ref(false);

const rolesAvailable = [
    { label: 'Guest', value: UserRole.Guest },
    { label: 'Host', value: UserRole.Host },
    { label: 'Admin', value: UserRole.Admin }
];

onMounted(() => {
    auth.checkLocalStorage();
});

const validateForm = (): string => {
    const isEmpty = (s: string) => {
        return s == null || s == undefined || s.trim().length == 0;
    }

    if (isEmpty(formDTO.value.username)) return "Username must not be empty";
    if (isEmpty(formDTO.value.email)) return "Email must not be empty";
    if (isEmpty(formDTO.value.password)) return "Password must not be empty";

    if (formDTO.value.password != formConfirmPassword.value) return "Passwords do not match";

    return "";
}

const doRegister = () => {
    const dto = formDTO.value;

    error.value = validateForm();

    if (error.value != "") {
        return;
    }
    error.value = "";
    loading.value = true;

    AuthAPI.register(dto).then((_: AxiosResponse<UserDTO>) => {
        loginAsNewlyCreatedUser(dto.username, dto.password);
    }).catch((err: AxiosError) => {
        if (err.response?.status == 400) {
            console.error(err);
            error.value = "Could not create an account";
        } else if (err.response?.status == 409) {
            error.value = "Username or email taken";
        } else {
            console.error(err);
            error.value = "Unknown error. Check the console";
        }
    }).finally(() => {
        loading.value = false;
    });;
}

const loginAsNewlyCreatedUser = (username: string, password: string) => {
    const loginDto: LoginRequestDTO = { usernameOrEmail: username, password: password };
    AuthAPI.login(loginDto).then((resLogin: AxiosResponse<LoginResponseDTO>) => {
        const jwt = resLogin.data.jwt;
        auth.login(jwt);
        router.push('/');
    }).catch((_: AxiosError) => {

    });
}

</script>

<template>
    <div class="login-background">
        <Card class="center">
            <template #title>
                <h2>Create an account</h2>
            </template>
            <template #content>
                <Form @submit="doRegister">
                    <div class="form-div">
                        <Fieldset legend="Account info">
                            <InputText type="text" placeholder="Username" v-model.trim="formDTO!.username" fluid />
                            <InputText type="email" placeholder="user@email.com" v-model.trim="formDTO!.email" fluid />
                            <InputText type="password" placeholder="Password" v-model.trim="formDTO!.password" fluid />
                            <InputText type="password" placeholder="Confirm password" v-model.trim="formConfirmPassword"
                                fluid />
                            <Select v-model="formDTO!.role" :options="rolesAvailable" optionLabel="label"
                                optionValue="value" placeholder="Select a role" />
                        </Fieldset>


                        <Fieldset legend="Personal info">
                            <div class="inline-fields">
                                <InputText type="text" placeholder="Name" v-model.trim="formDTO!.name" fluid />
                                <InputText type="text" placeholder="Surname" v-model.trim="formDTO!.surname" fluid />
                            </div>
                            <InputText type="text" placeholder="Address" v-model.trim="formDTO!.address" fluid />
                        </Fieldset>


                        <Button class="btn" type="submit" severity="success" :disabled="loading">
                            Register
                        </Button>

                        <Message v-show="error.length > 0" severity="error" size="small" variant="simple">{{ error }}
                        </Message>
                    </div>
                </Form>
            </template>
            <template #footer>
                <RouterLink class="text-center mt" to="/login">Or sign in</RouterLink>
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
    background-image: url('/bg-houses.jpg');
    background-position: center;
    z-index: -100;
    background-position: 8px -22px;
}

.center {
    margin: auto;
    width: 40%;
    background-color: rgba(255, 255, 255, 0.85);
    margin-top: 2em;
    padding: 0em 2em;
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

.form-div * {
    margin-top: 0.25em;
}

.form-div .btn {
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-top: 1em;
    width: 32%;
}

.inline-fields {
    display: flex;
    gap: 1em;
}

.inline-fields>* {
    flex: 1;
}
</style>