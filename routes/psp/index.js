let express = require('express')
let app = express.Router();

app.post('/update_profile', function (req, res) {

    let data = {
        name: connection.escape(req.body.name),
        city: connection.escape(req.body.city),
        shop_lon: connection.escape(req.body.shop_lon),
        shop_lat: connection.escape(req.body.shop_lat),
        email: connection.escape(req.body.email),
        phone: connection.escape(req.body.phone),
        user_id: req.sessions.user_id
    }

    let qry = parser('UPDATE users SET name = %name%, user_address = %city%, phone = %phone%, email = %email% , lat = %shop_lat%, lng = %shop_lng% WHERE user_id = %user_id%', data)
    connection.query(qry, function (err, result) {


        if (err) {

            console.log(err)
            console.log(qry)
            res.json({
                error: 0
            })

            return;
        }


        res.json({
            error: 0
        })

    })

})

app.post('/add_service', function (req, res) {

    let data = {
        psp_id: req.sessions.user_id,
        service_id: req.body.service_id,
        rate: req.body.rate
    }

    if (req.sessions.user_type !== 2) {

        res.json({
            error: 1,
            message: "only psp can add service"
        })
        return
    }

    let qry = parser('INSERT INTO psp_services VALUES(null, %psp_id%, %service_id%, %rate%)', data)

    connection.query(qry, function (req, res) {

        if (err) {

            console.log(err)
            console.log(qry)
            res.json({
                error: 1
            })
            return;
        }


        res.json({
            error: 0,
            success: 1
        })
    })




})

app.get('/get_psp_services', function (req, res) {


    let qry = "SELECT psp_services.*, available_services.* FROM psp_services, available_services WHERE available_services.service_id = psp_service.service_id AND psp_service.psp_id = " + parseInt(req.body.user_id)
    connection.query(qry, function (err, result) {

        if (err) {

            console.log(err)
            console.log(qry)
            res.json({
                error: 1
            })
            return;
        }


        res.json({
            error: 0,
            data: result
        })
    })

})

app.post('/update_psp_services', function (req, res) {

    let data = {

        psp_service_id: parseInt(req.body.psp_service_id),
        psp_id: parseInt(req.body.user_id),
        rate: parseInt(req.body.user_id)
    }


    let qry = parser("UPDATE psp_services SET rate = %rate% WHERE psp_service_id = %psp_service_id% AND psp_id = %psp_id%", data)

    if (err) {

        console.log(err)
        console.log(qry)
        res.json({
            error: 1
        })
        return;
    }


    res.json({
        error: 0
    })



})


app.post('/complete_job', function (req, res) {

    var data = {

        psp_id: req.sessions.user_id,
        service_id: req.body.id
    }

    var qry = parser("UPDATE print_request SET status = 2 WHERE print_request_id = %service_id% AND psp_id = %psp_id%", data)

    connection.query(qry, function (err, result) {


        if (err) {

            console.log(err)
            console.log(qry)
            res.json({
                error: 1
            })
            return;
        }


        connection.query(parser('SELECT name,phone FROM users where user_id = (SELECT user_id FROM print_request where print_request_id = %service_id%)', data), function (err, user_result) {


            if (err) {

                console.log(err)
                console.log(qry)
                res.json({
                    error: 1
                })
                return;
            }



            if (result.length == 0) {


                if (err) {

                    console.log(err)
                    console.log(qry)
                    res.json({
                        error: 1
                    })
                    return;
                }
            }

            var new_data = {
                name: user_result[0].name,
                service_id: req.body.id
            }
            var msg = parser("Dear %name%,  SP%service_id% is completed and ready to pickup.\n You can rate the service from the dashboard", new_data);
            sendMessage(msg, user_result[0].phone, function (err) {

                if (err) {

                    console.log(err)
                    console.log(qry)
                    res.json({
                        error: 1
                    })
                    return;
                }

                res.json({
                    error: 0
                })

            })

        })




    })


})

module.exports = app;