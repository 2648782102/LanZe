<template>
  <article>
    <h1>{{ title }}</h1>
    <h2>作者&代表人物: {{ author }}</h2>
    <h3>年代：{{ age }}</h3>
    <h3>简介: {{ synopsis }}</h3>
    <button v-loading="loading" class="btn-go" @click="goClick" v-text="address?'开始鉴赏':'未添加'"></button>
  </article>
</template>

<script>
  import axios from "axios";
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import { createClient } from '@supabase/supabase-js';

  const supabaseUrl = 'https://caqm0ri5g6h17oismvp0.baseapi.memfiredb.com'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImV4cCI6MzE5Mzk3MzkyOSwiaWF0IjoxNjU2MDUzOTI5LCJpc3MiOiJzdXBhYmFzZSJ9.pDkmh4NNw19c9lJIQUpidkadJHrKhlsB-e3ZdHGD6tA'
  const supabase = createClient(supabaseUrl, supabaseKey)

  export default {
    name: 'GuShiDiv',
    props: ['title', 'author', 'age', 'synopsis', 'address'],
    setup(props) {

      const $router = useRouter()

      // 加载控制
      let loading = ref(false)

      // let gettitle = null      // 获取到的诗词信息存储数组

      async function asyncFunc() {

        if(props.address) {

        loading.value = true        //加载动画启动

        let { data: response, error } = await supabase           // 请求数据
        .from(props.address)
        .select('*')

        // author:作者   // tag:标签  // poemName:诗名  // textBody:正文

        loading.value = false

        let tangArr = JSON.stringify(response)

        $router.push({
              name: 'searchul',
              query: {
                ulArr: tangArr
              }
            })

        // 老版写法
        // 发送请求获取具体诗词内容
        // axios.get(`https://lanze-node.vercel.app/api/${props.address}`)
        //   .then(response => {
        //     // response.data[0].poemName:诗名   response.data[0].tag:诗集   response.data[0].author:作者
        //     // response.data[0].textBody:正文
        //   })
        //   .catch(function (error) {
        //     console.log(error);
        //   })
          } else {
            alert('未添加此分栏，请等待更新!')
          }
      }

      // 单击鉴赏按钮
      function goClick() {

        asyncFunc();

        // if(props.address) {
        // loading.value = true
        // // 发送请求获取具体诗词内容
        // axios.get(`https://lanze-node.vercel.app/api/${props.address}`)
        //   .then(response => {
        //     loading.value = false
        //     // response.data[0].author:诗名   response.data[0].paragraphs:诗集   response.data[0].rhythmic:作者
        //     // response.data[0].tags:正文
        //     let tangArr = JSON.stringify(response.data)
        //     $router.push({
        //       name: 'searchul',
        //       query: {
        //         ulArr: tangArr
        //       }
        //     })
        //   })
        //   .catch(function (error) {
        //     console.log(error);
        //   })
        //   } else {
        //     alert('未添加此分栏，请等待更新!')
        //   }
      }

      return {
        goClick,
        loading
      }
    }

  }
</script>

<style scoped>
  article {
    position: relative;
    width: 100%;
    height: 100%;
    font-family: FangZhengSong;
    color: rgb(255, 255, 255);
    border-radius: 0.4rem;
    background-position: 0 bottom;
    background-repeat: no-repeat;
    cursor: pointer;
    transition: 0.6s;
    overflow: hidden;
    text-shadow: 8px 8px 5px rgba(0, 0, 0, 0.2);
    padding: 40px;
    /* background-image: url(../assets/beijing/k.webp);
    background-size: 100% 130%; */
    /* background-image: linear-gradient(to top, #30cfd0 0%, #330867 100%); */
    background-image: linear-gradient(15deg, #13547a 0%, #80d0c7 100%);
  }

  article>h1 {
    font-size: 4rem;
  }

  .btn-go {
    border: none;
    width: 10rem;
    height: 5rem;
    font-size: 1.4rem;
    font-family: FangZhengSong;
    color: white;
    border-radius: 19px;
    background-color: rgba(255, 255, 255, 0.249);
    box-shadow: 0.3rem 0.3rem 0.5rem rgba(0, 0, 0, 0.3);
    position: absolute;
    bottom: 3rem;
    right: 3rem;
    overflow: hidden;
    transition: 0.6s;
  }
  .btn-go:hover {
      transition: 0.8s;
      box-shadow: -0.2rem -0.2rem 0.2rem rgba(0, 0, 0, 0.3);
  }
</style>