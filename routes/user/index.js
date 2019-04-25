var express = require('express');
var router = express.Router();
var Razorpay = require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_PX8lUQLftdiT0N',
    key_secret: 'RZMe3DrlL3ioAoHc96FEZHeA'
})
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {

        var ftype = file.mimetype.split('/')[1];
        var ext = '';
        switch (ftype) {

        case 'jpeg':
            ext = '.jpg';
            break;
        case 'png':
            ext = '.png'
            break;
        case 'psd':
            ext = '.psd'
            break;
        case 'eps':
            ext = '.eps'
            break;
        case 'tiff':
            ext = '.tiff'
            break;
        case 'dcr':
        case 'raw':
            ext = '.raw'
            break;
        case 'x-coreldraw':
        case 'coreldraw':
        case 'cdr':
        case 'x-cdr':
            ext = '.cdr'
            break;
        case 'pdf':
            ext = '.pdf'
            break;

        }

        cb(null, '_' + Date.now() + ext)
    }
});

var upload = multer({
    storage: storage
});


router.post('/upload/', validate_user, upload.single('file'), function (req, res) {


    if (!req.file) {


        res.json({
            error: 1
        });
        return;

    }

    res.json({
        error: 0,
        location: req.file.filename,
    })




})



router.get('/list_services', function (req, res) {


    var qry = ' SELECT psp_services.*, available_services.* FROM psp_services, available_services WHERE available_services.service_id = psp_services.service_id';

    connection.query(qry, function (err, result) {

        if (err) {

            console.log(qry)
            console.log(err)

            res.json({
                error: 1
            })
            return
        }

        res.json(result)

    })


})


router.post('/find_psp', function (req, res) {

    var data = req.body.data;

    //    console.log(data)
    //    console.log(typeof data)

    var ids = [];

    for (var i = 0, len = data.length; i < len; i++) {

        //        console.log(data[i])
        ids.push(data[i].service_id)
    }


    var qry = `SELECT psp_service_id,psp_id,service_id,rate,service_name,document_size,user_id,email,phone,name,user_type,user_address,lat,lng,user_img,  (
    3959 * acos (
      cos ( radians(` + req.body.user_lat + `) )
      * cos( radians( lat ) )
      * cos( radians( lng ) - radians(` + req.body.user_lng + `) )
      + sin ( radians(` + req.body.user_lat + `) )
      * sin( radians( lat ) )
    )
  ) AS distance FROM psp_available INNER JOIN users ON  psp_id = user_id WHERE service_id in (` + ids.join(',') + `) HAVING distance < 100 order by distance ASC`

    connection.query(qry, function (err, result) {

        if (err) {

            console.log(qry)
            console.log(err)
            res.json({
                error: 1
            })
            return;
        }

        var psps = {}

        for (var i = 0, len = result.length; i < len; i++) {

            if (psps.hasOwnProperty(result[i].psp_id)) {

                psps[result[i].psp_id].services.push(result[i])
            } else {
                psps[result[i].psp_id] = {}
                psps[result[i].psp_id].services = [result[i]]
            }

        }

        //        console.log(JSON.stringify(psps,2))
        //        return;

        var new_result = [];

        for (psp in psps) {

            var services = psps[psp].services
            console.log(services.length == ids.length)
            if (services.length == ids.length) {


                var psp_data = {}
                psp_data.name = services[0].name
                psp_data.user_address = services[0].user_address
                psp_data.lat = services[0].lat
                psp_data.lng = services[0].lng
                psp_data.psp_id = services[0].psp_id, psp_data.user_img = services[0].user_img
                console.log(services[0].user_img)

                var rate = 0
                for (var i = 0, len = services.length; i < len; i++) {

                    for (var j = 0, j_len = data.length; j < j_len; j++) {


                        if (services[i].service_id == data[j].service_id) {

                            console.log('rate:' + services[i].rate)
                            console.log('copies:' + data[i].copies)
                            rate += services[i].rate * data[j].copies
                        }

                    }

                }

                psp_data.rate = rate
                new_result.push(psp_data)
            }

        }
        console.log(new_result)


        res.json({
            error: 0,
            result: new_result
        })

    })



})



router.post('/add_job', function (req, res) {


    var data = {

        user_id: req.sessions.user_id,
        psp_id: req.body.provider.psp_id,
        services: JSON.stringify(req.body.job_details),
        amount: req.body.provider.rate

    }


    var qry = parser('INSERT INTO print_request (user_id,psp_id,amount, print_details) VALUES (%user_id%, %psp_id%, %amount%,\'%services%\')', data)
    connection.query(qry, function (err, result) {


        if (err) {

            console.log(err)
            console.log(qry)
            res.json({
                error: 1
            })
            return
        }

        res.json({
            error: 0,
            payment_id: result.insertId
        })


    })


})



router.post('/update_job_payment', function (req, res) {

    var data = {
        payment_id: req.body.raz_payment_id,
        service_id: req.body.payment_id
    }


    instance.payments.fetch(data.payment_id)
        .then(function (fetch_data) {

            if (!fetch_data.captured) {

                instance.payments.capture(data.payment_id, fetch_data.amount).
                then(function (capture_data) {

                    if (capture_data.captured) {

                        var update_data = {
                            payment_id: capture_data.id,
                            service_id: data.service_id,
                            amount: (capture_data.amount / 100),
                            type: capture_data.method,
                            payment_name: capture_data.bank || capture_data.wallet || capture_data.vpa || capture_data.card_id
                        }

                        var qry = parser("UPDATE print_request SET payment_status = 1, payment_type = '%type%' , payment_name = '%payment_name%', payment_id = '%payment_id%', status = 1 WHERE print_request_id = %service_id% and amount = %amount%", update_data)


                        connection.query(qry, function (err, result) {

                            if (err) {

                                console.log(err)
                                console.log(qry)
                                res.json({
                                    error: 1
                                })
                                return
                            }

                            if (result.changedRows > 0) {

                                res.json({
                                    error: 0
                                })
                                
                                var qry = (parser('SELECT name, phone from users where user_id = (SELECT user_id from print_request WHERE print_request_id = %service_id%)', update_data))
                                
                                connection.query(qry, function (err, result) {
                                    
                                    if(err) {
                                        
                                        
                                      
                                console.log('error sending SMS')
                                console.log(err)
                                console.log(qry)
                                
                                return  
                                    }
                                    
                                    
                                    if(result.length > 0) {
                                         
                                        update_data.name = result[0].name
                                        var msg = parser("Dear %name%, Rs.%amount% received for Print Job: SP%service_id% \nYou can check the status of the Job from the dashboard",update_data);
                                        
                                        sendMessage(msg, result[0].phone, function (err) {
                                            
                                            if(err) {
                                                
                                                console.log('error sending sms')
                                                return
                                            }
                                            
                                            console.log('SMS sent')
                                            
                                        })
                                        
                                        
                                    }
                                    
                                })

                            } else {
                                res.json({
                                    error: 1
                                })
                            }

                        })

                    }

                })
            }

        })

})

module.exports = router;


/*

SELECT
  name,lat,lng, (
    3959 * acos (
      cos ( radians(9.591566799999999) )
      * cos( radians( lat ) )
      * cos( radians( lng ) - radians(76.52215309999997) )
      + sin ( radians(9.591566799999999) )
      * sin( radians( lat ) )
    )
  ) AS distance
FROM users
HAVING distance < 100
ORDER BY distance
LIMIT 0 , 20;

*/