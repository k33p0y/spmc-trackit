$(document).ready(function () {
    // Store files to array
    // Global Variable
    var file_arr = new Array();

    $('#file_upload').on('change', function () {
        const files = this.files;
        const file_lists = $('.upload-zone');
        // const file_item = $('.file_lists .file-row');

        if (files) $('.upload-content').addClass('d-none');
        else $('.upload-content').removeClass('d-none');

        // Appending Display
        Object.values(files).forEach(file => {
            file_lists.append(
                `<div class="card zone-item w-25 h-100 m-2">
                    <div class="card-body p-0 m-0">
                        <button class="btn btn-danger btn-remove" data-file-id="file_${file.name}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <img src="${URL.createObjectURL(file)}" class="card-img-top" id="${file.name}" alt="...">
                    </div>
                </div>`
            )
        });
    });

    // Remove Attachment
    $('.upload-zone').on('click', '.btn-remove', function () {
        let file_id = $(this).data().fileId;

        // loop through the files array and check if the file id of that file matches data-file-id
        // and get the index of the match
        for (var i = 0; i < file_arr.length; ++i) {
            if (file_id == file_arr[i].id) file_arr.splice(i, 1);
        };

        // remove to appended div
        $(this).parents("div.zone-item ").remove();
    });

});