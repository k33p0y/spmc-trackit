$(document).ready(function () {

    // TinyMCE WYSISWYG Editor
    $('#txt_content').tinymce({
        height: 500,
        menubar: true,
        toolbar: 'undo redo | formatselect | fontselect | fontsizeselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
        content_style: 'body { font-size:12px }'
    });
    
    // save and publish button
    $('#btn_publish').click(function (e) {
        e.preventDefault();

        let data = new Object();
        data.title = $('#txt_title').val();
        data.preface = $('#txt_preface').val();
        data.content = tinyMCE.activeEditor.getContent();
        data.is_publish = true;
        postArticle(data);        
    });

    // save button 
    $('#btn_save').click(function (e) {
        e.preventDefault();

        let data = new Object();
        data.title = $('#txt_title').val();
        data.preface = $('#txt_preface').val();
        data.content = tinyMCE.activeEditor.getContent();
        data.is_publish = false;
        postArticle(data);
    });

    // character counter
    $('#txt_preface').on("input", function() {
        let maxlength = $(this).attr("maxlength");
        let currentLength = $(this).val().length;
        $('#char_count').html(currentLength);

        if (currentLength >= maxlength) $('#preface_error').html("You have reached the maximum number of characters.");
        else $('#preface_error').html("")
    });

    let postArticle = function(data) {
        axios({
            method: 'POST',
            url: `/api/announcement/all/article/`,
            data: data,
            headers: axiosConfig,
        }).then(async function (res) { // success
            if (file_arr.length > 0) await uploadResources(res.data.id, file_arr)  // upload attachments
        }).then(function () {
            $.when(toastSuccess('Success')).then(() => $(location).attr('href', '/announcement/lists')) // alert
        }).catch(function (err) { // error
            toastError(err.response.statusText);
            if (err.response.data.title) showFieldErrors(err.response.data.title, 'title'); else removeFieldErrors('title');
            if (err.response.data.preface) showFieldErrors(err.response.data.preface, 'preface'); else removeFieldErrors('preface');
        });
    };

    let showFieldErrors = function(obj, field) {
        // Enable button
        $("#btn_save").prop('disabled', false);

        // Add error class change border color to red
        if (field == 'title') $(`#txt_${field}`).addClass('form-error');
        if (field == 'preface') $(`#txt_${field}`).addClass('form-error');

        // error message
        let msg = '';
        obj.forEach(error => {msg += `${error} `});
        $(`#${field}_error`).html(`*${msg} `)
    };

    let removeFieldErrors = function(field) {
        // Remove error class for border color
        if (field == 'title') $(`#txt_${field}`).removeClass('form-error');
        if (field == 'preface') $(`#txt_${field}`).removeClass('form-error');
        $(`#${field}_error`).html('');
    };
});