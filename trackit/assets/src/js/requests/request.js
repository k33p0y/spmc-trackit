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
      "pageLength": 10,
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
            data: "request_form",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `<span class="td-badge" style="background-color:${row.request_form.color}">${row.request_form.name}</span>`
               }
               return data
            }
         }, // Request Type
         {
            data: "category",
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
            data: "department",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = row.department.name
               }
               return data
            }
         }, // Department
         {
            data: 'date_created',
            render: function (data, type, row) {
               if (type == 'display') {
                  var date = moment(row.date_created).format('DD MMMM YYYY');
                  var time = moment(row.date_created).format('h:mm:ss a');

                  data = `<p class="title mb-1">${date}</p><span class="sub-title">${time}</span>`
               }
               return data
            },
         }, // Date Create
         { 
            data: "date_modified",
            visible : false,
            searchable : false,
            render: function (data, type, row) {
               if (type == 'display') {
                  var date = moment(row.date_modified).format('DD MMMM YYYY');
                  var time = moment(row.date_modified).format('h:mm:ss a');

                  data = `<p class="title mb-1">${date}</p><span class="sub-title">${time}</span>`
               }
               return data
            },
         }, // Date Update
         {
            data: "requested_by",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `${row.requested_by.first_name} ${row.requested_by.last_name}`
               }
               return data
            },
         }, // User 
         {
            data: "status",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = row.status.name
               }
               return data
            },
         }, // Status 
         {
            data: "is_active",
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
               data = '';
               if($('#changeTicketHidden').val() == 'true') {
                  data = data + `<a href='/requests/${id}/detail' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>`;
               }
               if($('#deleteTicketHidden').val() == 'true') {
                  data = data + "<a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>";
               }
               return data;
               // data = `<a href='/requests/${id}/detail' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>
               //           <a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>`;
               // return data
            },
         } // Action
      ],
      "order": [[ 5, "desc" ]],
   });

   // SELECT2 CONFIGURATION
   $('#dd_edit_departments').select2({ // department select2
      allowClear: true,
      placeholder: 'Select Department',
      cache: true,
   });

   $('#dd_edit_categories').select2({ // categories select2
      allowClear: true,
      placeholder: 'Select Category',
      cache: true,
   });

   let department = $("#dd_edit_departments option:selected").val();
   let category = $("#dd_edit_categories option:selected").val();

   $('#ticket-active-select').select2({
      allowClear: true,
      placeholder: 'Is Active',
      // cache: true,
   });

   $('#category-select').select2({
      allowClear: true,
      placeholder: 'Select Category',
      // cache: true,
   });

   $('#department-select').select2({
      allowClear: true,
      placeholder: 'Select Department',
      // cache: true,
   });

   $('#status-select').select2({
      allowClear: true,
      placeholder: 'Select Status',
      // cache: true,
   });

   



   // SElECT ON CHANGE EVENT
   $('#dd_edit_departments').on('change', function () { // department dropdown
      department = $($(this), "option:selected").val();
   });

   $('#dd_edit_categories').on('change', function () { // categories dropdown
      category = $($(this), "option:selected").val();
   });

   // RELOAD TABLE
   $("#btn_reload").click(function () {
      table.ajax.reload();
   });

   $("#btn_update").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      let success = 0;
      let is_active = ($('#is_active_switch').is(":checked")) ? true : false;
      
      const ticket_id = $(this).attr('ticket_id')
      const form_id = $('#form_id').attr('form_id');
      
      // Data
      data.form_data = getFormDetailValues();
      data.category = category;
      data.department = department;
      data.is_active = is_active;
      data.is_archive = false;

      // console.log(data)
      
      axios({
         method: 'PATCH',
         url: `/api/requests/lists/${ticket_id}/`,
         data: data,
         headers: axiosConfig,
      }).then(function (response) { // success
         // disable submit button
         $(this).attr('disabled', true)
         $.when(
            Toast.fire({
               icon: 'success',
               title: 'Update Successfully',
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
   });
});

function getFormDetailValues() {
   const form_fields = $('.form_field_detail');
   const form_data = new Array()
   
   form_fields.each(function(index, val) {

      console.log(val)
      
      if ($(this).children().length > 0) {
         let node = $(this).children();
         var answer = new Array();
         var type;

         node.each(function(index, element) {
            const field = $(this).find('input');
            const label = $(this).find('label');

            // Set type of field
            type = field.attr('type');

            // Push to array
            answer.push({
               "option_id": field.attr('id'),
               "option_name" : label.text(),
               "option_value" : (field.is(":checked")) ? true : false
            });
         });
      }
      
      if (val.type == 'text' || val.type == 'textarea') {
         var answer = $(`#${val.id}`).val()
         var type = val.type;
      }

      form_data.push({
         "id" : val.id,
         "type" : type,
         "value" : answer 
      });  
   });

   console.log(form_data)

   return form_data;
}