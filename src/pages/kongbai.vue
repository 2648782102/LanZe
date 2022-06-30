<template>
  
</template>

<script>
import { useRouter } from "vue-router";

export default {
    name: 'kongbai',
    setup() {
        const $router = useRouter()
        function abc() {
            $router.back()
        }

        abc()
    }
}
</script>

<style>

</style>