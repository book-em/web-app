import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { router } from './router';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { ProgressSpinner } from 'primevue';
import Card from 'primevue/card';

const app = createApp(App);

app.use(router);
app.use(createPinia());

app.use(PrimeVue, {
    ripple: true,
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: 'system',
            cssLayer: false
        }
    }
});
app.component('InputText', InputText);
app.component('Button', Button);
app.component('Message', Message);
app.component('ProgressSpinner', ProgressSpinner);
app.component('Card', Card);


app.mount('#app');