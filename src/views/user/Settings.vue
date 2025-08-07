<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { UserAPI, type UserDTO, type UserUpdateDTO } from '../../api/user.api';
import type { AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '../../stores/auth-store';
import { useRouter } from 'vue-router';

const router = useRouter();
const auth = useAuthStore();
const user = ref<UserDTO>();
const formDTO = ref<UserUpdateDTO>({
    id: 0,
    username: "",
    email: "",
    name: "",
    surname: "",
    address: "",
});
const error = ref('');
const warning = ref('');

const usernameIsDifferent = () => user.value?.username != formDTO.value.username;

onMounted(() => {
    auth.checkLocalStorage();
});

onMounted(() => {
    const myId = auth.id;

    UserAPI.findById(myId).then((res: AxiosResponse<UserDTO>) => {
        user.value = res.data;
        formDTO.value = { ...user.value };
    }).catch((err) => { });
});

const doUpdateUserInfo = () => {
    const dto = formDTO.value;

    error.value = "";

    UserAPI.update(dto).then((_: AxiosResponse<null>) => {
        if (usernameIsDifferent()) {
            auth.logout();
            router.push("/");
        }
    }).catch((err: AxiosError) => {
        if (err.response?.status == 400) {
            console.error(err);
            error.value = "Could not change user details";
        } else if (err.response?.status == 409) {
            error.value = "Username or email taken";
        } else {
            console.error(err);
            error.value = "Unknown error. Check the console";
        }
    });
}

const duringUsernameChange = () => {
    if (usernameIsDifferent()) {
        warning.value = "You are changing your username, so you will be signed out after this.";
    } else {
        warning.value = "";
    }
}

</script>

<template>
    <p v-if="error.length > 0" class="error">
        {{ error }}
    </p>

    Your settings

    <form @submit.prevent="doUpdateUserInfo">
        <label> <input @input="duringUsernameChange" v-model.trim="formDTO!.username" type="text" />
            Username</label><br />
        <label> <input v-model.trim="formDTO!.email" type="email" /> Email</label><br />
        <label> <input v-model.trim="formDTO!.name" type="text" /> Name</label><br />
        <label> <input v-model.trim="formDTO!.surname" type="text" /> Surname</label><br />
        <label> <input v-model.trim="formDTO!.address" type="text" /> Address</label><br />

        <p v-if="warning.length > 0" class="warning">
            {{ warning }}
        </p>

        <button type="submit">Update</button>
    </form>

</template>

<style lang="css" scoped>
.error {
    color: red;
}

.warning {
    color: orange;
}
</style>