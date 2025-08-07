<script setup lang="ts">

</script>

<template>
    <nav class="navbar">
        <ul>
            <li>
                <RouterLink to="/"><strong>Book'em</strong></RouterLink>
            </li>
            <li>
                <RouterLink to="/login">Login</RouterLink>
            </li>
            <li>
                <RouterLink to="/register">Register</RouterLink>
            </li>
        </ul>
    </nav>
</template>

<style lang="css" scoped>
ul {
    list-style: circle;
}
</style>