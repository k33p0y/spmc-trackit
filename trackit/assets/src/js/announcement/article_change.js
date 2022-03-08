$(document).ready(function () {

    $('#char_count').html($('#txt_preface').val().length);

    // TinyMCE WYSISWYG Editor
    $('#txt_content').tinymce({
        height: 500,
        menubar: true,
        plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime table paste code help wordcount'
        ],
        toolbar: 'undo redo | formatselect | fontselect | fontsizeselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
    });

    // character counter
    $('#txt_preface').on("input", function() {
        let maxlength = $(this).attr("maxlength");
        let currentLength = $(this).val().length;
        $('#char_count').html(currentLength);

        if (currentLength >= maxlength) $('#preface_error').html("You have reached the maximum number of characters.");
        else $('#preface_error').html("")
    });
    
    // save button 
    $('#btn_save').click(function (e) {
        e.preventDefault();
        $(this).attr('disabled', true) //  disable button
        const article = $(this).data().articleId;
        let data = new Object();
        data.title = $('#txt_title').val();
        data.preface = $('#txt_preface').val();
        data.content = tinyMCE.activeEditor.getContent();
        data.is_publish = ($('#is_publish_switch').is(":checked")) ? true : false; 
        data.is_active = ($('#is_active_switch').is(":checked")) ? true : false; 
        
        axios({
            method: 'PUT',
            url: `/api/announcement/article/${article}/`,
            data: data,
            headers: axiosConfig,
        }).then(async function (res) { // success
            if (file_arr.length > 0) await uploadResources(res.data.id, file_arr)  // upload attachments
        }).then(function () {
            $.when(toastSuccess('Success')).then(() => {
                $('#btn_save').attr('disabled', false) // enable button
                $(location).attr('href', '/announcement/lists')
            }) // Alert
        }).catch(function (err) { // error
            toastError(err.response.statusText) // alert
            if (err.response.data.title) showFieldErrors(err.response.data.title, 'title'); else removeFieldErrors('title');
            if (err.response.data.preface) showFieldErrors(err.response.data.preface, 'preface'); else removeFieldErrors('preface');
        });
    });

    let showFieldErrors = function(obj, field) {
        // Enable button
        $("#btn_save").prop('disabled', false);

        // Add error class change border color to red
        if (field == 'title') $(`#txt_${field}`).addClass('form-error');
        if (field == 'preface') $(`#txt_${field}`).addClass('form-error');

        // error message
        let msg = '';
        obj.forEach(error => {  msg += `${error} `});
        $(`#${field}_error`).html(`*${msg} `)
    };

    let removeFieldErrors = function(field) {
        // Remove error class for border color
        if (field == 'title') $(`#txt_${field}`).removeClass('form-error');
        $(`#${field}_error`).html('');
    };
});