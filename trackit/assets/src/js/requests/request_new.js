let success = 1;

$(document).ready(function () {

   var request_form, department, category, category_type;
   var data_obj;
   var file_data

   // MIME TYPES REGISTER
   const media_type = new Object();
   media_type.text = ['text/plain'];
   media_type.pdf = ['application/pdf'];
   media_type.spreadsheet = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','application/vnd.oasis.opendocument.spreadsheet','text/csv'];
   media_type.document = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword','application/vnd.oasis.opendocument.text'];
   media_type.presentation = ['application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-powerpoint','application/vnd.oasis.opendocument.presentation'];
   media_type.image = ['image/png','image/jpeg'];
   
   // SELECT2 CONFIGURATION
   $('#dd_departments').select2({ // department select2
      allowClear: true,
      placeholder: 'Select Department',
      cache: true,
   });

   $('#dd_forms').select2({ // request form select2
      allowClear: true,
      placeholder: 'Select Form',
      cache: true,
   });

   $('#dd_types').select2({ // category type select2
      allowClear: true,
      placeholder: 'Select Category Type',
      cache: true,
   });

   $('#dd_categories').select2({ // categories select2
      allowClear: true,
      placeholder: 'Select Category',
      cache: true,
   });
 
   // SElECT ON CHANGE EVENT
   $('#dd_departments').on('change', function () { // department dropdown
      department = $("#dd_departments option:selected").val();
   });
 
   $('#dd_forms').on('change', function () { // request form dropdown
      request_form = $("#dd_forms option:selected").val();

      axios({
         method: 'GET',
         url: `/api/requests/forms/${request_form}`,
         headers: axiosConfig,
      }).then(function (response) { // clear div elements
         $('.body-info').remove();
         $('.form-wrapper').empty();
         $(".form-admin-wrapper").empty();

         return response.data.fields
      }).then(function (response) { // Add to global object
         return data_obj = new Object(response)
      }).then(function (response) { // generate form fields
         let has_admin;
         
         response.forEach(data => {
            const title = data.title;
            const form_field = data.form_field;
            const is_admin = data.is_admin;

            if (is_admin == true) {
               form_wrapper = $(".form-admin-wrapper")
               $('.separator').removeClass('d-none');
            } else {
               form_wrapper = $(".form-wrapper")
            }

            if (form_field.length > 1) {
               form_wrapper.append(
                  `<div class="form-group">
                        <label>${title}</label>
                        <div class="type-group"></div>
                        <small class="error-info" id="error-${form_field.id}"></small>
                     </div>`
               );

               form_field.forEach(field => {
                  if (field.type == "text") {
                     $(".type-group").append(
                        `<input type="text" class="form-control form-control-sm" id="${field.id}" placeholder="Enter ${title}">`
                     );
                  }
                  if (field.type == "textarea") {
                     $(".type-group").append(
                        `<textarea class="form-control form-control-sm" id="${field.id}" placeholder="Enter ${title}" rows="2"></textarea>`
                     );
                  }
                  if (field.type == "radio") {
                     field.option.forEach(opt => {
                        $(".type-group").append(
                           `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                           <input type="radio" id="${opt.id}" name="${field.id}" />
                           <label for="${opt.id}">${opt.name}</label>
                        </div>`
                        );
                     });
                  }
                  if (field.type == "checkbox") {
							field.option.forEach(opt => {
								$(".type-group").append(
									`<div class="icheck-material-orange icheck-inline m-0 mr-3">
										<input type="checkbox" id="${opt.id}"/>
										<label for="${opt.id}">${opt.name}</label>
									</div>`
								);
							});
                  }
               });

            } else {
               if (form_field.type == "text") {
                  form_wrapper.append(
                     `<div class=" form-group">
                           <label> ${title} </label>
                           <input type="text" class="form-control form-control-sm" id="${form_field.id}" placeholder="Enter ${title}">
                           <small class="error-info" id="error-${form_field.id}"></small>
                        </div>`
                  );
               }
               if (form_field.type == "textarea") {
                  form_wrapper.append(
                     `<div class=" form-group">
                           <label> ${title} </label>
                           <textarea class="form-control form-control-sm" id="${form_field.id}" placeholder="Enter ${title}" rows="2"></textarea>
                           <small class="error-info" id="error-${form_field.id}"></small>
                        </div>`
                  );
               }
               if (form_field.type == "radio") {
                  form_wrapper.append(
                     `<div class="form-group">
                           <label> ${title} </label>
                           <div class="radio-group"></div>
                           <small class="error-info" id="error-${form_field.id}"></small>
                        </div>`
                  );
                  form_field.option.forEach(opt => {
                     $(".radio-group").append(
                        `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                              <input type="radio" id="${opt.id}" name="${form_field.id}" />
                              <label for="${opt.id}">${opt.name}</label>
                           </div>`
                     );
                  });
               }
               if (form_field.type == "checkbox") {
                  form_wrapper.append(
                     `<div class=" form-group">
                           <label> ${title}</label>
                           <div class="check-group"></div>
                           <small class="error-info" id="error-${form_field.id}"></small>
                        </div>`
                  );

                  form_field.option.forEach(opt => {
                     $(".check-group").append(
                        `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                              <input type="checkbox" id="${opt.id}"/>
                              <label for="${opt.id}">${opt.name}</label>
                           </div>`
                     );
                  });
               }
            }
         });
      }).then(function (response) { // show admin row
         $('#row-field-admin').removeAttr('hidden')
      });

   });
 
   $('#dd_types').on('change', function () { // category type dropdown
      category_type = $("#dd_types option:selected").val();

      axios({
         method: 'POST',
         url: '/requests/categories/json',
         data: {
            'type_id': category_type
         },
         headers: axiosConfig,
      }).then(function (response) { // set dropdown status
   
         $("#dd_categories")
            .empty()
            .append('<option></option>')
            .removeAttr('disabled');
   
         return response.data
      }).then(function (response) { // set dropdown status
         response.forEach(key => {
            $("#dd_categories").append(`<option value='${key.id}'>${key.name}</option>`)
         });
      });
   });
 
   $('#dd_categories').on('change', function () { // categories dropdown
      category = $("#dd_categories option:selected").val();
   });

   // File Upload
   $('#file_upload').on('change', function() {
      const files = this.files;
      const file_lists = $('#file_lists').empty()
      
      // Set variable to a new Array
      file_data = new Array();

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
                  <div class="file-icon">${type}</div>
                  <div class="w-100">
                     <p class="mb-0 font-weight-bold">${file.name}</p>
                     <small class="mb-0">${size}</small>
                  </div>
               </div>`
            )            
            
            file_data.push(file) // Push values to array
         }
      });
   })

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();
      
      let success = validateForms();
      if (success == 1) {

         // Data
         data = new Object();
         data.ticket_no = '';
         data.request_form = request_form;
         data.form_data = getFormValues(data_obj);
         data.category = category;
         data.department = department;
         data.is_active = true;
         data.is_archive = false;
         
         axios({
            method: 'POST',
            url: '/api/requests/lists/',
            data: data,
            headers: axiosConfig,
         }).then(function (response) { // success
            socket.send(
               JSON.stringify({ticket_id: response.data.ticket_id}) // send ticket_id to websocket
            )

            // disable submit button
            $(this).attr('disabled', true)
            $.when(
               Toast.fire({
                  icon: 'success',
                  title: 'Submit Successfully',
               }),
               $('.overlay').removeClass('d-none')
            ).then(function () {
               $(location).attr('href', '/requests/lists')
            });

         }).catch(function (error) { // error
            Toast.fire({
               icon: 'error',
               title: error,
            });
         });
      };
   });    
 });

function validateForms() {
   var success = 1;

   // Validate Request Details
   if ($('#dd_types').val() == '') {
      $('#dd_types').next().find('.select2-selection').addClass('form-error');
      $('#error-info-type').html('*This field cannot be empty')
      success--;
   } else {
      $('#dd_types').next().find('.select2-selection').removeClass('form-error');
      $('#error-info-type').html('');
   }
   
   if ($('#dd_departments').val() == '') {
      $('#dd_departments').next().find('.select2-selection').addClass('form-error');
      $('#error-info-department').html('*This field cannot be empty')
      success--;
   } else {
      $('#dd_departments').next().find('.select2-selection').removeClass('form-error');
      $('#error-info-department').html('');
   }

   if ($('#dd_categories').val() == '') {
      $('#dd_categories').next().find('.select2-selection').addClass('form-error');
      $('#error-info-category').html('*This field cannot be empty')
      success--;
   } else {
      $('#dd_categories').next().find('.select2-selection').removeClass('form-error');
      $('#error-info-category').html('');
   }

   if ($('#dd_forms').val() == '') {
      $('#dd_forms').next().find('.select2-selection').addClass('form-error');
      $('#error-info-form').html('*This field cannot be empty')
      success--;
   } else {
      $('#dd_forms').next().find('.select2-selection').removeClass('form-error');
      $('#error-info-form').html('');
   }

   return success;
}
// Get form Values
function getFormValues(data_obj) {
   let form_fields_obj = new Array();

   if(data_obj == null || data_obj == undefined) {
      $('.body-info').css('color', '#dc3545')
   } else {
      data_obj.forEach(data => {
         const form_field = data.form_field;
         let answer;
         
         if (form_field.length > 1) {
            form_field.forEach(field => {
               let optionBool = 0;
               let trigger = false;
   
               if(field.required == true) {
                  trigger = true;
               }
   
               if (field.type == "text" || field.type == "textarea") { // textfield
                  answer = $(`#${field.id}`).val();            
                  if(field.required == true && (answer == null || answer == '' || answer == undefined)) {
                     $(`#${field.id}`).addClass('form-error').parent().next().html('This field cannot be empty');
                     optionBool += 1;
                  }
               }
               if (field.type == "radio" || field.type == "checkbox") { // radio button
                  answer = new Array();
                  field.option.forEach(opt => {
                     answer.push({
                        "option_id": opt.id,
                        "option_name" : opt.name,
                        "option_value": ($(`#${opt.id}`).is(":checked")) ? true : false
                     })
                     optionBool += ($(`#${opt.id}`).is(":checked")) ? 1 : 0;
                  });
                  if(optionBool > 0 && trigger == true) $(`#error-${form_field.id}`).html('This field cannot be empty')
               }
   
               form_fields_obj.push({
                  "id":  field.id,
                  "type": field.type,
                  "value" : answer,
                  "required" : field.required
               });
            });
         } else {
            if (form_field.type == "text" || form_field.type == "textarea") { // textfield
               answer = $(`#${form_field.id}`).val();
               if(form_field.required == true && (answer == null || answer == '')) {
                  $(`#${form_field.id}`).addClass('form-error').next().html('This field cannot be empty');
               }
            }
            if (form_field.type == "radio" || form_field.type == "checkbox") { // radio button
               let optionBool = 0;
               let trigger = false;
   
               if(form_field.required == true) {
                  trigger = true;
               }
   
               answer = new Array();
               form_field.option.forEach(opt => {
                  answer.push({
                     "option_id": opt.id,
                     "option_name" : opt.name,
                     "option_value": ($(`#${opt.id}`).is(":checked")) ? true : false
                  })
                  optionBool += ($(`#${opt.id}`).is(":checked")) ? 1 : 0;
               });
               if(optionBool == 0 && trigger == true) $(`#error-${form_field.id}`).html('This field cannot be empty')
            }
   
            form_fields_obj.push({
               "id":  form_field.id,
               "type": form_field.type,
               "value" : answer,
               "required": form_field.required
            });
         }
      });
   }


	return form_fields_obj;
}
function fileType(file_type, media_type) {
   let file_icon;

   if (media_type.text.includes(file_type)) { // Text File
      file_icon = '<i class="far fa-file-alt"></i>'
   } else if (media_type.pdf.includes(file_type)) { // PDF File
      file_icon = '<i class="far fa-file-pdf text-danger"></i>'
   } else if (media_type.spreadsheet.includes(file_type)) { // Excel or CSV File
      file_icon = '<i class="far fa-file-excel text-success"></i>'
   } else if (media_type.document.includes(file_type)) { // Word or Document File
      file_icon = '<i class="far fa-file-word text-primary"></i>'
   } else if (media_type.presentation.includes(file_type)) { // Powerpoint File
      file_icon = '<i class="far fa-file-powerpoint text-orange"></i>'
   } else if (media_type.image.includes(file_type)) { // Image File
      file_icon = '<i class="far fa-file-image text-warning"></i>'
   } else { // Invalid File
      file_icon = 'invalid';
   }

   return file_icon;
}
function fileSize(bytes) {
   let file_size;

   if (bytes < 1024) {
      file_size = `${bytes} bytes`;
   } else if (bytes >= 1024 && bytes < 1024000) { // Convert Bytes to Kilobytes
      bytes = (bytes / 1024).toFixed(1);
      file_size = `${bytes} kB`;
   } else if (bytes > 1024000 && bytes <= 25214400) { // Convert Bytes to MegaBytes & set limit 25MB 
      bytes = (bytes / 1024000).toFixed(1);
      file_size = `${bytes} MB`;
   } else { // Invalid Size 
      file_size = 'invalid';
   }

   return file_size;
}