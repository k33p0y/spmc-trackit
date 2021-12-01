$(document).ready(function () {
    // select2 config
    $('#select2_department').select2({
        placeholder: 'Department',
        allowClear: true,
    });

    // autofill username
    $('#txt_firstname, #txt_lastname').keyup(function () {
        createUsername();
    });

    // prevent field to enter letters
    $("#txt_contact").keyup(function () {
        $("#txt_contact").val(this.value.match(/[0-9]*/));
    });

    // submit sign up form
    $("#btn_signup").click(function (e) {
        e.preventDefault();

        // Variables
        let data = {}
        data.firstname = $('#txt_firstname').val();
        data.lastname = $('#txt_lastname').val();
        data.contact = $('#txt_contact').val();
        data.license = $('#txt_license').val();
        data.department = $('#select2_department').val();
        data.email = $('#txt_email').val();
        data.username = $('#txt_username').val();
        data.password1 = $('#txt_password1').val();
        data.password2 = $('#txt_password2').val();

    }); // submit form end

    let createUsername = function () {
        let first_name = $("#txt_firstname").val().charAt(0)
        let last_name = $("#txt_lastname").val();
        let username = first_name + last_name
        $('#txt_username').val(username.toLowerCase())
    }

})