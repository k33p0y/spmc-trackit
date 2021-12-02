$(document).ready(function () {
    // data privacy notice modal
    // reset form in modal
    $('#chk_agree').prop('checked', false);
    $('#btn_agree').prop('disabled', true);
    // modal option
    $('#noticeModal').modal({
        show: true,
        backdrop: 'static',
        keyboard: false,
    });
    // notice modal event
    $('#noticeModal').on('shown.bs.modal', function (e) {
        // Checkbox change event enable button
        $('#chk_agree').change(function () {
            if (this.checked) $('#btn_agree').prop('disabled', false);
            else $('#btn_agree').prop('disabled', true);
        });
        // Aggree button
        $('#btn_agree').click(function () {
            $('#noticeModal').modal('hide');
        });
    })

    // select2 config
    $('#select2_department').select2({
        placeholder: 'Department',
        allowClear: true,
    });

    // autofill username
    $('#txt_firstname, #txt_lastname').keyup(function () {
        createUsername();
    });

    // submit sign up form
    $("#btn_signup").click(function (e) {
        e.preventDefault();

        // declare new object
        let data = new Object();
        data.first_name = $('#txt_firstname').val();
        data.last_name = $('#txt_lastname').val();
        data.contact_no = $('#txt_contact').val();
        data.license_no = $('#txt_license').val();
        data.department = $('#select2_department').val();
        data.email = $('#txt_email').val();
        data.username = $('#txt_username').val();
        data.password = $('#txt_password1').val();
        data.password2 = $('#txt_password2').val();

    }); // submit form end

    // concat firstname and lastname for username
    let createUsername = function () {
        let first_name = $("#txt_firstname").val().charAt(0)
        let last_name = $("#txt_lastname").val();
        let username = first_name + last_name
        $('#txt_username').val(username.toLowerCase())
    }
})