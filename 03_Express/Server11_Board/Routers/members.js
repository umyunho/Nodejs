const express = require('express');
const router = express.Router();
const path = require("path");
const mysql = require('mysql2/promise');

async function getConnection(){
    let connection = await mysql.createConnection(
        {
            host : 'localhost',
            user : 'root',
            password : 'adminuser',
            database : 'board'
        }
    );
    return connection;
}
// const connection = mysql.createConnection(
//     {
//         host : 'localhost',
//         user : 'root',
//         password : 'adminuser',
//         database : 'board'
//     }
// );


router.post('/login', async (req, res, next)=>{
    // const userid = req.body.userid;
    // const pwd = req.body.pwd;
    const { userid, pwd } = req.body;
    const sql = "select * from member where userid = ?";
    try{
        const connection = await getConnection();
        const [rows, fields] = await connection.query(sql, [userid]);
        if( rows.length == 1 ){
            if( rows[0].pwd == pwd ){
                const uniqueInt = Date.now();
                req.session[uniqueInt] = rows[0];
                res.cookie('session', uniqueInt, {httpOnly : true,path : '/'});
                res.json({msg:'ok'});
            }else{
                res.json( {msg:'비밀번호가 맞지 않습니다'} );
            }
        }else{
            res.json( {msg:'아이디가 없습니다'} );
        }
    }catch(err){
        next(err);
    }

    // connection.query(sql,  [ userid ], (error, rows)=>{
    //     // sql : 실행될 sql문
    //     // [userid] : ? 에 대응되는 값을 저장한 변수, 여러개면 컴마로 구분해서 나열
    //     // rows 에는 검색결과(레코드는 객체로, 객체들은 배열형태로 저장), error 에러내용이 저장되면서 익명함수가 실행됩니다
    //     if( error ){
    //         next(error);
    //     }else{
    //         if( rows.length == 1 ){
    //             if( rows[0].pwd == pwd ){
    //                 const uniqueInt = Date.now();
    //                 req.session[uniqueInt] = rows[0];
    //                 res.cookie('session', uniqueInt, {httpOnly : true,path : '/'});
    //                 res.json({msg:'ok'});
    //             }else{
    //                 res.json( {msg:'비밀번호가 맞지 않습니다'} );
    //             }
    //         }else{
    //             res.json( {msg:'아이디가 없습니다'} );
    //         }
    //     }
    // });
});



router.get('/joinForm', (req, res)=>{
    res.sendFile( path.join(__dirname, '/..', '/views/joinForm.html') );
});

router.post('/idcheck', async (req, res)=>{
    const userid = req.body.userid;
    const sql = "select * from member where userid = ?";
    try{
        const connection = await getConnection();
        const [rows, fields] = await connection.query(sql, [userid]);
        if( rows.length > 0 ){
            res.json({id:'1'});
        }else{
            res.json({id:'0'});
        }
    }catch(err){
        next(err);
    }
});


router.post('/join', async (req, res)=>{
    const {userid, name, pwd, email, phone } = req.body;
    try{
        const sql = "insert into member(userid, pwd, name, email, phone) values(?,?,?,?,?)";
        const connection = await getConnection();
        const [result, fields] = await connection.query(sql, [userid, pwd, name, email, phone] );
        console.log(result);
        console.log(fields);
        res.json({msg:'회원가입이 완료되었습니다. 로그인하세요'});
    }catch(err){
        console.error(err);
        res.json({msg:'회원가입에 오류가 있습니다. 관리자에게 문의하세요'});
    }
});


router.get('/logout', (req, res)=>{
    delete req.session[req.cookies.session]; 
    res.clearCookie('session', req.cookies.session ,{ httpOnly : true,   path : '/'  });
    res.redirect('/');
});


router.get('/updateForm', (req, res)=>{
    res.sendFile( path.join(__dirname, '/..', '/views/updateMemberForm.html') );
});


router.post('/update',  async (req, res, next)=>{
    const {userid, pwd, name, phone, email } = req.body;
    const sql = "update member set pwd=?, name=?, phone=?, email=? where userid=?";
    try{
        const connection = await getConnection();
        const [result, fields] = await connection.query(sql, [pwd, name, email, phone, userid] );
        req.session[req.cookies.session] = {userid, pwd, name, phone, email };
        res.send('ok');
    }catch(err){
        next(err);
    }
});

module.exports = router;