import { createApp } from 'vue';

import 'primeicons/primeicons.css';
import './style.css';
import App from './App.vue';
import { router } from './router';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { AutoComplete, Checkbox, Divider, FileUpload, Image, ProgressSpinner } from 'primevue';
import Card from 'primevue/card';
import Fieldset from 'primevue/fieldset';
import Select from 'primevue/select';
import Menubar from 'primevue/menubar';
import FloatLabel from 'primevue/floatlabel';
import InputNumber from 'primevue/inputnumber';
import DatePicker from 'primevue/datepicker';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';

const app = createApp(App);

app.use(router);
app.use(createPinia());

app.use(PrimeVue, {
    ripple: true,
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: 'light',
            cssLayer: false
        }
    }
});
app.component('InputText', InputText);
app.component('Button', Button);
app.component('Message', Message);
app.component('ProgressSpinner', ProgressSpinner);
app.component('Card', Card);
app.component('Fieldset', Fieldset);
app.component('Select', Select);
app.component('Menubar', Menubar);
app.component('FloatLabel', FloatLabel);
app.component('InputNumber', InputNumber);
app.component('Image', Image);
app.component('FileUpload', FileUpload);
app.component('AutoComplete', AutoComplete);
app.component('DatePicker', DatePicker);
app.component('Checkbox', Checkbox);
app.component('Divider', Divider);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('ColumnGroup', ColumnGroup);
app.component('Row', Row);

app.mount('#app');