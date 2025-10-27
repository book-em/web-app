<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { UserAPI, UserRole, type UserChangePasswordDTO, type UserDTO, type UserUpdateDTO } from '../../api/user.api';
import type { AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '../../stores/auth-store';
import { useRouter } from 'vue-router';
import { allowedTypesByRole, NotificationAPI, NotificationType, type NotificationPreferencesDTO } from '../../api/notification.api';

const router = useRouter();
const auth = useAuthStore();
const user = ref<UserDTO>();

const preferences = ref<NotificationPreferencesDTO | null>(null);

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
const typeLabels: Record<NotificationType, string> = {
  [NotificationType.ReservationRequested]: "Reservation Requested",
  [NotificationType.ReservationCancelled]: "Reservation Cancelled",
  [NotificationType.ReservationAccepted]: "Reservation Accepted",
  [NotificationType.ReservationDeclined]: "Reservation Declined",
  [NotificationType.HostReviewed]: "Host Reviewed",
  [NotificationType.RoomReviewed]: "Room Reviewed",
};

const warning = ref('');
const error = ref('');
const errorDelete = ref('');
const errorPassword = ref('');
const errorPreferences = ref('');
const formDetailsLoading = ref(false);
const formPasswordLoading = ref(false);
const formDeleteLoading = ref(false);
const preferencesLoading = ref(false);

const usernameIsDifferent = () => user.value?.username != formDTO.value.username;

onMounted(() => {
    auth.checkLocalStorage();

    const myId = auth.id;

    UserAPI.findById(myId).then((res: AxiosResponse<UserDTO>) => {
        user.value = res.data;
        formDTO.value = { ...user.value };
        formPasswordDTO.value.id = user.value.id;
    }).catch((err) => { });

    NotificationAPI.getPreferences().then((res: AxiosResponse<NotificationPreferencesDTO>) => {
        preferences.value = res.data;
        console.log("loaded preferences:");
        console.log(preferences.value);
    }).catch((err) => {
        errorPreferences.value = "Failed to load preferences.";
     });

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
        errorPassword.value = "Passwords do not match";
        return;
    }
    if (dto.oldPassword == dto.newPassword) {
        errorPassword.value = "New password must be different";
        return;
    }

    errorPassword.value = "";
    formPasswordLoading.value = true;

    UserAPI.changePassword(dto).then((_: AxiosResponse<null>) => {
    }).catch((err: AxiosError) => {
        if (err.response?.status == 400) {
            console.error(err);
            errorPassword.value = "Could not change password";
        } else if (err.response?.status == 401) {
            errorPassword.value = "Wrong password";
        } else {
            console.error(err);
            errorPassword.value = "Unknown error. Check the console";
        }
    }).finally(() => {
        formPasswordLoading.value = false;
    });
}

const doUpdatePreferences = () => {
    if (!preferences.value) return;

    errorPreferences.value = '';
    preferencesLoading.value = true;

    NotificationAPI.updatePreferences(preferences.value).then((res: AxiosResponse<NotificationPreferencesDTO>) => {
        preferences.value = res.data;
        console.log("updated preferences:");
        console.log(preferences.value);
    }).catch((err) => {
        errorPreferences.value = "Failed to load preferences.";
    });
    preferencesLoading.value = false;
};

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
                <FloatLabel variant="in">
                    <InputText type="text" @input="duringUsernameChange" v-model.trim="formDTO!.username" fluid />
                    <label>Username</label>
                </FloatLabel>

                <FloatLabel variant="in">
                    <InputText type="email" v-model.trim="formDTO!.email" fluid />
                    <label>Email</label>
                </FloatLabel>

                <FloatLabel variant="in">
                    <InputText type="text" v-model.trim="formDTO!.name" fluid />
                    <label>Name</label>
                </FloatLabel>

                <FloatLabel variant="in">
                    <InputText type="text" v-model.trim="formDTO!.surname" fluid />
                    <label>Surname</label>
                </FloatLabel>

                <FloatLabel variant="in">
                    <InputText type="text" v-model.trim="formDTO!.address" fluid />
                    <label>Address</label>
                </FloatLabel>

                <Message v-show="error.length > 0" severity="error" size="small" variant="simple">{{ error }}</Message>
                <Message v-show="warning.length > 0" severity="warn" size="small" variant="simple">{{ warning }}
                </Message>

                <Button class="btn" type="submit" severity="success" :disabled="formDetailsLoading">
                    Update settings
                </Button>
            </Fieldset>
        </div>
    </Form>

    <Form @submit.prevent="doUpdatePreferences" class="center">
        <div class="form-div">
            <Fieldset legend="Choose what notifications you will receive">
            <div v-if="preferences" class="preferences-container">
                <div v-for="(enabled, type) in preferences.enabledTypes" :key="type" class="preference-row">
                    <span class="pref-label">{{ typeLabels[type as NotificationType] || type }}</span>

                    <label class="switch">
                        <input
                        type="checkbox"
                        :checked="enabled"
                        @change="(e) => preferences.enabledTypes[type] = (e.target as HTMLInputElement).checked"
                        />
                        <span class="slider"></span>
                    </label>
                </div>
            </div>

            <Message v-if="!preferences" severity="info" size="small" variant="simple">
                Loading your preferences...
            </Message>

            <Button
                class="btn purple-btn"
                type="submit"
                severity="info"
                :disabled="!preferences">
                Update Preferences
            </Button>
            </Fieldset>
        </div>
    </Form>


    <Form @submit.prevent="doChangePassword" class="center">
        <div class="form-div">
            <Fieldset legend="Change password">
                <FloatLabel variant="in">
                    <InputText type="password" v-model.trim="formPasswordDTO!.oldPassword" fluid />
                    <label>Old password</label>
                </FloatLabel>

                <FloatLabel variant="in">
                    <InputText type="password" v-model.trim="formPasswordDTO!.newPassword" fluid />
                    <label>New password</label>
                </FloatLabel>

                <FloatLabel variant="in">
                    <InputText type="password" v-model.trim="formPasswordDTO!.newPasswordConfirm" fluid />
                    <label>Confirm password</label>
                </FloatLabel>

                <Message v-show="errorPassword.length > 0" severity="error" size="small" variant="simple">{{
                    errorPassword }}</Message>

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

.preferences-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.preference-row {
   display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9fafb;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.pref-label {
  font-weight: 500;
  color: #111827;
  font-size: 1rem;
}

/* --- Toggle Switch Styling --- */
.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db; /* gray-300 */
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #8b5cf6; /* purple */
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.purple-btn {
  background-color: #8b5cf6 !important; /* violet-500 */
  border-color: #7c3aed !important;
  color: white !important;
}

.purple-btn:hover {
  background-color: #7c3aed !important;
}


</style>