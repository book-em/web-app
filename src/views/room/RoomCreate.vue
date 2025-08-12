<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { UserAPI, UserRole, type UserChangePasswordDTO, type UserDTO, type UserUpdateDTO } from '../../api/user.api';
import type { AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '../../stores/auth-store';
import { useRouter } from 'vue-router';
import { RoomAPI, type RoomCreateDTO, type RoomDTO } from '../../api/room.api';
import type { FileUploadSelectEvent } from 'primevue/fileupload';

const router = useRouter();
const auth = useAuthStore();
const user = ref<UserDTO>();
const formDTO = ref<RoomCreateDTO>({
    hostID: 0,
    name: '',
    description: '',
    address: '',
    minGuests: 1,
    maxGuests: 5,
    photosPayload: [],
    commodities: []
});

const warning = ref('');
const error = ref('');
const formLoading = ref(false);

const handleFiles = (event: FileUploadSelectEvent) => {
    const files = event.files as File[];

    files.forEach((file: File) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                formDTO.value!.photosPayload.push(result);
            };
            reader.readAsDataURL(file);
        }
    });
}

const removeImage = (index: number) => {
    formDTO.value!.photosPayload.splice(index, 1);
}

onMounted(() => {
    auth.checkLocalStorage();

    const myId = auth.id;

    UserAPI.findById(myId).then((res: AxiosResponse<UserDTO>) => {
        user.value = res.data;
    }).catch((err) => { });
});

const doCreate = () => {
    let dto = {...formDTO.value};
    dto.hostID = user.value.id;

    error.value = "";
    formLoading.value = true;

    RoomAPI.create(dto).then((res: AxiosResponse<RoomDTO>) => {
        console.log(res.data);
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
        formLoading.value = false;
    });
}

</script>

<template>
    <Form @submit.prevent="doCreate" class="center">
        <div class="form-div">
            <Fieldset legend="Create new room">
                <FloatLabel variant="in">
                    <InputText type="text" v-model.trim="formDTO!.name" fluid />
                    <label>Name</label>
                </FloatLabel>

                <FloatLabel variant="in">
                    <InputText type="text" v-model.trim="formDTO!.description" fluid />
                    <label>Description</label>
                </FloatLabel>

                <FloatLabel variant="in">
                    <InputText type="text" v-model.trim="formDTO!.address" fluid />
                    <label>Address</label>
                </FloatLabel>

                <FloatLabel variant="in">
                    <InputNumber :min="1" :max="formDTO!.maxGuests" v-model.trim="formDTO!.minGuests" fluid />
                    <label>Min guests</label>
                </FloatLabel>

                <FloatLabel variant="in">
                    <InputNumber :min="formDTO!.minGuests" v-model.trim="formDTO!.maxGuests" fluid />
                    <label>Max guests</label>
                </FloatLabel>

                <Message v-show="error.length > 0" severity="error" size="small" variant="simple">{{ error }}</Message>
                <Message v-show="warning.length > 0" severity="warn" size="small" variant="simple">{{ warning }}
                </Message>

                <div class="image-uploader">
                    <FileUpload
                        name="images[]"
                        mode="basic"
                        accept="image/png,image/jpg,image/jpeg"
                        multiple
                        customUpload
                        @select="handleFiles"
                        :auto="false"
                        chooseLabel="Upload Images"
                        class="p-mb-3"
                        />

                    <div class="preview-grid">
                        <div v-for="(img, index) in formDTO.photosPayload" :key="index" class="preview-item">
                            <Image :src="img" alt="Preview" preview />
                            <button type="button" @click="removeImage(index)" :disabled="formLoading">Remove</button>
                        </div>
                    </div>
                </div>

                <Button class="btn" type="submit" severity="success" :disabled="formLoading">
                    Create
                </Button>
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

.preview-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 10px;
}

.preview-item {
    position: relative;
    width: 220px;
    height: 220px;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

.preview-item :deep(.p-image img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    }

.preview-item button {
    position: absolute;
    top: 16px;
    right: 4px;
    background: rgba(255, 0, 0, 0.7);
    color: white;
    border: none;
    padding: 2px 6px;
    font-size: 12px;
    cursor: pointer;
    border-radius: 4px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
}
</style>