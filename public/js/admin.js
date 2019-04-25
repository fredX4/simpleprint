        var current_tab = document.querySelector('.inner_list');
        var current_sub_tab = document.querySelector('.tab_button');
        var current_design_tab = document.querySelector('.design_button');
        var current_service_tab = document.querySelector('.service_button');
        var current_settings_tab = document.querySelector('.settings_button');

        function switchTo(view, elm) {
            current_tab.classList.remove('active_icon');
            document.getElementById(current_view).className = document.getElementById(current_view).className.replace("show", "hidden")
            document.getElementById(view).className = document.getElementById(current_view).className.replace("hidden", "show");
            current_view = view;
            current_tab = elm;
            elm.classList.add('active_icon');
        }

        function switchTab(view, elm) {
            current_sub_tab.classList.remove('active_sub_tab');
            document.getElementById(current_sub_view).className = document.getElementById(current_sub_view).className.replace("show", "hidden")
            document.getElementById(view).className = document.getElementById(current_sub_view).className.replace("hidden", "show");
            current_sub_view = view;
            current_sub_tab = elm;
            elm.classList.add('active_sub_tab');
        }

        function switchdesignTab(view, elm) {
            current_design_tab.classList.remove('active_design_tab');
            document.getElementById(current_design_view).className = document.getElementById(current_design_view).className.replace("show", "hidden")
            document.getElementById(view).className = document.getElementById(current_design_view).className.replace("hidden", "show");
            current_design_view = view;
            current_design_tab = elm;
            elm.classList.add('active_design_tab');
        }

        function switchserviceTab(view, elm) {
            current_service_tab.classList.remove('active_service_tab');
            document.getElementById(current_service_view).className = document.getElementById(current_service_view).className.replace("show", "hidden")
            document.getElementById(view).className = document.getElementById(current_service_view).className.replace("hidden", "show");
            current_service_view = view;
            current_service_tab = elm;
            elm.classList.add('active_service_tab');
        }

        function switchsettingsTab(view, elm) {
            current_settings_tab.classList.remove('active_settings_tab');
            document.getElementById(current_settings_view).className = document.getElementById(current_settings_view).className.replace("show", "hidden")
            document.getElementById(view).className = document.getElementById(current_settings_view).className.replace("hidden", "show");
            current_settings_view = view;
            current_settings_tab = elm;
            elm.classList.add('active_settings_tab');
        }

        function showDetails(id) {
            var detail_id = 'detail_' + id;
            var view_id = 'view_' + id;
            var hide_id = 'hide_' + id;
            document.getElementById(detail_id).className = document.getElementById(detail_id).className.replace("hidden", "show");
            document.getElementById(hide_id).className = document.getElementById(hide_id).className.replace("hidden", "show");
            document.getElementById(view_id).className = document.getElementById(view_id).className.replace("show", "hidden");
        }

        function showNext(view, elm) {
            document.getElementById(view).className = document.getElementById(view).className.replace("hidden", "show");
            document.getElementById(elm).className = document.getElementById(elm).className.replace("show", "hidden");

        }

        function showPrevious(view, elm) {
            document.getElementById(view).className = document.getElementById(view).className.replace("hidden", "show");
            document.getElementById(elm).className = document.getElementById(elm).className.replace("show", "hidden");

        }

        function hideDetails(id) {
            var detail_id = 'detail_' + id;
            var view_id = 'view_' + id;
            var hide_id = 'hide_' + id;
            document.getElementById(detail_id).className = document.getElementById(detail_id).className.replace("show", "hidden");
            document.getElementById(hide_id).className = document.getElementById(hide_id).className.replace("show", "hidden");
            document.getElementById(view_id).className = document.getElementById(view_id).className.replace("hidden", "show");
        }

        function cancelDetails(id) {
            var a = confirm('Do you want to cancel this Print Job?')
            if (a == true) {

                //Enter Script for Cancelling Print Job
                alert('Print Job cancelled successfully')

            }
        }

        function changeProfile() {

            //File Upload
            var fileName = document.getElementById('profile').value;
            if (fileName == "") {
                alert("Select a File!")
                document.getElementById('submitfile').focus()
                return false
            }
            var allowed_extensions = new Array("jpg", "png", "jpeg", "bmp");
            var file_extension = fileName.split('.').pop().toLowerCase(); // split function will split the filename by dot(.), and pop function will pop the last element from the array which will give you the extension as well. If there will be no extension then it will return the filename.

            for (var i = 0; i <= allowed_extensions.length; i++) {
                if (allowed_extensions[i] == file_extension) {

                    //Enter Script for Updating Profile Picture in Database
                    // document.getElementById('profile_pic').setAttribute("src",fileName)

                    alert('Profile Picture Changed Successfully')
                    document.getElementById('profile').value = "";
                    return true; // valid file extension
                }
            }

            alert("Invalid file format!")
            document.getElementById('profile').focus()
            return false;
        }

        function updateprofile() {

            //Script fot Updating Profile Details

            alert('Profile Updated Successfully!')

        }

        function changepassword() {
            var current_psw = document.getElementById('current_psw').value;
            var new_psw = document.getElementById('new_psw').value;
            var retype_psw = document.getElementById('retype_psw').value;

            //Script to check if current password is true
            // alert('Error: Incorrect Current Password!')
            // document.getElementById('current_psw').focus();
            // return false


            if (new_psw != retype_psw) {
                alert("Error: Passwords do not match!");
                document.getElementById('retype_psw').focus();
                return false;
            }

            //Password Change Script

            alert('Password Changed Successfully');

        }

        function logout() {
            var a = confirm('Do you want to logout?')
            if (a == true) {

                //Logout Script

                alert('Logged Out Successfully!')
                window.location.href = './index.html'
            }
        }



        var modal = document.getElementById('feedbackmodal');
        document.getElementById('modalclose').addEventListener('click', function () {
            modal.style.display = "none";
        });

        function feedback(id) {

            modal.style.display = 'block'
            var form = document.getElementsByName('feedbackform')[0];
            form.setAttribute("id", id);
        }

        function ratejob() {

            //Code for Rate form validation

            var feedback = document.getElementById('feedback').value;
            if (feedback == "") {
                alert('Enter Feedback!');
                document.getElementById('feedback').focus();
                return false
            }

            alert('Rated')
            modal.style.display = "none";
        }


        "use strict";

        function goMap() {
            if ($('#map').length) {
                // Styles a map in night mode.
                var map = new google.maps.Map(document.getElementById('map'), {
                    center: {
                        lat: 9.462738,
                        lng: 76.548700
                    },
                    zoom: 12,
                    scrollwheel: false
                });

                // To add the marker to the map
                var image = 'images/logo/map.png';
                var beachMarker = new google.maps.Marker({
                    position: {
                        lat: 9.462738,
                        lng: 76.548700
                    },
                    map: map,
                    icon: image,
                    title: "simpleprint Office!",
                    infoWindow: {
                        content: '<h6>Inovus Labs</h6> <p>Kristu Jyoti College</p>'
                    }
                });
            };
        };
        // Dom Ready Function
        jQuery(document).on('ready', function () {
            (function ($) {
                // add your functions
                goMap()
            })(jQuery);
        });

        var placeSearch, autocomplete, globalSpace;
        var componentForm = {
            street_number: 'short_name',
            route: 'long_name',
            locality: 'long_name',
            administrative_area_level_1: 'short_name',
            country: 'long_name',
            postal_code: 'short_name'
        };

        function initAutocomplete() {
            // Create the autocomplete object, restricting the search to geographical
            // location types.
            autocomplete = new google.maps.places.Autocomplete(
                /** @type {!HTMLInputElement} */
                (document.getElementById('city')), {
                    types: ['geocode']
                });

            // When the user selects an address from the dropdown, populate the address
            // fields in the form.
            autocomplete.addListener('place_changed', fillInAddress);
        }

        function fillInAddress() {


            // Get the place details from the autocomplete object.

            var place = autocomplete.getPlace();
            globalSpace = place;
            document.getElementsByName('shop_lon')[0].value = place.geometry.location.lng();
            document.getElementsByName('shop_lat')[0].value = place.geometry.location.lat();
            document.getElementById('location_label').innerHTML = place.geometry.location.lng() + ',' + place.geometry.location.lat()

            console.log(place)
            return;

        }

        var services = {};

        function fetchServices() {

            fetch('/user/list_services')
                .then(data => data.json())
                .then(json => {

                    //                    services = json;

                    var services_html = '<option value="none"> Select Service </option>';

                    var temp_services = {}

                    for (var i = 0; i < json.length; i++) {

                        console.log(json[i].service_name)

                        if (typeof temp_services[json[i].service_name] != 'undefined') {


                            continue;
                        }

                        temp_services[json[i].service_name] = 1
                        services[json[i].service_name] = []

                        for (var j = 0; j < json.length; j++) {

                            if (json[i].service_name == json[j].service_name) {
                                services[json[i].service_name].push(json[j])
                            }
                        }


                        services_html += "<option value=\"" + json[i].service_name + "\">" + json[i].service_name + "</option>"


                    }

                    document.getElementById('service').innerHTML = services_html

                })

        }

        document.getElementById('service').addEventListener('click', function (e) {




            console.log(e.target.value)

            var sizes = services[e.target.value]

            var size_html = '<option> Select Size</option>'


            for (var j = 0; j < sizes.length; j++) {

                size_html = "<option value=\"" + sizes[j].service_id + "\">" + sizes[j].document_size + "</option>"

            }

            document.getElementById('document_size').innerHTML = size_html

        })

        fetchServices()


        active_services = []


        document.getElementById('submitfile').addEventListner('change', function (e) {

            var file = this.files[0];
            uploadFile(file, 'item_image', function (err, img_url) {

                if (err) {

                    notyf.alert('Error uploading image!')

                } else {

                    item_img.dataset.url = img_url;
                    item_img.dataset.status = 1;
                }

            });


        })


        function uploadFile(file, cb) {

            var frm = new FormData();
            frm.append("image", file);
            qwest.post('user/upload', frm)
                .then(function (xhr, json) {

                    if (json.error == 0) {
                        if (cb) {
                            cb(null, json.image_url)
                        } else {

                            if (cb) {
                                cb(null);
                            }
                        }
                    }

                });

        }