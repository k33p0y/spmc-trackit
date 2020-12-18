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
                  data = row.status.name
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

   // SElECT ON CHANGE EVENT
   $('#dd_edit_departments').on('change', function () { // department dropdown
      department = $($(this), "option:selected").val();
   });

   $('#dd_edit_categories').on('change', function () { // categories dropdown
      category = $($(this), "option:selected").val();
   });

   $(".card-actions").on("click", ".btn-create-ws", function(){
      let ans = prompt('Enter deparment', '');
      if(ans) {
         socket.send(
            JSON.stringify(
               {message: `${ans}`, num: 0, bool: true}
            )
         )
      };
   });

   $("#btn_update").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      let success = 0;
      let is_active = ($('#is_active_switch').is(":checked")) ? true : false;
      let ticket_id = $(this).attr('ticket_id')

      // Data
      // data.form_data = getFormValues(ticket_id);
      data.category = category;
      data.department = department;
      data.is_active = is_active;
      data.status = 2;
      data.is_archive = false;
      
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

function getFormDetailValues(ticket_id) {

}