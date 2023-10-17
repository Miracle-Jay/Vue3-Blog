const express = require("express")
const router = express.Router()
const { v4: uuidv4 } = require("uuid")
const { db, genid } = require("../db/DbUtils")

router.post("/userlogin", async (req, res) => {
    let { user_account, user_password } = req.body
    let { err, rows } = await db.async.all("select * from `user` where `user_account` = ? AND `user_password` = ?", [user_account, user_password])

    if (err == null && rows.length > 0) {

        let login_token = uuidv4();
        let update_token_sql = "UPDATE `user` SET `user_token` = ? where `id` = ?"

        await db.async.run(update_token_sql, [login_token, rows[0].id])

        let user_info = rows[0]
        user_info.user_token = login_token
        user_info.user_password = ""

        res.send({
            code: 200,
            msg: "登录成功",
            data: user_info
        })
    } else {
        res.send({
            code: 500,
            msg: "登录失败"
        })
    }

})

router.post("/userRegist", async (req, res) => {

    let { reg_account, reg_password, reg_repassword } = req.body
    let { err, rows } = await db.async.all("select * from `user` where `user_account` = ? ", [reg_account])

    if (err == null && rows.length > 0 || (reg_password != reg_repassword)) {
        res.send({
            code: 500,
            msg: "注册失败",
        })
    } else {
        const insert_sql = "insert into `user` (`user_account`,`user_password`,`img`) values(?,?,?)"
        await db.async.run(insert_sql, [reg_account, reg_password, "/every.jpg"])


        res.send({
            code: 200,
            msg: "注册成功",
        })
    }





})


module.exports = router