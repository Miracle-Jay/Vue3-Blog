<template>
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
                  src="/tx.jpg"
                  />
 
                  <n-card :title="item.user_account" class="n-card">
                    {{ item.text }}
                  </n-card>
                </n-space> 
            </div>   
            <n-divider/>  
    </div>
</template>

<script setup>
import { EllipsisVertical } from '@vicons/ionicons5'
import { ref,reactive,inject,onMounted,computed } from 'vue'
import { useRouter,useRoute } from 'vue-router'
import { UserStore} from '../stores/UserStore'

const userStore = UserStore()
const router = useRouter()
const route = useRoute()
const axios = inject("axios")
const message = inject("message")

const options = [{label:"删除"}]

let CommentList = ref([])

let value = ref()

onMounted(()=>{
  loadComments()
}) 

const loadComments = async () =>{
  console.log(route.query.id);
  let result = await axios.get(`/comment/searchComment?article=${route.query.id}`)
  CommentList = result.data.data.rows
  console.log(CommentList);
}

const talkTo = async() => {
  let result = await axios.post('/comment/addComment',{
    article:route.query.id,
    content:value.value,
    user_account:userStore.id
  })

  if(result.data.code == 200){
    console.log(123456);
    loadComments()
  }else{

  }
}

</script>

<style lang="scss" scoped>

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