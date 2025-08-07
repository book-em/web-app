<script setup lang="ts">
import { ref } from 'vue';
import { AuthAPI, type RegisterRequestDTO, type LoginRequestDTO, type LoginResponseDTO } from '../../api/auth.api';
import type { AxiosError, AxiosResponse } from 'axios';
import { setJWT } from '../../api/localstorage';
import { UserRole, type UserDTO } from '../../api/user.api';
import { useRouter } from 'vue-router';

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

    AuthAPI.register(dto).then((_: AxiosResponse<UserDTO>) => {
        loginAsNewlyCreatedUser(dto.username, dto.password);
    }).catch((err: AxiosError) => {
        if (err.response?.status == 400) {
            error.value = "Could not create an account";
        } else {
            console.error(err);
            error.value = "Unknown error. Check the console";
        }
    });
}

const loginAsNewlyCreatedUser = (username: string, password: string) => {
    const loginDto: LoginRequestDTO = { usernameOrEmail: username, password: password };
    AuthAPI.login(loginDto).then((resLogin: AxiosResponse<LoginResponseDTO>) => {
        const jwt = resLogin.data.jwt;
        setJWT(jwt);
        router.push('/');
    }).catch((_: AxiosError) => {

    });
}

</script>

<template>
    <p v-if="error.length > 0" class="error">
        {{ error }}
    </p>

    Register
    <form @submit.prevent="doRegister">
        <label> <input v-model.trim="formDTO!.username" type="text" /> Username</label><br />
        <label> <input v-model.trim="formDTO!.email" type="email" /> Email</label><br />
        <label> <input v-model.trim="formDTO!.password" type="password" /> Password</label><br />
        <label> <input v-model.trim="formConfirmPassword" type="password" /> Confirm Password</label><br />
        <label> <input v-model.trim="formDTO!.name" type="text" /> Name</label><br />
        <label> <input v-model.trim="formDTO!.surname" type="text" /> Surname</label><br />
        <label> <input v-model.trim="formDTO!.address" type="text" /> Address</label><br />
        <label>
            <select v-model="formDTO!.role">
                <option disabled value="">Please select one</option>
                <option>{{ UserRole.Host }}</option>
                <option>{{ UserRole.Guest }}</option>
                <option>{{ UserRole.Admin }}</option>
            </select> Role
        </label><br />

        <button type="submit">Register</button>
    </form>
</template>

<style lang="css" scoped>
.error {
    color: red;
}
</style>