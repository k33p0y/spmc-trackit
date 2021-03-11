// // // // Global Scope

// Store files to array
var file_arr = new Array();

// upload function
function uploadAttachment(ticket_id) {
   if (file_arr.length > 0) {               
      // loop through file attached
      $.each(Object.values(file_arr), function(index, value) {
         let form_data = new FormData();

         // new objcet for file extra data
         let file_obj = new Object();
         file_obj.description = $(`#desc_${index}`).val();
         file_arr.ticket = ticket_id

         // extra data convert to blob
         let blob = new Blob([JSON.stringify(file_obj)], {type: 'application/json'});

         // append to formData
         form_data.append('file', value.file)
         form_data.append('data', blob)

         axios({
            method: 'POST',
            url: '/api/requests/attachments/',
            data: form_data,
            headers: uploadConfig 
         });                
      });
   };
}

$(document).ready(function () {
   // File Upload
   $('#file_upload').on('change', function() {
      const files = this.files;
      const file_lists = $('#file_lists');
      let counter = 0;

      if(files) $('#btn_clear').removeClass('d-none');

      // Appending Display
      Object.values(files).forEach(file => {
         let type = fileType(file.type, media_type);
         let size = fileSize(file.size);
         
         if (type == 'invalid') { // If file is not registered
            this.value = "";
            Toast.fire({
               icon: 'error',
               title: 'File type is not supported!',
            })
         } else if (size == 'invalid') { // If file is more than 25MB
            this.value = "";
            Toast.fire({
               icon: 'error',
               title: 'File is too big!',
            })
         } else {
            file_lists.append(
               `<div class="list-group-item border-0 d-flex p-1 mb-1">
                  <div class="file-icon"><i class="far fa-lg ${type}"></i></div>
                  <div style="line-height:15px; width:15%;">
                     <p class="mb-0 font-weight-bold text-truncate text-xs">${file.name}</p>
                     <small class="mb-0">${size}</small>
                  </div>
                  <div class="flex-grow-1 m-0 ml-4 mr-2">
                     <input type="text" class="form-control form-control-sm m-0" id="desc_${counter}" placeholder="Add Description*">
                     <small class="error-info" id="error-info-type"></small>
                  </div>
                  <div>
                     <button type="button" class="btn btn-sm btn-block btn-remove" data-file-id="file_${counter}">
                        <i class="fas fa-times text-orange"></i>
                     </button>
                  </div>
               </div>`
            )
            file_arr.push({
               id : `file_${counter}`,
               file: file 
            });
            counter++;
         }    
      });
   });

   // Remove Attachment
   $('#file_lists').on('click', '.btn-remove', function () {
      let file_id = $(this).data().fileId;
      
      // loop through the files array and check if the file id of that file matches data-file-id
      // and get the index of the match
      for (var i = 0; i < file_arr.length; ++i) {
         if (file_id == file_arr[i].id) file_arr.splice(i, 1);
      };

      // remove to appended div
      $(this).parents("div.list-group-item").remove();
   });

   // Clear All Attachment
   $('#btn_clear').click(function () {
      $('#file_upload').val('');
      $('#file_lists').empty();
      $('#btn_clear').addClass('d-none');
      file_arr = new Array();
   });   
});