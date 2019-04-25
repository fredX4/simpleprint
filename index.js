let express = require('express')
let mysql = require('mysql')
let app = express();
let path = require('path')
//let bodyParser = require('body-parser')
connection = mysql.createPool('mysql://server:serverpassword123@45.79.109.126/simpleprint')
let crypto = require('crypto');
let bodyParser = require('body-parser')
let request = require('request')
let sessions = require("client-sessions");
parser = function (str, obj) {
    for (key in obj) {
        str = str.replace(new RegExp('%' + key + '%', 'g'), obj[key]);
    }
    return str;
}

app.set('view engine', 'ejs')
app.use(sessions({
    cookieName: 'sessions', // cookie name dictates the key name added to the request object 
    secret: 'sha_sha_cookie', // should be a large unguessable string 
    duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms 
    activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds 
}));


app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.post('/login', function (req, res) {
    let data = {
        password: crypto.createHash('md5').update(req.body.psw + '_sha_sha_sha').digest("hex"),
        email: req.body.uname
    }

    let qry = parser('SELECT * FROM users WHERE email = "%email%" AND password = "%password%"', data)
    connection.query(qry, function (err, result) {
        if (err) {
            console.log(err);
            console.log(qry);
            res.send('error with query check console for details')
            return
        }
        if (result.length > 0) {
            req.sessions.logged_in = true
            req.sessions.user_type = result[0].user_type
            console.log(req.sessions.user_type, result[0].user_type)
            req.sessions.user_id = result[0].user_id
            res.redirect('/dashboard')
        } else {
            res.redirect('/login_fail.html')
        }
    })

})

validate_user = function (req, res, next) {

    if (!req.sessions || !req.sessions.logged_in) {
        res.redirect('/')
    } else {
        next()
    }
}

app.get('/dashboard', validate_user, function (req, res) {

    let qry = 'SELECT * FROM users WHERE user_id = ' + req.sessions.user_id

    connection.query(qry, function (err, results) {

        if (err) {

            console.log(err);
            console.log(qry);
            res.sendFile(res.sendFile(path.join(__dirname, 'public/error.html')))
            return;
        }

        if (results.length > 0) {

            connection.query('SELECT * FROM templates WHERE template_owner = 0', function (err, template_results) {

                if (err) {

                    console.log(err);
                    console.log(qry);
                    res.sendFile(res.sendFile(path.join(__dirname, 'public/error.html')))
                    return;
                }

                results[0].templates = JSON.parse(JSON.stringify(template_results))

                // console.log(req.sessions.user_type == 2)

                if (req.sessions.user_type == 2) {
                    var qry = 'SELECT * FROM print_request INNER JOIN users on users.user_id = print_request.user_id WHERE psp_id =' + req.sessions.user_id
                    // qry = 'SELECT * FROM print_request WHERE psp_id =' + req.sessions.user_id
                    connection.query(qry, function (err, job_results) {
                        if (err) {

                            console.log(err);
                            console.log(qry);
                            res.sendFile(res.sendFile(path.join(__dirname, 'public/error.html')))
                            return;
                        }
                        results[0].jobs = JSON.parse(JSON.stringify(job_results))
                        //Feedback Data
                        var qry = parser('SELECT * FROM feedback INNER JOIN users on feedback.psp_id = users.user_id  WHERE feedback.psp_id = %user_id%', req.sessions)
                        connection.query(qry, function (err, feedback_data) {
                            if (err) {

                                console.log(err);
                                console.log(qry);
                                res.sendFile(res.sendFile(path.join(__dirname, 'public/error.html')))
                                return;
                            }

                            results[0].feedback = JSON.parse(JSON.stringify(feedback_data))

                            //Loading Services Data
                            let qry = "SELECT psp_services.*, available_services.* FROM psp_services, available_services WHERE available_services.service_id = psp_services.service_id AND psp_services.psp_id = " + req.sessions.user_id
                            // let qry = "SELECT psp_services.*, available_services.* FROM psp_services, available_services WHERE available_services.service_id = psp_services.service_id AND psp_services.psp_id = " + parseInt(req.body.user_id)
                            connection.query(qry, function (err, result) {

                                if (err) {

                                    console.log(err)
                                    console.log(qry)
                                    res.json({
                                        error: 1
                                    })
                                    return;
                                }
                                results[0].services = JSON.parse(JSON.stringify(result))

                                // //Loading Service Names
                                // var sql = "SELECT service_name FROM available_services GROUP BY service_name";
                                // connection.query(sql, function (err, rows) {
                                //     if (err) {
                                //         console.log(err);
                                //         res.send(err);
                                //         return;
                                //     }
                                //
                                //         results[0].s_name = JSON.parse(JSON.stringify(rows))
                                //
                                //     // res.render('psp_home', results[0])
                                //     // console.log('psp_home')
                                //
                                // })
                                //
                                // //Loading Document Sizes
                                // var sql = "SELECT DISTINCT document_size FROM available_services";
                                // connection.query(sql, function (err, rows) {
                                //     if (err) {
                                //         console.log(err);
                                //         res.send(err);
                                //         return;
                                //     }
                                //
                                //     results[0].d_size = JSON.parse(JSON.stringify(rows))
                                //     res.render('psp_home', results[0]);
                                //     console.log('psp_home')
                                //
                                // })


                                //Loading Data to Available Services - ORIGINAL
                                var sql="SELECT * FROM available_services";
                                connection.query(sql, function (err, rows) {
                                    if(err) {
                                        console.log(err);
                                        res.send(err);
                                        return;
                                    }

                                        results[0].available_services = JSON.parse(JSON.stringify(rows))
                                    res.render('psp_home', results[0])
                                    console.log('psp_home')

                                })


                            })

                        })

                    })


                }
                else if (req.sessions.user_type == 1) {

                    var qry = parser('SELECT * FROM print_request INNER JOIN users on print_request.psp_id = users.user_id   WHERE print_request.user_id = %user_id%', req.sessions)
                    connection.query(qry, function (err, job_results) {
                        if (err) {

                            console.log(err);
                            console.log(qry);
                            res.sendFile(res.sendFile(path.join(__dirname, 'public/error.html')))
                            return;
                        }
                        results[0].jobs = JSON.parse(JSON.stringify(job_results))

                        //Feedback Data
                        var qry = parser('SELECT * FROM feedback INNER JOIN users on feedback.user_id = users.user_id  WHERE feedback.user_id = %user_id%', req.sessions)
                        connection.query(qry, function (err, feedback_data) {
                            if (err) {

                                console.log(err);
                                console.log(qry);
                                res.sendFile(res.sendFile(path.join(__dirname, 'public/error.html')))
                                return;
                            }
                            results[0].feedback = JSON.parse(JSON.stringify(feedback_data))
                            res.render('usr_home', results[0])
                            console.log('user_home')
                        })

                    })


                }
                else if (req.sessions.user_type == 0) {

                    var sql = "SELECT * FROM available_services";
                    connection.query(sql, function (err, rows) {
                        if (err) {
                            console.log(err);
                            res.send(err);
                            return;
                        }
                        else {
                            results[0].services = JSON.parse(JSON.stringify(rows))
                            res.render('admin_home', results[0])
                            // res.render('admin_home',{ results : results[0] })
                            console.log('admin_home')
                        }
                    })


                }
            })

        }

    })
})


app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/login.html'))
})

app.get('/register', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/register.html'))
})

app.get('/dashboard/success', function (req, res) {
    res.redirect('/payment_success.html')
})


app.post('/register', function (req, res) {

    console.log(req.body)
    let data = {
        password: crypto.createHash('md5').update(req.body.password + '_sha_sha_sha').digest("hex"),
        email: connection.escape(req.body.email),
        name: connection.escape(req.body.name),
        phone: connection.escape(req.body.phone),
        user_type: parseInt(req.body.user_type),
        city: connection.escape(req.body.city),
        lat: connection.escape(req.body.lat),
        lng: connection.escape(req.body.lng),
        otp: getOTP()
    }


    let qry = parser("INSERT INTO users(email,password,phone,name,user_type,otp,user_address,lat,lng) VALUES (%email%,'%password%', %phone%, %name%, %user_type%, %otp%, %city%, %lat%,%lng%)", data);

    connection.query(qry, function (err, result) {

        if (err) {

            console.log(err)
            console.log(qry)
            res.json({
                error: 1
            })

            return
        }

        if (result.insertId) {

            let message = data.otp + ' is your OTP Code for SimplePrint'


            sendMessage(message, req.body.phone, function (err) {

                console.log(err)

                if (err) {

                    res.json({
                        error: 1
                    })
                    return
                }


                res.json({
                    error: 0
                })

            })


        }

    })


})


app.post('/update_profile_pic', validate_user, function (req, res) {

    var data = {
        user_id: req.sessions.user_id,
        url: connection.escape(req.body.url)
    }

    var qry = parser("UPDATE users SET user_img = %url% WHERE user_id = %user_id%", data)

    connection.query(qry, function (err, result) {

        if (err) {

            console.log(err)
            console.log(qry)
            res.json({
                error: 1
            })

            return
        }

        res.json({error: 0})

    })


})

app.post('/validate_otp', function (req, res) {

    let data = {
        phone: connection.escape(req.body.phone),
        otp: connection.escape(req.body.otp)
    }


    let qry = parser("SELECT * FROM users WHERE phone = %phone% AND %otp% ORDER BY user_id DESC LIMIT 1", data)

    connection.query(qry, function (err, result) {


        if (err) {

            console.log(err)
            res.json({
                error: 1
            });
            return;
        }

        if (result.length > 0) {

            console.log((result[0].phone == req.body.phone && result[0].otp == req.body.otp))
            console.log(result[0].phone, req.body.phone, result[0].otp, req.body.otp)

            if (result[0].phone == req.body.phone && result[0].otp == req.body.otp) {

                req.sessions.logged_in = true
                req.sessions.type = result[0].user_type
                req.sessions.user_id = result[0].user_id

                res.json({
                    error: 0,
                    success: 1
                })
            } else {

                res.json({
                    error: 0,
                    success: 0
                })
            }
        } else {

            res.json({
                error: 0,
                success: 0
            })
        }

    })


})

app.use('/psp', require('./routes/psp/index.js'))
app.use('/user', require('./routes/user/index.js'))

app.listen(process.env.PORT || 8050)

function getOTP() {
    let min = 123456,
        max = 987654
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

sendMessage = function (msg, number, callback) {

    console.log('send Message')
    let url = parser('http://api.msg91.com/api/sendhttp.php?sender=SMPLPT&route=4&mobiles=%phone%&authkey=138037A0TslK6415abb4b94&country=91&message=%msg%', {
        phone: number,
        msg: msg
    })

    console.log(url)
    request(url, function (err, body) {


        if (err) {
            console.log(err)
            callback(err)
        }
        callback(null, true)
    })
}

//Additional Code

app.post('/resend_otp', function (req, res) {

    let data = {
        phone: connection.escape(req.body.phone),
    }

    let qry = parser("SELECT * FROM users WHERE phone = %phone%", data)

    connection.query(qry, function (err, result) {


        if (err) {

            console.log(err)
            res.json({
                error: 1
            });
            return;
        }

        if (result.length > 0) {

            let message = result[0].otp + ' is your OTP Code for SimplePrint'

            sendMessage(message, req.body.phone, function (err) {

                console.log(err)

                if (err) {

                    res.json({
                        error: 1
                    })
                    return
                }

                res.json({
                    error: 0
                })

            })


        }

    })


})

app.get('/jobs_services', function (req, res) {

    var qry = `SELECT * from available_services `

    connection.query(qry, function (err, result) {
        if (err) {
            console.log(err)
            res.json({
                error: 1
            });
            return;
        }

        var data = {}

        for (var i = 0, len = result.length; i < len; i++) {

            data[result[i].service_id] = {

                service_name: result[i].service_name,
                document_size: result[i].document_size
            }

        }

        res.json(data)

    })


})


app.get('/forgot_password', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/forgot_password.html'))
})

app.post('/forgot_password', function (req, res) {

    let data = {
        phone: connection.escape(req.body.phone),
    }

    let qry = parser("SELECT * FROM users WHERE phone = %phone%", data)

    connection.query(qry, function (err, result) {


        if (err) {

            console.log(err)
            res.json({
                error: 1
            });
            return;
        }

        if (result.length > 0) {

            let message = result[0].otp + ' is your OTP Code for SimplePrint'

            sendMessage(message, req.body.phone, function (err) {

                console.log(err)

                if (err) {

                    res.json({
                        error: 1
                    })
                    return
                }

                res.json({
                    error: 0
                })

            })
        }

    })


})

app.post('/validate_reset_otp', function (req, res) {

    let data = {
        phone: connection.escape(req.body.phone),
        otp: connection.escape(req.body.otp)
    }


    let qry = parser("SELECT * FROM users WHERE phone = %phone% AND %otp% ORDER BY user_id DESC LIMIT 1", data)

    connection.query(qry, function (err, result) {


        if (err) {

            console.log(err)
            res.json({
                error: 1
            });
            return;
        }

        if (result.length > 0) {

            console.log((result[0].phone == req.body.phone && result[0].otp == req.body.otp))
            console.log(result[0].phone, req.body.phone, result[0].otp, req.body.otp)

            if (result[0].phone == req.body.phone && result[0].otp == req.body.otp) {

                req.sessions.logged_in = true
                req.sessions.type = result[0].user_type
                req.sessions.user_id = result[0].user_id

                res.json({
                    error: 0,
                    success: 1
                })
            } else {

                res.json({
                    error: 0,
                    success: 0
                })
            }
        } else {

            res.json({
                error: 0,
                success: 0
            })
        }

    })


})

app.get('/reset', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/reset.html'))
})

app.post('/reset', function (req, res) {

    var data = {
        password: crypto.createHash('md5').update(password + '_sha_sha_sha').digest("hex"),
        user_id: req.sessions.user_id
    }
    // let qry = parser('UPDATE users SET password = "%new_psw%" WHERE user_id = %user_id% and password = "%current_psw%"',data)
    var qry = parser('UPDATE users SET password = "%password%" WHERE user_id = %user_id%', data)

    connection.query(qry, function (err) {

        if (err) {
            console.log(err)
            res.json({
                error: 1
            });
            return;
        }
        res.json({
            error: 0
        })

    })
})

app.get('/logout', function (req, res) {
    req.sessions.logged_in = req.sessions.user_type = req.sessions.user_id = null
    res.redirect('/');
})

app.get('/instant_print', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/instant_print.html'))
})

app.post('/instant_print', function (req, res) {

    var data = {
        password: crypto.createHash('md5').update(password + '_sha_sha_sha').digest("hex"),
        user_id: req.sessions.user_id
    }
    // let qry = parser('UPDATE users SET password = "%new_psw%" WHERE user_id = %user_id% and password = "%current_psw%"',data)
    var qry = parser('UPDATE users SET password = "%password%" WHERE user_id = %user_id%', data)

    connection.query(qry, function (err) {

        if (err) {
            console.log(err)
            res.json({
                error: 1
            });
            return;
        }
        res.json({
            error: 0
        })

    })
})

app.post('/update_password', function (req, res) {

    let data =
        {
            current_psw: crypto.createHash('md5').update(req.body.current_psw + '_sha_sha_sha').digest("hex"),
            new_psw: crypto.createHash('md5').update(req.body.new_psw + '_sha_sha_sha').digest("hex"),
            user_id: req.sessions.user_id
        }

    let qry = parser('UPDATE users SET password = "%new_psw%" WHERE user_id = %user_id% and password = "%current_psw%"', data)

    connection.query(qry, function (err, result) {


        if (err) {

            console.log(err)
            console.log(qry)
            res.json({error: 1})
            return;
        }

        if (result.affectedRows == 0) {

            res.json({error: 1})
            return
        }
        res.json({error: 0, success: 1})
    })

})


app.post('/add_service', function (req, res) {

    let data = {
        service_name: connection.escape(req.body.service_name),
        document_size: connection.escape(req.body.document_size)
    }

    let qry = parser("INSERT INTO available_services(service_name,document_size) VALUES (%service_name%,%document_size%)", data);

    connection.query(qry, function (err) {

        if (err) {

            console.log(err)
            console.log(qry)
            res.json({
                error: 1
            })

            return
        }

        res.json({
            error: 0
        })

    })

})

app.post('/remove_service', function (req, res) {

    let data = {
        service_name: connection.escape(req.body.del_service_name),
        document_size: connection.escape(req.body.del_document_size)
    }

    let qry = parser("DELETE FROM available_services WHERE service_name = %service_name% AND document_size = %document_size%", data);

    connection.query(qry, function (err, result) {

        if (err) {

            console.log(err)
            console.log(qry)
            res.json({
                error: 1
            })

            return
        }

        if (result.affectedRows == 0) {

            res.json({error: 1})
            return
        }

        res.json({
            error: 0
        })

    })

})


app.post('/update_profile', function (req, res) {

    let data =
        {
            name: connection.escape(req.body.name),
            phone: connection.escape(req.body.phone),
            city: connection.escape(req.body.city),
            lat: connection.escape(req.body.lat),
            lng: connection.escape(req.body.lng),
            user_id: req.sessions.user_id
        }

    let qry = parser('UPDATE users SET name = %name%, phone = %phone%, user_address = %city%, lat = %lat%, lng = %lng%  WHERE user_id = %user_id%', data)

    connection.query(qry, function (err, result) {

        if (err) {

            console.log(err)
            console.log(qry)
            res.json({error: 1})
            return;
        }

        if (result.affectedRows == 0) {

            res.json({error: 1})
            return
        }
        res.json({error: 0, success: 1})
    })

})

app.post('/update_bank_details', function (req, res) {

    console.log(req.body)
    let data =
        {
            user_id: req.sessions.user_id,
            bank_name: connection.escape(req.body.bank_name),
            ifsc_code: connection.escape(req.body.ifsc_code),
            acc_no: connection.escape(req.body.acc_no)
        }

    let qry = parser('UPDATE users SET bank_name = %bank_name%, ifsc_code = %ifsc_code%, acc_no = %acc_no% WHERE user_id = %user_id%', data)
    console.log(qry)

    connection.query(qry, function (err, result) {

        if (err) {

            console.log(err)
            console.log(qry)
            res.json({error: 1})
            return;
        }

        if (result.affectedRows == 0) {

            res.json({error: 1})
            return
        }
        res.json({error: 0, success: 1})
    })

})

app.post('/add_psp_service', function (req, res) {

    console.log(req.body.service_name)

    let data = {
        psp_id: req.sessions.user_id,
        service_id: req.body.service_id,
        service_name: req.body.service_name,
        document_size: req.body.document_size,
        rate: req.body.rate
    }


    let qry = parser("SELECT * FROM psp_services where psp_id = %psp_id% AND service_id = (SELECT service_id from available_services WHERE service_name = '%service_name%' AND document_size = '%document_size%')", data)
    connection.query(qry, function (err, result) {
        console.log(qry)

        if (err) {
            console.log(err)
            console.log(qry)

            res.json({
                error: 1
            })
            return;
        }
        if (result.length == 1) {
            console.log(qry)
            res.json({
                error: 1
            })
            return;

        }
        else {

            let qry = parser("INSERT INTO psp_services(psp_service_id,psp_id,service_id,rate) VALUES(null, %psp_id%, (SELECT service_id from available_services WHERE service_name = '%service_name%' AND document_size = '%document_size%') , %rate%)", data)
            connection.query(qry, function (err) {

                if (err) {
                    console.log(err)
                    console.log(qry)

                    res.json({
                        error: 1
                    })
                    return;
                }
                console.log(qry)
                res.json({
                    error: 0,
                    success: 1
                })
            })

        }
    })
})

app.post('/update_psp_service', function (req, res) {

    console.log(req.body)
    let data = {
        psp_id: req.sessions.user_id,
        service_name: req.body.service_name,
        document_size: req.body.document_size,
        rate: req.body.rate
    }


    // let qry = parser("INSERT INTO psp_services(psp_service_id,psp_id,service_id,rate) VALUES(null, %psp_id%, %service_id%, %rate%)", data)
    let qry = parser("UPDATE psp_services SET rate = %rate% WHERE psp_id = %psp_id% AND service_id = (SELECT service_id from available_services WHERE service_name = '%service_name%' AND document_size = '%document_size%')", data)
    connection.query(qry, function (err, result) {

        if (err) {
            console.log(err)
            console.log(qry)

            res.json({
                error: 1
            })
            return;
        }

        if (result.affectedRows == 0) {

            res.json({error: 1})
            return
        }
        console.log(qry)
        res.json({
            error: 0,
            success: 1
        })
    })


})

app.post('/cancel_job', function (req, res) {

    let data = {
        user_id: req.sessions.user_id,
        id: req.body.id
    }


    console.log(req.body)
    // let qry = parser("INSERT INTO psp_services(psp_service_id,psp_id,service_id,rate) VALUES(null, %psp_id%, %service_id%, %rate%)", data)
    let qry = parser("UPDATE print_request SET status = 3 WHERE print_request_id = %id% AND user_id = %user_id%", data)
    connection.query(qry, function (err, result) {

        if (err) {
            console.log(err)
            console.log(qry)

            res.json({
                error: 1
            })
            return;
        }

        if (result.affectedRows == 0) {

            res.json({error: 1})
            return
        }
        console.log(qry)
        res.json({
            error: 0,
            success: 1
        })
    })


})

app.post('/give_feedback', function (req, res) {

    let data = {
        user_id: req.sessions.user_id,
        id: req.body.id,
        psp_id: req.body.psp_id,
        rating: req.body.rating,
        feedback: connection.escape(req.body.feedback)
    }

    console.log(req.body)
    // let qry = parser("INSERT INTO psp_services(psp_service_id,psp_id,service_id,rate) VALUES(null, %psp_id%, %service_id%, %rate%)", data)
    let qry = parser("INSERT INTO feedback (print_request_id,rating,psp_id,user_id,review) VALUES (%id%,%rating%,%psp_id%,%user_id%,%feedback%) ON DUPLICATE KEY UPDATE rating = %rating%, review = %feedback% ", data)
    connection.query(qry, function (err, result) {

        if (err) {
            console.log(err)
            console.log(qry)

            res.json({
                error: 1
            })
            return;
        }

        console.log(qry)
        res.json({
            error: 0,
            success: 1
        })
    })


})