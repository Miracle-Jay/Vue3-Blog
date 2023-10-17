<template>
    <div class="container">
        <div class="user">
            <n-popover trigger="hover">
                <template #trigger>
                    <n-avatar class="pic" round :size="45" v-model:src=userStore.img @click="showModal = true"/>
                </template>
                <span>点击登录</span>
            </n-popover>
                
                <div class="username show">
                    {{ user.user_account }}

                    <n-popover trigger="hover">
                        <template #trigger>
                            <n-icon size="15" @click="Exit">
                                <ExitOutline />
                            </n-icon>
                        </template>
                        <span>退出登录</span>
                    </n-popover>
                    
                    
                </div>
                
        </div>

        <n-modal v-model:show="showModal" preset="dialog" title="Dialog">
            <template #header>
            <div>
                登录 / 注册
            </div>
            </template>
            <div>
                <n-card content-style="padding: 0;">
                    <n-tabs
                    type="line"
                    size="large"
                    :tabs-padding="20"
                    pane-style="padding: 20px;" 
                    >
                    <n-tab-pane name="登录">
                        <n-form :rules="rules" :model="user">
                            <n-form-item path="user_account" label="账号">
                                <n-input v-model:value="user.user_account" placeholder="请输入账号" style="width: 350px"/>
                            </n-form-item>
                            <n-form-item path="user_password" label="密码">
                                <n-input type="password" v-model:value="user.user_password" placeholder="请输入密码" show-password-on="click" style="width: 350px">
                                    <template #password-visible-icon>
                                        <n-icon :size="16" :component="EyeOutline" />
                                    </template>
                                    <template #password-invisible-icon>
                                        <n-icon :size="16" :component="EyeOffOutline" />
                                    </template>
                                </n-input>
                            </n-form-item>
                        </n-form>
                        <n-checkbox v-model:checked="user.user_rember" label="记住我"/>
                        <n-button @click="userLogin">登录</n-button>
                    </n-tab-pane>
                    <n-tab-pane name="注册">
                        <n-form :rules="rules" :model="user_regist">
                            <n-form-item path="reg_account" label="账号">
                                <n-input v-model:value="user_regist.reg_account" placeholder="请输入账号" style="width: 350px"/>
                            </n-form-item>
                            <n-form-item path="reg_password" label="密码">
                                <n-input v-model:value="user_regist.reg_password" placeholder="请输入密码" style="width: 350px"/>
                            </n-form-item>
                            <n-form-item path="reg_repassword" label="再次输入密码">
                                <n-input v-model:value="user_regist.reg_repassword" placeholder="请再次输入密码" style="width: 350px"/>
                            </n-form-item>
                        </n-form>
                        <n-button @click="userRegister">注册</n-button>
                    </n-tab-pane>
                    </n-tabs>
                </n-card>
            </div>
            <!-- <template #action>
            <div>操作</div>
            </template> -->
        </n-modal>

        <div class="nav">
            <div @click="HomePage">首页</div>
            <div>
                <n-popselect @update:value="searchByCategory" v-model:value="selectedCategory" :options="categoryOptions" trigger="click">
                    <div>分类<span>{{ categoryName }}</span></div>
                </n-popselect>
            </div>
            <div @click="dashboard">后台</div>
            
        </div>
            
        <n-divider/>

        <n-space class="search">
            <n-input v-model:value="pageInfo.keyword" :style="{ width: '500px'} " placeholder="请输入关键字"/>
            <n-button type="primary" ghost @click="loadBlogs(0)">搜索</n-button>
        </n-space>

        <div v-for="(blog,index) in blogListInfo" style="margin-bottom: 15px;cursor: pointer;">
          <n-card :title="blog.title" @click="toDetail(blog)">
              {{ blog.content }}

              <template #footer>
                  <n-space align="center">
                    <div>发布时间：{{ blog.creat_time }}</div>
                  </n-space>
              </template>
          </n-card>
        </div>

        <n-pagination @update:page="loadBlogs" v-model:page="pageInfo.page" :page-count="pageInfo.pageCount" />

        <n-divider/>
        <div class="footer">
            <div>Power by lsj</div>
            <div>欢迎使用</div>
        </div>
    </div>
    
</template>

<script setup>
import { ref,reactive,inject,onMounted,computed } from 'vue'
import { useRouter,useRoute } from 'vue-router'
import { UserStore} from '../stores/UserStore'
import { ExitOutline,EyeOffOutline, EyeOutline } from '@vicons/ionicons5'


const router = useRouter()
const route = useRoute()

const message = inject("message")
const dialog = inject("dialog")
const axios = inject("axios")

const userStore = UserStore()
userStore.img = "/default.jpg"


const selectedCategory = ref(0)
const categoryOptions = ref([])
const blogListInfo = ref([])
let showModal = ref(false)

let rules = {
    user_account:[
        { required: true, message: "请输入账号", trigger: "blur" },
        { min: 3, max: 12, message: "账号长度在 3 到 12 个字符", trigger: "blur" },
    ],
    user_password:[
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, max: 18, message: "密码长度在 6 到 18 个字符", trigger: "blur" },
    ],
};

const user = reactive({
    user_account: localStorage.getItem("user_account") || "",
    user_password:localStorage.getItem("user_password") || "",
    user_rember:localStorage.getItem("user_rember") == 1 || false,
    user_img:localStorage.getItem("user_img") || "",
})

const user_regist = reactive({
    reg_account: localStorage.getItem("reg_account") || "",
    reg_password:localStorage.getItem("reg_password") || "",
    reg_repassword:localStorage.getItem("reg_repassword") || "",
    reg_img:localStorage.getItem("reg_img") || "",
})

const pageInfo = reactive({
  page:1,
  pagesize:3,
  pageCount:0,
  count:0,
  keyword:"",
  categoryId:0
})

onMounted(()=>{
    loadCategorys()
    loadBlogs()
    loadInfo()
})

const loadInfo = () => {
    if(localStorage.getItem("user_account") != null){
        let showinfo = document.querySelector('.username')
        showinfo.classList.remove('show')
        userStore.img = localStorage.getItem("user_img")
    }
}

const loadBlogs = async (page = 0) =>{
  if(page != 0){
    pageInfo.page = page
  }
  let res = await axios.get(`/blog/search?keyword=${pageInfo.keyword}&page=${pageInfo.page}&pagesize=${pageInfo.pagesize}&categoryId=${pageInfo.categoryId}`)
  let temp_rows = res.data.data.rows
  for(let row of temp_rows){
    row.content += "....."
    let d = new Date(row.creat_time)
    row.creat_time = `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`
  }
  blogListInfo.value = res.data.data.rows
  pageInfo.count = res.data.data.count
  pageInfo.pageCount = parseInt(pageInfo.count / pageInfo.pagesize) + (pageInfo.count % pageInfo.pagesize > 0 ? 1 : 0)
  console.log(res);
}


const categoryName = computed(()=>{
    let selectedOption = categoryOptions.value.find((option) => {return option.value == selectedCategory.value})
    return selectedOption ? selectedOption.label : ""
})

const loadCategorys = async () => {
    let res = await axios.get("/category/list")
    categoryOptions.value = res.data.rows.map((item) => {
      return {
          label:item.name,
          value:item.id
      }
    })
    console.log(categoryOptions.value);
}

const HomePage = () => {
    router.push("/")
}

const dashboard = () => {
    router.push("/login")
}


const toDetail = (blog) => {
    router.push({path:"/detail",query:{id:blog.id}})
}

const searchByCategory = (categoryId) =>{
    pageInfo.categoryId = categoryId
    loadBlogs()
}


const userLogin = async() => {
    let result = await axios.post("/user/userlogin",{
        user_account:user.user_account,
        user_password:user.user_password
    })
    console.log(result);
    if(result.data.code == 200){
        userStore.token = result.data.data.token
        userStore.account = result.data.data.user_account
        userStore.id = result.data.data.id
        userStore.img = result.data.data.img

        if(user.user_rember){
            localStorage.setItem("user_account",user.user_account)
            localStorage.setItem("user_password",user.user_password)
            localStorage.setItem("user_rember",user.user_rember?1:0)
            localStorage.setItem("user_img",userStore.img)
        }
        let showinfo = document.querySelector('.username')
        showinfo.classList.remove('show')
        message.success('登陆成功')
    }else{
        message.error("登录失败")
    }
    console.log(result);
    

    
}

const Exit = () => {
    let showinfo = document.querySelector('.username')
    showinfo.classList.add('show')
    userStore.img = "/default.jpg"
    message.success('账号已退出')
}

const userRegister = async() => {
    let result = await axios.post("/user/userRegist",{
        reg_account:user_regist.reg_account,
        reg_password:user_regist.reg_password,
        reg_repassword:user_regist.reg_repassword,
    })

    if(result.data.code == 200){
        message.success('注册成功')
    }else{
        message.error("注册失败")
    }
}


</script>

<style lang="scss" scoped>

.search{
    margin-bottom: 15px;
}

.container{
    width: 1200px;
    margin: 0 auto;
}

.nav{
    display: flex;
    font-size: 20px;
    padding-top: 20px;
    color: #64676a;
    div{
        cursor: pointer;
        margin-right: 15px;

        &:hover{
            color: #f60;
        }
        span{
            font-size: 12px;
        }
    }
}

.footer{
    text-align: center;
    line-height: 25px;
    color: #64676a;
}


.user{
    float: right;
    margin-top: 10px;
    padding: 2px 7px 0 7px;
    border: 1px solid;
    border-radius: 30px
}

.username{
    float: right;
    margin-top: 12px;
    padding-left: 5px;
    font-size: 18px;
    
}

.show{
    display: none;
}

.pic{
    margin-top: 3px;
}






</style>