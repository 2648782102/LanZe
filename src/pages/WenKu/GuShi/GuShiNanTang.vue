<template>
    <section>
        <el-carousel height="92vh" direction="vertical" :autoplay="false">
            <el-carousel-item>
                <GuShiDiv :address="'nantang'" :title="book[0].title" :author="book[0].author" :age="book[0].age"
                    :synopsis="book[0].synopsis" />
            </el-carousel-item>
        </el-carousel>
    </section>
</template>

<script>
    import GuShiDiv from "../../../components/GuShiDiv.vue";

    export default {
        name: "GuShiNanTang",
        components: {
            GuShiDiv,
        },
        setup() {
            // 封面固定组件传值数组
            const book = [
                {
                    title: "南唐主二词",
                    author: "杨敏如",
                    age: "南宋",
                    synopsis:
                        "《南唐二主词》，系南唐中主李璟、后主李煜撰。约成书于南宋，后世续有辑补，又有后人编写了各种版本；现在流行的则为《南唐二主词校订》。",
                },
            ];

            return {
                book,
            };
        },
    };
</script>

<style scoped>
    * {
        box-sizing: border-box;
    }

    section {
        width: 100%;
        height: 100%;
    }

    .el-carousel {
        border-radius: 10px;
    }
</style>