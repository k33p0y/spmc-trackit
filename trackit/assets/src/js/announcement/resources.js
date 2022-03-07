// Store files to array
// Global Variable
var file_arr = new Array();

$(document).ready(function () {
    // browse files append
   $('#file_upload, #side_file_upload').on('change', function() {
        const files = this.files;
        const file_lists = $('#upload_wrapper, #side_upload_wrapper');

        if(files) $('#btn_clear, #side_btn_clear, #upload_wrapper, #side_upload_wrapper').removeClass('d-none');

        // Appending Display
        Object.values(files).forEach(file => {
            let type = fileType(file.type, media_type);
            let size = fileSize(file.size);
            
            if (type == 'invalid') { // If file is not registered
                this.value = "";
                toastError('File type is not supported!');
            } else if (size == 'invalid') { // If file is more than 25MB
                this.value = "";
                toastError('File is too big!');
            } else {
                file_lists.append(
                    `<div class="col file-item">
                        <div class="card">
                            <button class="btn btn-orange btn-remove" data-file="file_${file.name}">
                                <i class="fas fa-times"></i>
                            </button>
                            <div class="d-flex flex-row align-items-center p-2">
                                <div class="far fa-3x ${type}"></div>
                                <div class="card-body p-0 ml-2">
                                    <p class="m-0">${file.name}</p>
                                    <small class="text-muted">${size}</small>
                                </div>
                            </div>
                        </div>
                    </div>`
                )
                file_arr.push({
                    id: `file_${file.name}`,
                    file: file
                });
            }    
        });
    });

    // remove attachment
    $('.file-upload-wrap').on('click', '.btn-remove', function () {
        let file = $(this).data().file;
        // loop through the files array and check if the file id of that file matches data-file-id
        // and get the index of the match
        for (var i = 0; i < file_arr.length; ++i) {
            if (file == file_arr[i].id) file_arr.splice(i, 1);
        };
        // remove to appended div
        $(`button[data-file='${file}']`).parents("div.file-item").remove();
    });

    // clear all resources
    $('#btn_clear, #side_btn_clear').click(function () {
        file_arr = new Array();
        $('#file_upload, #side_file_upload').val('');
        $('.file-upload-wrap').empty();
        $('#btn_clear, #side_btn_clear').addClass('d-none');
        $('#upload_wrapper, #side_upload_wrapper').addClass('d-none'); 
    });

    // delete attachment
    $('.file-item, .side-file-item').on('click', '.btn-delete', function () {
        let file = $(this).data().file;

        Swal.fire({
            title: 'Delete Attachment',
            html: '<p class="m-0">This will remove from the lists.</p>',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Delete',
            confirmButtonColor: '#c44a56',
            reverseButtons: true
         }).then((result) => {
            if (result.value) {
                $(this).attr('disabled', true);     

                axios({
                    method: 'DELETE',
                    url: `/api/news/resources/${file}/`,
                    headers: axiosConfig
                }).then(function (response) {
                    $.when(toastSuccess('Success')).then(function () {
                        location.reload();
                    });
                }).catch(function (error) {
                    toastError(error);
                });
            }
        });
    });

});