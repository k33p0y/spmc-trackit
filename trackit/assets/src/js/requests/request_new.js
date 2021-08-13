$(document).ready(function () {

   var request_form, department, category, category_type;
   var data_obj;

   $('#select2_requestform').select2({ // request form select2
      allowClear: true,
      placeholder: 'Select form',
      cache: true,
   });

   $('#select2_categorytype').select2({ // category type select2
      allowClear: true,
      placeholder: 'Select category type',
      cache: true,
      sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
   });

   $('#select2_category').select2({ // categories select2
      allowClear: true,
      placeholder: 'Select category',
      cache: true,
      sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
   });

   $('#select2_requestform').on('change', function () { // request form dropdown
      request_form = $("#select2_requestform option:selected").val();

      axios({
         method: 'GET',
         url: `/api/requests/forms/${request_form}`,
         headers: axiosConfig,
      }).then(function (response) { // clear and setup elements
         $('.body-info').remove();
         $('.form-wrapper').empty();
         $(".form-admin-wrapper").empty();

         $("#select2_categorytype")
            .empty()
            .append('<option></option>')
            .removeAttr('disabled');

         // populate category type select
         response.data.category_types.forEach(type => {
            $("#select2_categorytype").append(`<option value='${type.id}'>${type.name}</option>`)
         });
         
         return response.data.fields
      }).then(function (response) { // Add to global object
         return data_obj = new Object(response)
      }).then(function (response) { // generate form fields
         let has_admin = 0;
         let counter = 0;
         
         response.forEach(data => {
            const title = data.title;
            const form_field = data.form_field;
            const is_admin = data.is_admin;
            const is_required = data.is_required;
            const is_multi_field = data.is_multi_field;

            if (is_admin === false) var form_wrapper = $(".form-wrapper");
            if (is_admin === true) {
               var form_wrapper = $(".form-admin-wrapper");
               has_admin++;
            } 

            // for multiple form fields on each field
            if (is_multi_field) {  
               form_wrapper.append(
                  `<div class="form-group" id="form-group-${counter}">
                     <label>${title} ${is_required ? '<span class="text-danger">*</span>' : ''}</label>
                     <div class="field-wrap ${is_required ? 'form-field-required' : ''}"></div>
                     <small class="error-info" id="error-${form_field.id}"></small>
                  </div>`
               ); 

               form_field.forEach(field => {
                  if (field.type == "text") 
                     $(`#form-group-${counter} .field-wrap`).append(`<input type="text" class="form-control form-control-sm" id="${field.id}" placeholder="Enter ${title}">`);
                  if (field.type == "textarea") {
                     $(`#form-group-${counter} .field-wrap`).append(`<textarea class="form-control form-control-sm" id="${field.id}" placeholder="Enter ${title}" rows="2"></textarea>`);
                  }
                  if (field.type == "radio") {
                     field.option.forEach(opt => {
                        $(`#form-group-${counter} .field-wrap`).append(
                           `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                              <input type="radio" id="${opt.id}" name="${field.id}" />
                              <label for="${opt.id}">${opt.name}</label>
                           </div>`
                        );
                     });
                  }
                  if (field.type == "checkbox") {
                     field.option.forEach(opt => {
                        $(`#form-group-${counter} .field-wrap`).append(
                           `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                              <input type="checkbox" id="${opt.id}" class="${field.id}"/>
                              <label for="${opt.id}">${opt.name}</label>
                           </div>`
                        );
                     });
                  }
               });
               counter++;

            } else {
               if (form_field.type == "text") {
                  form_wrapper.append(
                     `<div class=" form-group">
                        <label> ${title} ${is_required ? '<span class="text-danger">*</span>' : ''}</label>
                        <input type="text" class="form-control form-control-sm ${is_required ? 'form-text-required' : ''}" id="${form_field.id}" placeholder="Enter ${title}">
                        <small class="error-info" id="error-${form_field.id}"></small>
                     </div>`
                  );
               }
               if (form_field.type == "textarea") {
                  form_wrapper.append(
                     `<div class=" form-group">
                        <label> ${title} ${is_required ? '<span class="text-danger">*</span>' : ''} </label>
                        <textarea class="form-control form-control-sm ${is_required ? 'form-text-required' : ''}" id="${form_field.id}" placeholder="Enter ${title}" rows="2"></textarea>
                        <small class="error-info" id="error-${form_field.id}"></small>
                     </div>`
                  );
               }
               if (form_field.type == "datetime") {
                  form_wrapper.append(
                     `<div class=" form-group">
                        <label> ${title} ${is_required ? '<span class="text-danger">*</span>' : ''}</label>
                        <input type="text" class="form-control form-control-sm ${is_required ? 'form-text-required' : ''} form-datetime" id="${form_field.id}" placeholder="Enter ${title}">
                        <small class="error-info" id="error-${form_field.id}"></small>
                     </div>`
                  );
                  $(`#${form_field.id}`).datetimepicker({
                     icons: {
                        time: 'fas fa-clock',
                        date:'fas fa-calendar',
                     }
                  });
               }
               if (form_field.type == "radio") {
                  form_wrapper.append(
                     `<div class="form-group">
                        <label> ${title} ${is_required? '<span class="text-danger">*</span>' : ''}</label>
                        <div class="radio-group ${is_required ? 'form-option-required' : ''}"></div>
                        <small class="error-info" id="error-${form_field.id}"></small>
                     </div>`
                  );
                  form_field.option.forEach(opt => {
                     $(".radio-group").append(
                        `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                           <input type="radio" id="${opt.id}" name="${form_field.id}"/>
                           <label for="${opt.id}">${opt.name}</label>
                        </div>`
                     );
                  });
               }
               if (form_field.type == "checkbox") {
                  form_wrapper.append(
                     `<div class=" form-group">
                        <label> ${title} ${is_required ? '<span class="text-danger">*</span>' : ''}</label>
                        <div class="check-group ${is_required ? 'form-option-required' : ''}"></div>
                        <small class="error-info" id="error-${form_field.id}"></small>
                     </div>`
                  );

                  form_field.option.forEach(opt => {
                     $(".check-group").append(
                        `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                           <input type="checkbox" id="${opt.id}" class="${form_field.id}"/>
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

   $('#select2_categorytype').on('change', function () { // category type dropdown
      axios.get('/api/config/category', {
         params: {
            "category_type" : $("#select2_categorytype").val(),
            "is_active" : 0
         }
      }, axiosConfig).then(res => {
         $("#select2_category")
            .empty()
            .append('<option></option>')
            .removeAttr('disabled');

         res.data.forEach(category => {
            $("#select2_category").append(`<option value='${category.id}'>${category.name}</option>`)
         });
      });
   });

   // Submit Form
   $("#btn_submit").click(function (e) {
      e.preventDefault();      

      // Object Data
      data = new Object();
      data.ticket_no = '';
      data.request_form = request_form;
      data.description = $('#txt_description').val();
      data.category = $("#select2_category").val();
      if (request_form) data.form_data = getFormValues(data_obj);

      axios({
         method: 'POST',
         url: '/api/requests/ticket/crud/',
         data: data,
         headers: axiosConfig
      }).then(async function (response) { // upload attachments         
         // Call upload Fn
         if (file_arr.length > 0) await uploadAttachment(response.data.ticket_id, file_arr) 
         // Alert
         $.when(toastSuccess('Success')).then(function () {$(location).attr('href', '/requests/lists')})
         // send notif
         socket_notification.send(JSON.stringify({type: 'notification', data: {object_id: response.data.ticket_id, notification_type: 'ticket'}}))
      }).catch(function (error) { // error
         toastError(error.response.statusText)
         if (error.response.data.description) showFieldErrors(error.response.data.description, 'description', 'text'); else removeFieldErrors('description', 'text');
         if (error.response.data.request_form) showFieldErrors(error.response.data.request_form, 'requestform', 'select'); else removeFieldErrors('requestform', 'select');
         if (error.response.data.category) showFieldErrors(error.response.data.category, 'category', 'select'); else removeFieldErrors('category', 'select');
      });
   });   

   let showFieldErrors = function(obj, field, type) {
      // Get error message
      let msg = '';
      obj.forEach(error => {msg += `${error} `});

      // Add error class change border color to red
      if (type === 'select') {
         $(`#select2_${field}`).next().find('.select2-selection').addClass('form-error');
      } else {
         $(`#txt_${field}`).addClass('form-error');
      }

      // Custom validation for category type
      if (field == 'category') {
         if ($('#select2_categorytype').val()) {
            $('#select2_categorytype').next().find('.select2-selection').removeClass('form-error');
            $('#categorytype-error').html('')
         } else {
            $('#select2_categorytype').next().find('.select2-selection').addClass('form-error');
            $('#categorytype-error').html(`*${msg}`)
         }
      }
      // display message
      $(`#${field}-error`).html(`*${msg}`)
   };

   let removeFieldErrors = function(field, type) {
      // Remove error class for border color
      if (type === 'select') $(`#select2_${field}`).next().find('.select2-selection').removeClass('form-error');
      else $(`#txt_${field}`).removeClass('form-error');
      $(`#${field}-error`).html('')
   };

   let validateForms = function() {
      let is_valid = true;
   
      // validate text & textarea fields
      $('.form-text-required').each(function(){
         if($(this).val() == '') {
            $(this).addClass('form-error').next().html('*This field may not be blank')
            is_valid = false;
         } else {
            $(this).removeClass('form-error').next().html('')
         }
      });

      // validate dropdown fields
      $('.form-select-required').each(function(){
         if($(this).val() == '') {
            $(this).next().find('.select2-selection').addClass('form-error')
            $(this).siblings('.error-info').html('*This field may not be blank')
            is_valid = false;
         } else {
            $(this).next().find('.select2-selection').removeClass('form-error')
            $(this).siblings('.error-info').html('')
         }
      });

      // validate checkbox & radio btn fields
      $('.form-option-required').each(function() {
         let parent = $(this); 
         let options = parent.children().find('input');
         
         options.each(function (i, item) {
            // option name
            if (item.type === "radio") var option = `input[name='${item.name}']`; // get input name for radio button
            if (item.type === "checkbox") var option = `.${$(this).prop('class')}`; // get class for checkbox
               
            // validate 
            if ($(`${option}:checked`).length === 0) {
               parent.next().html('*Please select an option')
               is_valid = false;
            } else {
               parent.next().html('');
            }
         });
      });

      // Validate multiple form field
      $('.form-field-required').each(function() {
         let parent = $(this);
         let field = parent.children('input');
         let options = parent.children().find('input');
         
         // radio or checkbox
         options.each(function (i, item) {
            // option name
            if (item.type === "radio") var option = `input[name='${item.name}']`; // get input name for radio button
            if (item.type === "checkbox") var option = `.${$(this).prop('class')}`; // get class for checkbox
               
            // validate 
            if ($(`${option}:checked`).length === 0) {
               parent.next().html('*Please select an option')
               is_valid = false;
            } else {
               field.removeClass('form-error')
               parent.next().html('');
            }
            
            // textfield
            if (field.val() == '') {
               field.addClass('form-error')
               parent.next().html('*This field may not be blank')
               is_valid = false;
            } 
         });

      });
      
      return is_valid;
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