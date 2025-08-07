<script setup lang="ts">

</script>

<template>
    <nav class="navbar">
        <ul>
            <li><router-link to="/"><strong>Book'em</strong></router-link></li>
            <li><router-link to="/login">Login</router-link></li>
            <li><router-link to="/register">Register</router-link></li>
        </ul>
    </nav>
</template>

<style lang="css" scoped>
ul {
    list-style: circle;
}
</style>