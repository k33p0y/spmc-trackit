$(document).ready(function () {

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
         { data: "ticket_id" },
         {
            data: null,
            render: function (data, type, row) {
               data = 'tests';
               return data
            }
         },
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `<span class="td-badge" style="background-color:${row.request_form.color}">${row.request_form.name}</span>`
               }
               return data
            }
         },
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  data = row.department.name
               }
               return data
            }
         },
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  var date = moment(row.date_created).format('DD MMMM YYYY');
                  var time = moment(row.date_created).format('h:mm:ss a');

                  data = `<p class="date mb-1">${date}</p><span class="time">${time}</span>`
               }
               return data
            },
         },
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `${row.requested_by.first_name} ${row.requested_by.last_name}`
               }
               return data
            },
         },
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
         },
         {
            data: "null",
            render: function (data, type, row) {
               data = `<a href='#' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>
                         <a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>`;
               return data
            },
         }
      ],
   });

   // LOCAL VARIABLES
   let dd_type_id, dd_form_id, dd_department_id, dd_category_id;

   // SELECT2 CONFIGURATION
   $('#dd_forms').select2({
      allowClear: true,
      placeholder: 'Select Form',
      cache: true,
   });

   $('#dd_types').select2({
      allowClear: true,
      placeholder: 'Select Category Type',
      cache: true,
   });

   $('#dd_categories').select2({
      allowClear: true,
      placeholder: 'Select Category',
      cache: true,
   });

   $('#dd_departments').select2({
      allowClear: true,
      placeholder: 'Select Department',
      cache: true,
   });

   // CREATE / POST
   $('#btn_new').on('click', function () {
      // Assign AJAX Action Type and URL
      action_type = 'POST';
      url = '/api/requests/lists/';
      alert_msg = 'Saved Successfully';

      // Modal
      $("#formModal").modal();
      $(".modal-title").text('Make Request');

      // Hide Category Form Dropdown
      $('#form-group-category').hide();

      // Get Dropdown Values
      $('#dd_forms').on('change', function () {
         dd_form_id = $("#dd_forms option:selected").val();
         generateForm(dd_form_id)
      });

      $('#dd_types').on('change', function () {
         dd_type_id = $("#dd_types option:selected").val();
         getCategory(dd_type_id);
      });

      $('#dd_categories').on('change', function () {
         dd_category_id = $("#dd_categories option:selected").val();
      });

      $('#dd_departments').on('change', function () {
         dd_department_id = $("#dd_departments option:selected").val();
      });

      // Prev Next Function
      navigator();
   });
});

// Submit Form
$("#btn_save").click(function (e) {
   e.preventDefault();

   // Variables
   let data = {}
   let success = 1;

   // Data
   data.ticket_no = '2020100001';
   data.request_form = dd_form_id;
   data.form_data = {};
   data.category = dd_category_id;
   data.department = dd_department_id;
   data.is_active = true;
   data.is_archive = false;

   // Form is Valid
   // if (success == 1) {
   //    $.ajax({
   //       url: url,
   //       type: action_type,
   //       data: data,
   //       beforeSend: function (xhr, settings) {
   //          xhr.setRequestHeader("X-CSRFToken", csrftoken);
   //       },
   //       success: function (result) {
   //          Toast.fire({
   //             icon: 'success',
   //             title: alert_msg,
   //          });
   //          table.ajax.reload();
   //       },
   //       error: function (xhr, status, error) {
   //          if (xhr.responseJSON.name) {
   //             $('#txt_typename').addClass('form-error');
   //             $('.name-error').html(`*${xhr.responseJSON.name}`)
   //          } else {
   //             $('#txt_typename').removeClass('form-error');
   //             $('.name-error').html('')
   //          }
   //          if (xhr.responseJSON.color) {
   //             $('#txt_color').addClass('form-error');
   //             $('.color-error').html(`*${xhr.responseJSON.color}`)
   //          } else {
   //             $('#txt_color').removeClass('form-error');
   //             $('.color-error').html('')
   //          }
   //          Toast.fire({
   //             icon: 'error',
   //             title: error,
   //          });
   //       },
   //    }).done(function () {
   //       $('#formModal').modal('toggle');
   //       $("#form").trigger("reset");
   //    });
   // }
});


function generateTicketNo() {
   let datetime = moment().format('MDYYHHmmss')
   let ticketnumber = `TN${datetime} `;

   return ticketnumber
}

function navigator() {
   // Next
   $('.btn-next').click(function () {
      let tab = $(this).closest('.tab-pane');
      $(`#${tab[0].id}, .nav-pills li.nav-item a`)
         .removeClass('active');
      $(`.nav-pills li.nav-item a[href="#${tab.next()[0].id}"]`)
         .addClass('active')
         .removeClass('disabled');
      tab.next().addClass('show active');
   });

   // Previous
   $('.btn-prev').click(function () {
      let tab = $(this).closest('.tab-pane');
      $(`#${tab[0].id}, .nav-pills li.nav-item a`).removeClass('active');
      $(`.nav-pills li.nav-item a[href="#${tab.prev()[0].id}"]`).addClass('active');
      tab.prev().addClass('show active');
   });
}

function getCategory(type_id) {
   $.ajax({
      url: '/requests/categories/json',
      type: 'POST',
      data: {
         'type_id': type_id
      },
      beforeSend: function (xhr, settings) {
         xhr.setRequestHeader("X-CSRFToken", csrftoken);
      },
      success: function (data) {
         // Show Category Row
         $('#form-group-category').slideDown();

         // Empty Dropdown Values
         $("#dd_categories")
            .empty()
            .append('<option></option>');

         // Populate Dropdown
         data.forEach(key => {
            $("#dd_categories").append(`<option value='${key.id}'>${key.name}</option>`)
         });
      },
   });
}

function generateForm(form_id) {
   $(".custom-form").empty();

   $.ajax({
      url: `/api/requests/forms/${form_id}`,
      type: 'GET',
      success: function (data) {
         let forms = data.fields;

         // Load form
         forms.forEach(form => {

            let label = form.title;
            let fields = form.fields;
            let attr_id = form.attr_id;
            let is_admin = form.is_admin;

            if (is_admin == false) {
               fields.forEach(field => {

                  let name = field.name;
                  let type = field.type;
                  let size = field.size;
                  let option = field.option;
                  let answer = field.answer;

                  if (fields.length > 1) {
                     // Short Text / Textbox
                     $(".custom-form").append(
                        `<div class="form-group">
                        <label> ${label} </label>
                        <div class="type-group"></div>
                        <small class="error-info" id="error-info-type"></small>
                     </div>`
                     );

                     if (type == "text" && size == "short") {
                        $(".type-group").append(
                           `<input type="text" class="form-control form-control-sm" id="${attr_id}" placeholder="Enter ${label}">`
                        );
                     }

                     if (type == "text" && size == "long") {
                        $(".type-group").append(
                           `<textarea class="form-control form-control-sm" placeholder="Enter ${label}" rows="2" id="${attr_id}"></textarea>`
                        );
                     }

                     if (type == "radio") {
                        var counter = 1;
                        option.forEach(data => {
                           $(".type-group").append(
                              `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                              <input type="radio" id="radio${counterd}" name="${attr_id}" />
                              <label for="radio${counter}">${data}</label>
                           </div>`
                           );
                           counter++;
                        });
                     }

                     if (type == "check") {
                        var counter = 1;
                        option.forEach(data => {
                           $(".type-group").append(
                              `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                              <input type="checkbox" id="check${counter}"/>
                              <label for="check${counter}">${data}</label>
                           </div>`
                           );
                           counter++;
                        });
                     }

                  } else {
                     // Short Text / Textbox
                     if (type == "text" && size == "short") {
                        $(".custom-form").append(
                           `<div class=" form-group">
                           <label> ${label} </label>
                           <input type="text" class="form-control form-control-sm" id="${attr_id}" placeholder="Enter ${label}">
                           <small class="error-info" id="error-info-type"></small>
                        </div>`
                        );
                     }

                     // Long Text / TextArea
                     if (type == "text" && size == "long") {
                        $(".custom-form").append(
                           `<div class=" form-group">
                           <label> ${label} </label>
                           <textarea class="form-control form-control-sm" placeholder="Enter ${label}" rows="2" id="${attr_id}"></textarea>
                           <small class="error-info" id="error-info-type"></small>
                        </div>`
                        );
                     }

                     // Radio
                     if (type == "radio") {
                        var counter = 1;
                        $(".custom-form").append(
                           `<div class=" form-group">
                           <label> ${label} </label>
                           <div class="type-group"></div>
                           <small class="error-info" id="error-info-type"></small>
                        </div>`
                        );

                        option.forEach(data => {
                           $(".type-group").append(
                              `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                              <input type="radio" id="radio${counter}" name="${attr_id}" />
                              <label for="radio${counter}">${data}</label>
                           </div>`
                           );
                           counter++;
                        });
                     }

                     // Checkbox
                     if (type == "check") {
                        var counter = 1;
                        $(".custom-form").append(
                           `<div class=" form-group">
                           <label> ${label}</label>
                           <div class="type-group"></div>
                           <small class="error-info" id="error-info-type"></small>
                        </div>`
                        );

                        option.forEach(data => {
                           $(".type-group").append(
                              `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                              <input type="checkbox" id="check${counter}"/>
                              <label for="check${counter}">${data}</label>
                           </div>`
                           );
                           counter++;
                        });
                     }
                  }

               });
            }
         });
      },
   });
}