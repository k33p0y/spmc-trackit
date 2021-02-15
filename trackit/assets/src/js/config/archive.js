$(document).ready(function () {
    // Local Variables
    let chk_status = true;
    let action_type, url;
    let alert_msg = '';
    let axiosConfig = {
       "Content-Type": "application/json;charset=UTF-8",
       "Access-Control-Allow-Origin": "*",
       "X-CSRFToken": csrftoken,
 
    };
 
    // Spectrum Picker
    $('#txt_color').spectrum({
       type: "text",
       showPalette: false,
    });
 
    // RETRIEVE / GET
    // List Table
    let forms = $('#dt_forms_forms').DataTable({
       "searching": false,
       "responsive": true,
       "lengthChange": false,
       "autoWidth": false,
       "serverside": true,
       "processing": true,
       "pageLength": 5,
       "ajax": {
          url: '/api/requests/forms/?format=datatables',
          type: "GET",
          data: {
             "is_archive": 0
          },
       },
       "columns": [
          { data: "name" },
          {
             data: null,
             render: function (data, type, row) {
                return "<a href='#' class='text-info action-link btn_delete'> <i class='fas fa-trash-restore'></i> </a>"
             },
          }
       ],
    });
 
    let status = $('#dt_forms_status').DataTable({
       "searching": false,
       "responsive": true,
       "lengthChange": false,
       "autoWidth": false,
       "serverside": true,
       "processing": true,
       "pageLength": 5,
       "ajax": {
          url: '/api/config/status/?format=datatables',
          type: "GET",
          data: {
             "is_archive": true
          },
       },
       "columns": [
          { data: "name" },
          {
             data: null,
             render: function (data, type, row) {
                return "<a href='#' class='text-info action-link btn_delete'> <i class='fas fa-trash-restore'></i> </a>";
             },
          }
       ],
    });
 
    let department = $('#dt_forms_departments').DataTable({
       "searching": false,
       "responsive": true,
       "lengthChange": false,
       "autoWidth": false,
       "serverside": true,
       "processing": true,
       "pageLength": 5,
       "ajax": {
          url: '/api/config/department/?format=datatables',
          type: "GET",
          data: {
             "is_archive": true
          },
       },
       "columns": [
          { data: "name" },
          {
             data: null,
             render: function (data, type, row) {
                return "<a href='#' class='text-info action-link btn_delete'> <i class='fas fa-trash-restore'></i> </a>"
             },
          }
       ],
    });
 
    let category = $('#dt_forms_categories').DataTable({
       "searching": false,
       "responsive": true,
       "lengthChange": false,
       "autoWidth": false,
       "serverside": true,
       "processing": true,
       "pageLength": 5,
       "ajax": {
          url: '/api/config/category/?format=datatables',
          type: "GET",
          data: {
             "is_archive": 0
          },
       },
       "columns": [
          { data: "name" },
          {
             data: null,
             render: function (data, type, row) {
                return "<a href='#' class='text-info action-link btn_delete'> <i class='fas fa-trash-restore'></i> </a>"
             },
          }
       ],
    });
 
    let categoryType = $('#dt_forms_category_types').DataTable({
       "searching": false,
       "responsive": true,
       "lengthChange": false,
       "autoWidth": false,
       "serverside": true,
       "processing": true,
       "pageLength": 5,
       "ajax": {
          url: '/api/config/categorytype/?format=datatables',
          type: "GET",
          data: {
             "is_archive": true
          },
       },
       "columns": [
          { data: "name" },
          {
             data: null,
             render: function (data, type, row) {
                return "<a href='#' class='text-info action-link btn_delete'> <i class='fas fa-trash-restore'></i> </a>"
             },
          }
       ],
    });
 
    let ticket = $('#dt_forms_requests').DataTable({
       "searching": false,
       "responsive": true,
       "lengthChange": false,
       "autoWidth": false,
       "serverside": true,
       "processing": true,
       "pageLength": 5,
       "ajax": {
          url: '/api/requests/lists/?format=datatables',
          type: "GET",
          data: {
             "is_archive": true
          },
       },
       "columns": [
          { data: "ticket_no" }, // Ticket No
          {
             data: null,
             render: function (data, type, row) {
                return "<a href='#' class='text-info action-link btn_delete'> <i class='fas fa-trash-restore'></i> </a>"
             },
          }
       ],
    });
 
 
 
    // RESTORE / PATCH
    $('#dt_forms_forms').on('click', '.btn_delete', function () {
       let dt_data = forms.row($(this).parents('tr')).data();
       let id = dt_data['id'];
 
       Swal.fire({
          title: 'Are you sure?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Restore',
          confirmButtonColor: '#fd7e14',
       }).then((result) => {
          if (result.value) {
             $.ajax({
                url: `/api/requests/forms/${id}/`,
                type: 'PATCH',
                data: {
                   is_archive: false,
                },
                beforeSend: function (xhr, settings) {
                   xhr.setRequestHeader("X-CSRFToken", csrftoken);
                },
                success: function (result) {
                   Toast.fire({
                      icon: 'success',
                      title: 'Restore Successfully',
                   });
                   forms.ajax.reload();
                },
                error: function (a, b, error) {
                   Toast.fire({
                      icon: 'error',
                      title: error,
                   });
                },
             })
          }
       })
    });
 
    $('#dt_forms_status').on('click', '.btn_delete', function () {
       let dt_data = status.row($(this).parents('tr')).data();
       let id = dt_data['id'];
 
       Swal.fire({
          title: 'Are you sure?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Restore',
          confirmButtonColor: '#fd7e14',
       }).then((result) => {
          if (result.value) {
             $.ajax({
                url: `/api/config/status/${id}/`,
                type: 'PATCH',
                data: {
                   is_archive: 0,
                },
                beforeSend: function (xhr, settings) {
                   xhr.setRequestHeader("X-CSRFToken", csrftoken);
                },
                success: function (result) {
                   Toast.fire({
                      icon: 'success',
                      title: 'Restore Successfully',
                   });
                   status.ajax.reload();
                },
                error: function (a, b, error) {
                   Toast.fire({
                      icon: 'error',d
                   });
                },
             })
          }
       })
    });
 
    $('#dt_forms_requests').on('click', '.btn_delete', function () {
       let dt_data = ticket.row($(this).parents('tr')).data();
       console.log(dt_data)
       let id = dt_data['ticket_id'];
 
       Swal.fire({
          title: 'Are you sure?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Restore',
          confirmButtonColor: '#fd7e14',
       }).then((result) => {
          if (result.value) {
             $.ajax({
                url: `/api/requests/lists/${id}/`,
                type: 'PATCH',
                data: {
                   is_archive: 0,
                },
                beforeSend: function (xhr, settings) {
                   xhr.setRequestHeader("X-CSRFToken", csrftoken);
                },
                success: function (result) {
                   Toast.fire({
                      icon: 'success',
                      title: 'Restore Successfully',
                   });
                   ticket.ajax.reload();
                },
                error: function (a, b, error) {
                   Toast.fire({
                      icon: 'error',
                      title: error,
                   });
                },
             })
          }
       })
    });

    $('#dt_forms_categories').on('click', '.btn_delete', function () {
        let dt_data = category.row($(this).parents('tr')).data();
        let id = dt_data['id'];
  
        Swal.fire({
           title: 'Are you sure?',
           icon: 'question',
           showCancelButton: true,
           confirmButtonText: 'Restore',
           confirmButtonColor: '#fd7e14',
        }).then((result) => {
           if (result.value) {
              $.ajax({
                 url: `/api/config/category/${id}/`,
                 type: 'PATCH',
                 data: {
                    is_archive: 0,
                 },
                 beforeSend: function (xhr, settings) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                 },
                 success: function (result) {
                    Toast.fire({
                       icon: 'success',
                       title: 'Restore Successfully',
                    });
                    category.ajax.reload();
                 },
                 error: function (a, b, error) {
                    Toast.fire({
                       icon: 'error',
                       title: error,
                    });
                 },
              })
           }
        })
     });

     $('#dt_forms_departments').on('click', '.btn_delete', function () {
        let dt_data = department.row($(this).parents('tr')).data();
        let id = dt_data['id'];
  
        Swal.fire({
           title: 'Are you sure?',
           icon: 'question',
           showCancelButton: true,
           confirmButtonText: 'Restore',
           confirmButtonColor: '#fd7e14',
        }).then((result) => {
           if (result.value) {
              $.ajax({
                 url: `/api/config/department/${id}/`,
                 type: 'PATCH',
                 data: {
                    is_archive: 0,
                 },
                 beforeSend: function (xhr, settings) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                 },
                 success: function (result) {
                    Toast.fire({
                       icon: 'success',
                       title: 'Restore Successfully',
                    });
                    department.ajax.reload();
                 },
                 error: function (a, b, error) {
                    Toast.fire({
                       icon: 'error',
                       title: error,
                    });
                 },
              })
           }
        })
     });

     $('#dt_forms_category_types').on('click', '.btn_delete', function () {
        let dt_data = categoryType.row($(this).parents('tr')).data();
        let id = dt_data['id'];
  
        Swal.fire({
           title: 'Are you sure?',
           icon: 'question',
           showCancelButton: true,
           confirmButtonText: 'Restore',
           confirmButtonColor: '#fd7e14',
        }).then((result) => {
           if (result.value) {
              $.ajax({
                 url: `/api/config/categorytype/${id}/`,
                 type: 'PATCH',
                 data: {
                    is_archive: 0,
                 },
                 beforeSend: function (xhr, settings) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                 },
                 success: function (result) {
                    Toast.fire({
                       icon: 'success',
                       title: 'Restore Successfully',
                    });
                    categoryType.ajax.reload();
                 },
                 error: function (a, b, error) {
                    Toast.fire({
                       icon: 'error',
                       title: error,
                    });
                 },
              })
           }
        })
     });
 });