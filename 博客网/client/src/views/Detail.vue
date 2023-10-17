<template>
    <div class="container">
        
        <n-button @click="back">返回</n-button>

        <!--标题-->
        <n-h1>{{ blogInfo.title }}</n-h1>
        <!--文章内容-->
        <div class="blog-content">
            <div v-html="blogInfo.content"></div>
        </div>


        <h1>评论</h1>

        <div >
            <div class="textIn">
              <n-space justify="space-around" >
                <n-avatar
                round
                :size="55"
                src="/tx.jpg"
                />

                <n-scrollbar style="max-height: 120px"> 
                    <n-input 
                    type="textarea" 
                    maxlength="300" 
                    v-model:value="value" 
                    :autosize="{
                      minRows: 2,
                      maxRows: 3
                    }"
                    class="user_talk get_focus"  
                    show-count
                    clearable />
                </n-scrollbar>

                <n-button type="primary" class="submit" @click="talkTo"> 
                    发 布
                </n-button>

              </n-space>
            </div>  
            
            <div class="textShow" v-for="(item,index) in CommentList">
                <n-space justify="space-around">
                  <n-avatar
                  round
                  :size="55"
                  v-model:src=" userComment.img "
                  />
                    
                  <n-card :title="item.user_account" class="n-card">
                    {{ item.text }}
                  </n-card>
                </n-space> 
            </div>   
            <n-divider/>  
    </div>
        

    </div>
</template>

<script setup>

import { ref,reactive,inject,onMounted,computed } from 'vue'
import { useRouter,useRoute } from 'vue-router'
// import Comment from '../components/Comment.vue'
import { EllipsisVertical } from '@vicons/ionicons5'
import { UserStore} from '../stores/UserStore'

const userStore = UserStore()
const router = useRouter()
const route = useRoute()
const axios = inject("axios")
const message = inject("message")

const blogInfo = ref({})
const CommentList = ref([])
const userComment = ref([])
let value = ref()

onMounted(() => {
    loadBlog()
    loadComments()
})

const loadBlog = async () => {
    let res = await axios.get("/blog/detail?id="+route.query.id)
    blogInfo.value = res.data.rows[0]
}

const loadComments = async () =>{
  console.log(userStore.account);
  let result = await axios.post('/comment/searchComment',{
    article:route.query.id,
    account:userStore.account
  })

  CommentList.value = result.data.data.rows
  
  // for(let i=0; i<CommentList.value.length; i++){
  //   let userResult = await axios.get(`/comment/searchUser?user_account=${CommentList.value[i].user_account}`)
  //   console.log(userResult.data.data.rows);
  //   userComment.value = userResult.data.data.rows
  // }
}

const back = () => {
    router.push("/")
}


const talkTo = async() => {
  let result = await axios.post('/comment/addComment',{
    article:route.query.id,
    content:value.value,
    user_account:userStore.account
  })

  if(result.data.code == 200){
    console.log(123456);
    loadComments()
  }else{

  }
}
</script>

<style>
.blog-content img{
    max-width: 100% !important;
}
</style>

<style lang="scss" scoped>

.container{
    width: 1200px;
    margin: 0 auto;
}

.textIn{
  margin-bottom: 65px;
}

.user_talk{
  width: 980px;
  resize: none;
}




.submit{
  float: right;
  height: 60px;
  width: 60px;
  font-size: 15px;
}

.textShow{
  margin-bottom: 30px;
}

.n-card {
  width: 1080px;
}


</style>