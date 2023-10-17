const express = require("express")
const router = express.Router()
const { db, genid } = require("../db/DbUtils")


router.post("/addComment", async (req, res) => {

    let { article, content, user_account } = req.body

    const insert_sql = "INSERT INTO `comment`(`user_account`,`text`,`article`) VALUES (?,?,?)"
    let params = [user_account, content, article]

    let insertResult = await db.async.run(insert_sql, params)

    if (insertResult.err == null) {
        res.send({
            code: 200,
            msg: "添加成功",
        })
    } else {
        console.log(err);
        res.send({
            code: 500,
            msg: "添加失败"
        })
    }
})

router.post('/searchComment', async (req, res) => {
    let { article, account } = req.body
    console.log(req.body);
    const select_sql = "select * from comment where article=" + article
    const userSeletc_sql = "select * from user where user_account=" + account

    let { err, rows } = await db.async.all(select_sql)

    if (err == null) {
        res.send({
            code: 200,
            msg: "获取成功",
            data: {
                rows
            }
        })
    } else {
        console.log(err);
        res.send({
            code: 500,
            msg: "获取失败"
        })
    }
})

router.get('/searchUser', async (req, res) => {
    let { user_account } = req.query
    console.log(user_account);
    const select_sql = "select * from user where user_account=" + user_account

    let { err, rows } = await db.async.all(select_sql)

    if (err == null) {
        res.send({
            code: 200,
            msg: "获取信息成功",
            data: {
                rows
            }
        })
    } else {
        console.log(err);
        res.send({
            code: 500,
            msg: "获取信息失败"
        })
    }
})

module.exports = router