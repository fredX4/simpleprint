let express = require('express')
let app = express.Router();

app.post('/update_password', function (req,res) {

    let data = 
        {
            
            current_psw: crypto.createHash('md5').update(req.body.current_psw + '_sha_sha_sha').digest("hex"),
            new_psw: crypto.createHash('md5').update(req.body.new_psw + '_sha_sha_sha').digest("hex"),
            user_id: req.sessions.user_id
        }

        let qry = parser('UPDATE users SET password = "%new_psw%" WHERE user_id = %user_id% and password = "%current_psw%"',data)

        connection.query(qry, function (err, result) {
            
            
            if(err) {
                
                console.log(err)
                console.log(qry)
                res.json({error:1})
                return;
            }
            
            res.json({error:0, success:1})
        })
    
    
})

app.post('/add_service', function (req,res) {
    
    let data = {
        name: connection.escape(req.body.name),
        size: connection.escape(req.body.size)
    }
    
    if(req.sessions.user_type !== 0) {
        
        res.json({error:1, message:"only admin can add service"})
        return
    } 
    
    let qry = parser('INSERT INTO availale_services VALUES(null, %name%, %size%)', data)
    
    connection.query(qry, function (req,res) {
        
        if(err) {
            
          console.log(err)
                console.log(qry)
                res.json({error:1})
                return;  
        }
        
        
         res.json({error:0, success:1})
    })
    
    
})

module.exports = app;