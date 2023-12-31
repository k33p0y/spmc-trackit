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

    let formatResult = function(state) {
        let data = $(state.element).data()
        let option = $(`<div><div class="font-weight-bold">${state.text}</div> ${data ? `<div class='text-xs'>Head: ${data.head}</div>`: ''}</div>`);
        return option;
     } 
     let formatSelection = function(state) {
        let data = $(state.element).data()
        let option = $(`<div>${state.text} ${data ? `(Head: ${data.head})</div>`: ''}`);
        
        if (!state.id) return 'Department *';
        return option;
     } 
  
     let stringMatch = function(term, candidate) {
        return candidate && candidate.toLowerCase().indexOf(term.toLowerCase()) >= 0;
     }
  
     let customMatch = function(params, data) {
        // If there are no search terms, return all of the data
        if ($.trim(params.term) === '') {
            return data;
        }
        // Do not display the item if there is no 'text' property
        if (typeof data.text === 'undefined') {
            return null;
        }
        // Match text of option
        if (stringMatch(params.term, data.text)) {
            return data;
        }
        // Match attribute "data-foo" of option
        if (stringMatch(params.term, $(data.element).attr('data-head'))) {
            return data;
        }
        // Return `null` if the term should not be displayed
        return null;
    }
      
    $('#select2_department').select2({
        allowClear: true,
        cache: true,
        placeholder: 'Department *',
        matcher: customMatch,
        templateResult: formatResult,
        templateSelection: formatSelection,
        sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
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

        // post axios
        axios({
            method: 'POST',
            url: '/api/auth/registration/',
            data: data,
            headers: axiosConfig
        }).then(function (res) { //response
            // send notification
            socket_notification.send(JSON.stringify({type: 'user_notification', data: {object_id: res.data.id, notification_type: 'register'}})), 
            $.when(
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    html: '<p class="text-secondary"> You have succesfully registered </p>',
                    showConfirmButton: false,
                    timer: 2000,
                }),
            ).then(() => $(location).attr('href', `/verification/`))
        }).catch(function (err) { // error
            Swal.fire({
                icon: 'error',
                title: 'Ooops',
                html: `<p class="text-secondary">${err.response.statusText} </p>`,
                showConfirmButton: false,
                timer: 1200,
            });
            
            if (err.response.data.last_name) showFieldErrors(err.response.data.last_name, 'lastname'); else removeFieldErrors('lastname');
            if (err.response.data.first_name) {
                if (err.response.data.first_name) showFieldErrors(err.response.data.first_name, 'firstname'); else removeFieldErrors('firstname');
                if (err.response.data.first_name.fullname) showFieldErrors(err.response.data.first_name.fullname, 'fullname'); else removeFieldErrors('fullname');
            } else removeFieldErrors('firstname');
            if (err.response.data.contact_no) showFieldErrors(err.response.data.contact_no, 'contact'); else removeFieldErrors('contact');
            if (err.response.data.department) showFieldErrors(err.response.data.department, 'department'); else removeFieldErrors('department');
            if (err.response.data.email) showFieldErrors(err.response.data.email, 'email'); else removeFieldErrors('email');
            if (err.response.data.username) showFieldErrors(err.response.data.username, 'username'); else removeFieldErrors('username');
            if (err.response.data.password) showFieldErrors(err.response.data.password, 'password'); else removeFieldErrors('password');

        });
    }); // submit form end

    // concat firstname and lastname for username
    let createUsername = function () {
        let first_name = $("#txt_firstname").val().charAt(0)
        let last_name = $("#txt_lastname").val();
        let username = first_name + last_name
        $('#txt_username').val(username.toLowerCase())
    }
    // show field errors
    let showFieldErrors = function (obj, field) {
        let errors = ''
        for (i = 0; i < obj.length; i++) errors += `${obj[i]} `;
        $(`#${field}_error`).html(`*${errors}`)
        
        if (field === 'password') {
            $(`#txt_${field}1`).addClass('form-error')
            $(`#txt_${field}2`).addClass('form-error')
        } else if (field === 'fullname') {
            $(`#txt_firstname`).addClass('form-error')
            $(`#txt_lastname`).addClass('form-error')
            $(`#firstname_error`).html(`*${errors}`)
        } else if (field === 'department') {
            $(`#select2_${field}`).next().find('.select2-selection').addClass('form-error')
        } else $(`#txt_${field}`).addClass('form-error');  
    };
    // remove field errors
    let removeFieldErrors = function (field) {
        $(`#${field}_error`).html(``)
        if (field === 'password') {
            $(`#txt_${field}1`).removeClass('form-error')
            $(`#txt_${field}2`).removeClass('form-error')
        } else if (field === 'department') {
            $(`#select2_${field}`).next().find('.select2-selection').removeClass('form-error')
        } else $(`#txt_${field}`).removeClass('form-error');
        
    };
})