$(document).ready(function () {

   var request_form, department, category, category_type;
   var data_obj;

   $('#dd_forms').select2({ // request form select2
      allowClear: true,
      placeholder: 'Select form',
      cache: true,
   });

   $('#dd_types').select2({ // category type select2
      allowClear: true,
      placeholder: 'Select category type',
      cache: true,
      sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
   });

   $('#dd_categories').select2({ // categories select2
      allowClear: true,
      placeholder: 'Select category',
      cache: true,
      sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
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
      }).then(function (response) { // clear and setup elements
         $('.body-info').remove();
         $('.form-wrapper').empty();
         $(".form-admin-wrapper").empty();

         $("#dd_types")
            .empty()
            .append('<option></option>')
            .removeAttr('disabled');

         // populate category type select
         response.data.category_types.forEach(type => {
            $("#dd_types").append(`<option value='${type.id}'>${type.name}</option>`)
         });
         return response.data.fields
      }).then(function (response) { // Add to global object
         return data_obj = new Object(response)
      }).then(function (response) { // generate form fields
         let has_admin = 0;
         
         response.forEach(data => {
            const title = data.title;
            const form_field = data.form_field;
            const is_admin = data.is_admin;

            if (is_admin == true) {
               form_wrapper = $(".form-admin-wrapper");
               has_admin++;
            } else {
               form_wrapper = $(".form-wrapper");
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

         return has_admin
      }).then(function (has_admin) { // show admin row
         if (has_admin > 0 ) $('#row-field-admin').removeAttr('hidden'); else $('#row-field-admin').attr("hidden", true);
      });
   });
 
   $('#dd_types').on('change', function () { // category type dropdown
      category_type = $("#dd_types option:selected").val();

      axios.get('/api/config/category', {
         params: {
            "category_type" : category_type,
            "is_active" : 0
         }
      }, axiosConfig).then(res => {
         $("#dd_categories")
            .empty()
            .append('<option></option>')
            .removeAttr('disabled');

         res.data.forEach(category => {
            $("#dd_categories").append(`<option value='${category.id}'>${category.name}</option>`)
         });
      });
   });
 
   $('#dd_categories').on('change', function () { // categories dropdown
      category = $("#dd_categories option:selected").val();
   });

   // Submit Form
   $("#btn_submit").click(function (e) {
      e.preventDefault();      

      let success = validateForms();
      if (success == 1) {

         // Object Data
         data = new Object();
         data.ticket_no = '';
         data.request_form = request_form;
         data.description = $('#txt_description').val();
         data.form_data = getFormValues(data_obj);
         data.category = category;
         
         axios({
            method: 'POST',
            url: '/api/requests/lists/',
            data: data,
            headers: axiosConfig
         }).then(async function (response) { // upload attachments         
            // disable submit button
            $(this).attr('disabled', true);

             // Call upload Fn
             if (file_arr.length > 0) await uploadAttachment(response.data.ticket_id, file_arr) 

             // Alert
             $.when(toastSuccess('Success')).then(function () {$(location).attr('href', '/requests/lists')})

            // send notif
            socket_notification.send(JSON.stringify({type: 'notification', data: {object_id: response.data.ticket_id, notification_type: 'ticket'}}))
         }).catch(function (error) { // error
            toastError(error)
         });
      };
   });   
   
   
   let validateForms = function() {
      var success = 1;
   
      // Validate Request Details
      if ($('#txt_description').val() == '') {
         $('#txt_description').addClass('form-error');
         $('#error-info-desc').html('*This field may not be blank')
         success--;
      } else {
         $('#txt_description').next().find('.select2-selection').removeClass('form-error');
         $('#error-info-desc').html('');
      }
   
      if ($('#dd_types').val() == '') {
         $('#dd_types').next().find('.select2-selection').addClass('form-error');
         $('#error-info-type').html('*This field may not be blank')
         success--;
      } else {
         $('#dd_types').next().find('.select2-selection').removeClass('form-error');
         $('#error-info-type').html('');
      }
   
      if ($('#dd_categories').val() == '') {
         $('#dd_categories').next().find('.select2-selection').addClass('form-error');
         $('#error-info-category').html('*This field may not be blank')
         success--;
      } else {
         $('#dd_categories').next().find('.select2-selection').removeClass('form-error');
         $('#error-info-category').html('');
      }
   
      if ($('#dd_forms').val() == '') {
         $('#dd_forms').next().find('.select2-selection').addClass('form-error');
         $('#error-info-form').html('*This field may not be blank')
         success--;
      } else {
         $('#dd_forms').next().find('.select2-selection').removeClass('form-error');
         $('#error-info-form').html('');
      }   
      return success;
   }   

   // Get form Values
   var getFormValues = function(data_obj) {
      let form_fields_obj = new Array();

      data_obj.forEach(data => {
         const form_field = data.form_field;
         let answer;
         
         if (form_field.length > 1) {
            form_field.forEach(field => {
   
               if (field.type == "text" || field.type == "textarea") { // textfield
                  answer = $(`#${field.id}`).val();            
                     answer = $(`#${field.id}`).val();            
                  answer = $(`#${field.id}`).val();            
               }
               if (field.type == "radio" || field.type == "checkbox") { // radio button
                  answer = new Array();
                  field.option.forEach(opt => {
                     answer.push({
                        "option_id": opt.id,
                        "option_name" : opt.name,
                        "option_value": ($(`#${opt.id}`).is(":checked")) ? true : false
                     });
                  });
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
            }
            if (form_field.type == "radio" || form_field.type == "checkbox") { // radio button
               answer = new Array();
               form_field.option.forEach(opt => {
                  answer.push({
                     "option_id": opt.id,
                     "option_name" : opt.name,
                     "option_value": ($(`#${opt.id}`).is(":checked")) ? true : false
                  });
               });
            }
   
            form_fields_obj.push({
               "id":  form_field.id,
               "type": form_field.type,
               "value" : answer,
               "required": form_field.required
            });
         }
      });

      return form_fields_obj;
   }

});