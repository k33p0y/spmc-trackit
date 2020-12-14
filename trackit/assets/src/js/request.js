$(document).ready(function () {

   let dd_type_id, dd_form_id, dd_department_id, dd_category_id;
   let data_obj;
   
   // RETRIEVE / GET
   // List Table
   let table = $('#dt_requests').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 20,
      "ajax": {
         url: '/api/requests/lists/?format=datatables',
         type: "GET",
         dataSrc: function (json) {
            return json.data.filter(function (item) {
               return item.is_archive == false;
            });
         }
      },
      "columns": [
         { data: "ticket_no" }, // Ticket No
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `<span class="td-badge" style="background-color:${row.request_form.color}">${row.request_form.name}</span>`
               }
               return data
            }
         }, // Request Type
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  let category = row.category.name
                  let category_type = row.category.category_type.name

                  data = `<p class="title mb-1">${category}</p><span class="sub-title">${category_type}</span>`
               }
               return data
            }
         }, // Category
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  data = row.department.name
               }
               return data
            }
         }, // Department
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  var date = moment(row.date_created).format('DD MMMM YYYY');
                  var time = moment(row.date_created).format('h:mm:ss a');

                  data = `<p class="title mb-1">${date}</p><span class="sub-title">${time}</span>`
               }
               return data
            },
         }, // Date
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `${row.requested_by.first_name} ${row.requested_by.last_name}`
               }
               return data
            },
         }, // User 
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  data = row.status
               }
               return data
            },
         }, // Status 
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {

                  if (row.is_active == true) {
                     data = "<i class='fas fa-check-circle text-success'></i>";
                  } else {
                     data = "<i class='fas fa-times-circle text-secondary'></i>";
                  }
               }
               return data
            }
         }, // Is Active
         {
            data: "null",
            render: function (data, type, row) {
               var id = row.ticket_id;

               data = `<a href='/requests/${id}/detail' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>
                         <a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>`;
               return data
            },
         } // Action
      ],
   });

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

      axios({
         method: 'GET',
         url: `/api/requests/forms/${dd_form_id}`,
         headers: axiosConfig,
      }).then(function (response) { // clear div elements
         $('.body-info').remove();
         $('.form-wrapper').empty();
         $(".form-admin-wrapper").empty();

         return response.data.fields
      }).then(function (response) { // Add to global object
         return data_obj = new Object(response)
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

      }).then(function (response) { // collapse div
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
      dd_category_id = $("#dd_categories option:selected").val();
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      let success = 1;

      // Data
      data.ticket_no = '';
      data.request_form = dd_form_id;
      data.form_data = getFormValues(data_obj);
      data.category = dd_category_id;
      data.department = dd_department_id;
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
      const title = data.title;
      const form_field = data.form_field;
      const is_admin = data.is_admin;
      let answer, fields;

      if (form_field.length > 1) {
         fields = new Array();

         form_field.forEach(field => {
            if (field.type == "text" || field.type == "textarea") { // textfield
               answer = $(`#${field.id}`).val();
            }
            if (field.type == "radio") { // radio button
               field.option.forEach(opt => {
                  if ($(`#${opt.id}`).is(":checked")) {
                     answer = new Object();
                     answer.key = opt.id;
                     answer.value = true;
                  }
               });
            }
            if (field.type == "check") { // checkbox
               answer = new Array();
               field.option.forEach(opt => {
                  if ($(`#${opt.id}`).is(":checked")) {
                     answer.push({
                        "key": opt.id,
                        "value": true
                     })
                  }
               });
            }

            fields.push({
               "id": field.id,
               "name": field.name,
               "type": field.type,
               "option": field.option,
               "answer": answer,
            });
         });
      } else {
         if (form_field.type == "text" || form_field.type == "textarea") { // texfield
            answer = $(`#${form_field.id}`).val();
         }
         if (form_field.type == "radio") { // radio button
            form_field.option.forEach(opt => {
               if ($(`#${opt.id}`).is(":checked")) {
                  answer = new Object();
                  answer.key = opt.id;
                  answer.value = true;
               }
            });
         }
         if (form_field.type == "check") { // checkbox
            answer = new Array();
            form_field.option.forEach(opt => {
               if ($(`#${opt.id}`).is(":checked")) {
                  answer.push({
                     "key": opt.id,
                     "value": true
                  })
               }
            });
         }

         fields = new Object();
         fields.id = form_field.id;
         fields.name = form_field.name;
         fields.type = form_field.type;
         fields.option = form_field.option;
         fields.answer = answer;
      }

      form_fields_obj.push({
         "title": title,
         "form_field": fields,
         "is_admin": is_admin,
      });
   });

   return form_fields_obj;
}