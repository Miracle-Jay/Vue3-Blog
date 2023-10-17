const express = require("express")
const router = express.Router()
const { db, genid } = require("../db/DbUtils")


//查询详情
router.get("/detail", async (req, res) => {

    let { id } = req.query
    let detail_sql = "select * from `blog` where `id` = ?"
    let { err, rows } = await db.async.all(detail_sql, [id])

    if (err == null) {
        res.send({
            code: 200,
            msg: "获取成功",
            rows
        })
    } else {
        res.send({
            code: 500,
            msg: "获取成功"
        })
    }


})



//修改博客
router.put("/_token/update", async (req, res) => {

    let { id, title, categoryId, content } = req.body
    let creat_time = new Date().getTime()

    const update_sql = "UPDATE `blog` SET `title` = ? ,`content` = ? ,`category_id` = ? WHERE `id` = ? "
    let params = [title, content, categoryId, id]

    let { err, rows } = await db.async.run(update_sql, params)

    if (err == null) {
        res.send({
            code: 200,
            msg: "修改成功"
        })
    } else {

        res.send({
            code: 500,
            msg: "修改失败"
        })
    }

})


//删除博客
router.delete("/_token/delete", async (req, res) => {

    let id = req.query.id
    const delete_sql = "DELETE FROM `blog` WHERE `id` = ?"
    let { err, rows } = await db.async.run(delete_sql, [id])

    if (err == null) {
        res.send({
            code: 200,
            msg: "删除成功"
        })
    } else {
        res.send({
            code: 500,
            msg: "删除失败"
        })
    }

})


//查询博客
router.get("/search", async (req, res) => {

    let { keyword, categoryId, page, pagesize } = req.query

    page = page == null ? 1 : page
    pagesize = pagesize == null ? 10 : pagesize
    categoryId = categoryId == null ? 0 : categoryId
    keyword = keyword == null ? "" : keyword

    let params = []
    let whereSqls = []
    if (categoryId != 0) {
        whereSqls.push(" `category_id` = ? ")
        params.push(categoryId)
    }

    if (keyword != "") {
        whereSqls.push(" (`title` like ? or `content` like ?) ")
        params.push("%" + keyword + "%")
        params.push("%" + keyword + "%")
    }

    let whereSqlStr = ""
    if (whereSqls.length > 0) {
        whereSqlStr = " where " + whereSqls.join(" and ")
    }

    //查分页数据
    let searchSql = " select `id`,`category_id`,`title`,`creat_time`,substr(`content`,0,50) as `content` from `blog` " + whereSqlStr + " order by `creat_time` desc limit ?,? "
    let searchSqlParams = params.concat([(page - 1) * pagesize, pagesize])

    //查询数据总数
    let searchcountSql = " select count(*) as `count` from `blog` " + whereSqlStr
    let searchCountParams = params

    //分页数据
    let searchReasult = await db.async.all(searchSql, searchSqlParams)
    let countResule = await db.async.all(searchcountSql, searchCountParams)

    if (searchReasult.err == null && countResule.err == null) {
        res.send({
            code: 200,
            msg: "查询成功",
            data: {
                keyword,
                categoryId,
                page,
                pagesize,
                rows: searchReasult.rows,
                count: countResule.rows[0].count
            }
        })
    } else {
        console.log(searchReasult.err);
        res.send({
            code: 500,
            msg: "查询失败"
        })
    }




})



//添加博客
router.post("/_token/add", async (req, res) => {

    let { title, categoryId, content } = req.body
    let id = genid.NextId()
    let creat_time = new Date().getTime()

    const insert_sql = "INSERT INTO `blog`(`id`,`category_id`,`title`,`content`,`creat_time`) VALUES (?,?,?,?,?)"
    let params = [id, categoryId, title, content, creat_time]

    let { err, rows } = await db.async.run(insert_sql, params)

    if (err == null) {
        res.send({
            code: 200,
            msg: "添加成功"
        })
    } else {
        console.log(err);
        res.send({
            code: 500,
            msg: "添加失败"
        })
    }

})

module.exports = router