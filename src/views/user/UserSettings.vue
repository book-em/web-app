<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { UserAPI, UserRole, type UserChangePasswordDTO, type UserDTO, type UserUpdateDTO } from '../../api/user.api';
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
const formPasswordDTO = ref<UserChangePasswordDTO>({
    id: 0,
    oldPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
});
const error = ref('');
const warning = ref('');
const errorDelete = ref('');
const formDetailsLoading = ref(false);
const formPasswordLoading = ref(false);
const formDeleteLoading = ref(false);

const usernameIsDifferent = () => user.value?.username != formDTO.value.username;

onMounted(() => {
    auth.checkLocalStorage();

    const myId = auth.id;

    UserAPI.findById(myId).then((res: AxiosResponse<UserDTO>) => {
        user.value = res.data;
        formDTO.value = { ...user.value };
        formPasswordDTO.value.id = user.value.id;
    }).catch((err) => { });
});

const doUpdateUserInfo = () => {
    const dto = formDTO.value;

    error.value = "";
    formDetailsLoading.value = true;

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
    }).finally(() => {
        formDetailsLoading.value = false;
    });
}

const doChangePassword = () => {
    const dto = formPasswordDTO.value;

    if (dto.newPassword != dto.newPasswordConfirm) {
        error.value = "Passwords do not match";
        return;
    }
    if (dto.oldPassword == dto.newPassword) {
        error.value = "New password must be different";
        return;
    }

    error.value = "";
    formPasswordLoading.value = true;

    UserAPI.changePassword(dto).then((_: AxiosResponse<null>) => {
    }).catch((err: AxiosError) => {
        if (err.response?.status == 400) {
            console.error(err);
            error.value = "Could not change password";
        } else if (err.response?.status == 401) {
            error.value = "Wrong password";
        } else {
            console.error(err);
            error.value = "Unknown error. Check the console";
        }
    }).finally(() => {
        formPasswordLoading.value = false;
    });
}

const duringUsernameChange = () => {
    if (usernameIsDifferent()) {
        warning.value = "You are changing your username, so you will be signed out after this.";
    } else {
        warning.value = "";
    }
}

const doDeleteUser = () => {
    errorDelete.value = '';

    formDeleteLoading.value = true;

    UserAPI.deleteById(auth.id).then(() => {
        auth.logout();
        router.push("/");
    }).catch((err: AxiosError) => {
        errorDelete.value = err.response.data as string;
        console.error(err);
    }).finally(() => {
        formDeleteLoading.value = false;
    });
}

</script>

<template>
    <Form @submit.prevent="doUpdateUserInfo" class="center">
        <div class="form-div">
            <Fieldset legend="Your settings">
                <InputText type="text" placeholder="Username" @input="duringUsernameChange"
                    v-model.trim="formDTO!.username" fluid />
                <InputText type="email" placeholder="user@email.com" v-model.trim="formDTO!.email" fluid />
                <InputText type="text" placeholder="Name" v-model.trim="formDTO!.name" fluid />
                <InputText type="text" placeholder="Surname" v-model.trim="formDTO!.surname" fluid />
                <InputText type="text" placeholder="Address" v-model.trim="formDTO!.address" fluid />

                <Message v-show="error.length > 0" severity="error" size="small" variant="simple">{{ error }}</Message>
                <Message v-show="warning.length > 0" severity="warn" size="small" variant="simple">{{ warning }}
                </Message>

                <Button class="btn" type="submit" severity="success" :disabled="formDetailsLoading">
                    Update settings
                </Button>
            </Fieldset>
        </div>
    </Form>

    <Form @submit.prevent="doChangePassword" class="center">
        <div class="form-div">
            <Fieldset legend="Change password">
                <InputText type="password" placeholder="Old password" v-model.trim="formPasswordDTO!.oldPassword"
                    fluid />
                <InputText type="password" placeholder="New password" v-model.trim="formPasswordDTO!.newPassword"
                    fluid />
                <InputText type="password" placeholder="Confirm password"
                    v-model.trim="formPasswordDTO!.newPasswordConfirm" fluid />

                <Message v-show="error.length > 0" severity="error" size="small" variant="simple">{{ error }}</Message>

                <Button class="btn" type="submit" severity="info" :disabled="formPasswordLoading">
                    Change password
                </Button>
            </Fieldset>
        </div>
    </Form>

    <Form @submit.prevent="doDeleteUser" class="center">
        <div class="form-div">
            <Fieldset legend="Delete user" class="panic">
                <template v-if="auth.role == UserRole.Guest">
                    You will not be able to delete your account if you have active reservations.
                </template>
                <template v-else-if="auth.role == UserRole.Host">
                    You will not be able to delete your account if any of your rooms have active reservations.
                </template>

                <template v-if="auth.role == UserRole.Admin">
                    Administrators cannot delete their accounts.
                </template>
                <template v-else>
                    <br />
                    <br />

                    <Message v-show="errorDelete.length > 0" severity="error" size="small" variant="simple">
                        {{ errorDelete }}
                    </Message>

                    <Button class="btn" type="submit" severity="danger" :disabled="formDeleteLoading">
                        Delete my account
                    </Button>
                </template>
            </Fieldset>
        </div>
    </Form>
</template>

<style lang="css" scoped>
.center {
    margin: auto;
    width: 60%;
    margin-top: 1em;
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


:deep(.panic .p-fieldset-legend-label) {
    color: var(--p-red-500);
}

.panic button {
    float: right;
}
</style>