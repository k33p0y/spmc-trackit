$(document).ready(function () {
   // LOCAL VARIABLES
   let dd_type_id, dd_form_id, dd_department_id, dd_category_id;

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
      dd_department_id = $("#dd_departments option:selected").val();
   });

   $('#dd_forms').on('change', function () { // request form dropdown
      dd_form_id = $("#dd_forms option:selected").val();
      // doTheThing(dd_form_id)
      //    .then((data) => {
      //       fields_arr = data.fields;
      //       generateForm(fields_arr);
      //    })

      axios({
         method: 'GET',
         url: `/api/requests/forms/${dd_form_id}`,
         headers: axiosConfig,
      }).then(function (response) { // clear div elements
         $('.body-info').remove();
         $('.form-wrapper').empty();
         $(".form-admin-wrapper").empty();

         return response.data.fields
      }).then(function (response) { // generate form fields

         response.forEach(data => {

            const title = data.title;
            const form_field = data.form_field;
            const is_admin = data.is_admin;
            let form_wrapper;

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
                  if (field.type == "check") {
                     counter = 1;
                     field.option.forEach(opt => {
                        $(".type-group").append(
                           `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                        <input type="checkbox" id="${opt.id}"/>
                        <label for="${opt.id}">${opt.name}</label>
                     </div>`
                        );
                        counter++;
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
               if (form_field.type == "check") {
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

         return response
      }).then(function (response) { // generate form fields
         $('#collapseTwo').removeAttr('data-parent').collapse()
      });

   });

   $('#dd_types').on('change', function () { // category type dropdown
      dd_type_id = $("#dd_types option:selected").val();

      axios({
         method: 'POST',
         url: '/requests/categories/json',
         data: {
            'type_id': dd_type_id
         },
         headers: axiosConfig,
      }).then(function (response) { // success

         // Empty Dropdown Values
         $("#dd_categories")
            .empty()
            .append('<option></option>')
            .removeAttr('disabled');

         // Populate Dropdown
         response.data.forEach(key => {
            $("#dd_categories").append(`<option value='${key.id}'>${key.name}</option>`)
         });
      });
   });

   $('#dd_categories').on('change', function () { // categories dropdown
      dd_category_id = $("#dd_categories option:selected").val();
   });
});