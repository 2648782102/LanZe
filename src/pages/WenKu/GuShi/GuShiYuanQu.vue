<template>
    <div v-loading="loading" class="body">
        <button class="btnYuan" @click="yuanquClick">元曲</button>
    </div>
</template>

<script>
    import axios from 'axios'
    import { useRouter } from 'vue-router'
    import { ref } from 'vue'

    export default {
        name: 'GuShiYuanQu',
        setup() {
            const $router = useRouter()

            // 加载控制
            let loading = ref(false)

            function yuanquClick() {
                loading.value = true
                axios.get('https://lanze-node.vercel.app/api/yuanqu')
                    .then(response => {
                        loading.value = false
                        let chuciArr = JSON.stringify(response.data.splice(0, 1100))
                        $router.push({
                            name: 'searchul',
                            query: {
                                ulArr: chuciArr
                            }
                        })
                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            }

            return {
                yuanquClick,
                loading
            }
        }
    }
</script>

<style scoped>
    .body {
        width: 100%;
        min-height: 80vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .btnYuan {
        width: 400px;
        height: 200px;
        border: none;
        color: #5b99af;
        font-weight: 600;
        font-size: 3rem;
        border-radius: 50px;
        background-color: white;
        background: linear-gradient(145deg, #e6e6e6, #ffffff);
        box-shadow: 20px 20px 60px #d9d9d9,
            -20px -20px 60px #ffffff;
    }
</style>