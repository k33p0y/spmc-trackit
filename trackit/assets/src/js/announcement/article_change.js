$(document).ready(function () {
    
    // save and publish button
    $('#btn_publish').click(function (e) {
        e.preventDefault();
        const article = $(this).data().articleId;
        let data = new Object();
        data.title = $('#txt_title').val();
        data.preface = $('#txt_preface').val();
        data.content = 'Sample Content';
        data.is_publish = true;
        data.is_active = ($('#is_active_switch').is(":checked")) ? true : false;
        putArticle(data, article)
    });

    // save button 
    $('#btn_save').click(function (e) {
        e.preventDefault();
        const article = $(this).data().articleId;
        let data = new Object();
        data.title = $('#txt_title').val();
        data.preface = $('#txt_preface').val();
        data.content = 'Sample Content';
        data.is_active = ($('#is_active_switch').is(":checked")) ? true : false; 
        putArticle(data, article)
    });

    let putArticle = function(data, article) {
        axios({
            method: 'PUT',
            url: `/api/announcement/all/article/${article}/`,
            data: data,
            headers: axiosConfig,
        }).then(function (res) { // success
            $.when(toastSuccess('Success')).then(() => $(location).attr('href', '/announcement/lists')) // Alert
        }).catch(function (err) { // error
            toastError(err.response.statusText) // alert
            if (err.response.data.title) showFieldErrors(err.response.data.title, 'title'); else removeFieldErrors('title');
        });
    };


    let showFieldErrors = function(obj, field) {
        // Enable button
        $("#btn_save").prop('disabled', false);

        // Add error class change border color to red
        if (field == 'title') $(`#txt_${field}`).addClass('form-error');

        // error message
        let msg = '';
        obj.forEach(error => {msg += `${error} `});
        $(`#${field}_error`).html(`*${msg} `)
    };

    let removeFieldErrors = function(field) {
        // Remove error class for border color
        if (field == 'title') $(`#txt_${field}`).removeClass('form-error');
        $(`#${field}_error`).html('');
    };
});