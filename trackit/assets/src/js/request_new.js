$(document).ready(function () {

   let request_form, department, category, category_type;
   let data_obj;
    
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
                        <label> ${title} </label>
                        <div class="type-group"></div>
                        <small class="error-info" id="error-info-type"></small>
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
                           <small class="error-info" id="error-info-type"></small>
                        </div>`
                  );
               }
               if (form_field.type == "textarea") {
                  form_wrapper.append(
                     `<div class=" form-group">
                           <label> ${title} </label>
                           <textarea class="form-control form-control-sm" id="${form_field.id}" placeholder="Enter ${title}" rows="2"></textarea>
                           <small class="error-info" id="error-info-type"></small>
                        </div>`
                  );
               }
               if (form_field.type == "radio") {
                  form_wrapper.append(
                     `<div class=" form-group">
                           <label> ${title} </label>
                           <div class="radio-group"></div>
                           <small class="error-info" id="error-info-type"></small>
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
                           <small class="error-info" id="error-info-type"></small>
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

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      let success = 1;

      // Data
      data.ticket_no = '';
      data.request_form = request_form;
      data.form_data = getFormValues(data_obj);
      data.category = category;
      data.department = department;
      data.is_active = true;
      data.is_archive = false;

      if (success == 1) {
         axios({
            method: 'POST',
            url: '/api/requests/lists/',
            data: data,
            headers: axiosConfig,
         }).then(function (response) { // success
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
            console.log(error.response)

            Toast.fire({
               icon: 'error',
               title: error,
            });
         });
      };
   });    
 });
 
 // Get form Values
 function getFormValues(data_obj) {
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
						})
					});
				}

				form_fields_obj.push({
					"id":  field.id,
					"type": field.type,
					"value" : answer
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
					})
				});
			}

			form_fields_obj.push({
				"id":  form_field.id,
				"type": form_field.type,
				"value" : answer
			});
		}
	});

	return form_fields_obj;
 }
 
 