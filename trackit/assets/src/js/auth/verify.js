$(document).ready(function () {
    // Store files to array
    // Global Variable
    var file_arr = new Array();

    const errorAlert = function (message) {
        Swal.fire({
            icon: 'error',
            title: 'Ooops',
            html: `<p class="text-secondary"> ${message} </p>`,
            showConfirmButton: false,
            timer: 2000,
        });
    };

    const successAlert = function (message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            html: `<p class="text-secondary"> ${message} </p>`,
            showConfirmButton: false,
            timer: 2000,
        })
    }

    const imageSize = function (bytes) {
        let file_size;
        if (bytes < 1024) {
            file_size = `${bytes} bytes`;
        } else if (bytes >= 1024 && bytes < 1024000) { // Convert Bytes to Kilobytes
            bytes = (bytes / 1024).toFixed(1);
            file_size = `${bytes} KB`;
        } else if (bytes > 1024000 && bytes <= 5242880) { // Convert Bytes to MegaBytes & set limit 5MB 
            bytes = (bytes / 1024000).toFixed(1);
            file_size = `${bytes} MB`;
        } else { // Invalid Size 
            file_size = 'invalid';
        }
        return file_size;
    };

    const imageType = function (file_type) {
        let media_type = ['image/png', 'image/jpeg'];
        let image_type;

        if (media_type.includes(file_type)) image_type = "fa-file-image"
        else image_type = 'invalid';

        return image_type;
    };

    // browse file upload
    $('#file_upload').on('change', function () {
        const files = this.files;
        const file_lists = $('.upload-zone');

        // limit maximum files
        if (files.length <= 2) {
            if (file_arr.length < 2) {

                // placeholder 
                if (files) $('.upload-content').addClass('d-none');
                else $('.upload-content').removeClass('d-none');

                // Appending Display
                Object.values(files).forEach(file => {
                    let type = imageType(file.type);
                    let size = imageSize(file.size);

                    if (type == 'invalid') { // If file is not registered
                        this.value = "";
                        errorAlert('File type is not supported!');
                    } else if (size == 'invalid') { // If image is more than 5MB
                        this.value = "";
                        errorAlert('Image is too big!');
                    } else {
                        file_lists.append(
                            `<div class="card zone-item w-50 h-100 m-2">
                                <div class="card-body p-1 m-0">
                                    <button class="btn btn-danger btn-remove" data-file-id="file_${file.name}">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <img src="${URL.createObjectURL(file)}" class="card-img-top" id="${file.name}" alt="...">
                                </div>
                                <div class="card-footer p-1 m-0">
                                    <span class="far ${type} text-warning text-center"></span>
                                    <small class="text-muted text-center">${size}</small>
                                </div>
                            </div>`
                        )
                        file_arr.push({
                            id: `file_${file.name}`,
                            file: file
                        });
                    }
                });
            } else errorAlert('You can only upload a maximum of 2 files');
        } else errorAlert('You can only upload a maximum of 2 files');
    });

    // remove Attachment
    $('.upload-zone').on('click', '.btn-remove', function () {
        let file_id = $(this).data().fileId;

        // loop through the files array and check if the file id of that file matches data-file-id
        // and get the index of the match
        for (var i = 0; i < file_arr.length; ++i) {
            if (file_id == file_arr[i].id) file_arr.splice(i, 1);
        };

        // remove to appended div
        $(this).parents("div.zone-item ").remove();

        // show placeholder
        if (!file_arr.length) $('.upload-content').removeClass('d-none');
    });

    // upload files submit
    $('#btn_submit').click(function (e) {
        e.preventDefault()
        $(this).prop('disabled', true)


        // if array is not empty
        if (file_arr.length > 0) {
            var percent = 0;
            let file_loaded = 1;

            $(".btn-remove").addClass('d-none')
            $(".upload-overlay").removeClass('d-none')

            file_arr.forEach(file => { // iterate each array
                let form_data = new FormData()
                form_data.append('file', file.file)

                axios.post('/api/core/all/verification/', form_data, {
                    headers: uploadConfig
                }).then(response => {
                    percent = Math.round(((file_loaded) / file_arr.length) * 100);
                    $('#upload_progress').animate(
                        { "width": `${percent}%` }, 0, function () {
                            if (percent == 100) $('#upload_progress').html(`${percent}%`);
                            else $('#upload_progress').html(`Uploading ${percent}%`);
                        }
                    );
                    file_loaded++;
                    if (percent == 100) {
                        setTimeout(() => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Verification Complete',
                                html: `<p class="text-secondary">You'll be able to create requests after we review your information and verify it within approximately 24 hours.</p>`,
                                confirmButtonColor: '#17a2b8',
                            }).then(() => {
                                $(location).attr('href', '/')
                            })
                        }, 500);
                    }
                }).then().catch(error => {
                    errorAlert(error)
                });
            })

        } else {
            errorAlert('Please choose a file to upload')
            $('.btn-remove').removeClass('d-none')
            $(".upload-overlay").addClass('d-none')
            $(this).prop('disabled', false)
        }
    });

    // skip button 
    $('#btn_skip').click(function (e) {
        e.preventDefault()

        Swal.fire({
            title: 'Verify Later',
            html: '<p class="m-0">You may verify your account on your profile page. Continue?</p>',
            icon: 'question',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Proceed',
            confirmButtonColor: '#17a2b8',
            reverseButtons: true
        }).then((result) => {
            if (result.value) $(location).attr('href', '/');
        });
    });
});