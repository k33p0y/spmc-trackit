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
    let table = $('#dt_forms').DataTable({
       "searching": false,
       "responsive": true,
       "lengthChange": false,
       "autoWidth": false,
       "serverside": true,
       "processing": true,
       "pageLength": 25,
       "ajax": {
          url: '/api/config/status/?format=datatables',
          type: "GET",
          dataSrc: function (json) {
             return json.data.filter(function (item) {
                return item.is_archive == false;
             });
          }
       },
       "columns": [
          { data: "name" },
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
             data: null,
             render: function (data, type, row) {
                data = `<a href='#' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>
                      <a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>`;
                return data
             },
          }
       ],
    });
 
    // Get Checkbox State
    $('#chk_status').click(function () {
       if ($(this).prop("checked") == true) {
          chk_status = true;
       }
       else if ($(this).prop("checked") == false) {
          chk_status = false;
       }
    });
 
    // CREATE / POST
    $('#btn_new').on('click', function () {
       // Assign AJAX Action Type and URL
       action_type = 'POST';
       url = '/api/config/status/';
       alert_msg = 'Saved Successfully';
 
       $("#formModal").modal();
       $(".modal-title").text('New Form');
       $('#txt_typename').val('');
    });
 
    // UPDATE / PUT
    $('#dt_forms tbody').on('click', '.btn_edit', function () {
       let dt_data = table.row($(this).parents('tr')).data();
       let id = dt_data['id'];
 
       // Assign AJAX Action Type/Method and URL
       action_type = 'PUT';
       url = `/api/config/status/${id}/`;
       alert_msg = 'Update Successfully';
 
       // Open Modal
       // Rename Modal Title
       $("#formModal").modal();
       $(".modal-title").text('Update Form');
 
       // Populate Fields
       $('#txt_typename').val(dt_data['name']);
       $('#chk_status').prop("checked", dt_data['is_active']);
    });
 
    // Submit Form
    $("#btn_save").click(function (e) {
       e.preventDefault();
 
       // Variables
       let data = {}
       let success = 1;
 
       // Data
       data.name = $('#txt_typename').val();
       data.is_active = chk_status;
       data.is_archive = false;
 
       // Form is Valid
       if (success == 1) {
          axios({
            method: action_type,
            url: url,
            data: data,
            headers: axiosConfig,
          }).then(function (response) { // success
            Toast.fire({
                icon: 'success',
                title: alert_msg,
            });
            $('#formModal').modal('toggle');
            $("#form").trigger("reset");
            table.ajax.reload();
          }).catch(function (error) { // error
            if (error.response.data.name) {
                $('#txt_typename').addClass('form-error');
                $('.name-error').html(`*${error.response.data.name}`)
            } else {
                $('#txt_typename').removeClass('form-error');
                $('.name-error').html('')
            }
            Toast.fire({
                icon: 'error',
                title: error,
            });
          });
       };
    });
 
    // DELETE / PATCH
    $('#dt_forms tbody').on('click', '.btn_delete', function () {
       let dt_data = table.row($(this).parents('tr')).data();
       let id = dt_data['id'];
 
       Swal.fire({
          title: 'Are you sure?',
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'Delete',
          confirmButtonColor: '#d9534f',
       }).then((result) => {
          if (result.value) {
             axios({
                headers: axiosConfig,
                url: `/api/config/status/${id}/`,
                method: "PATCH",
                data: {
                   is_archive: true,
                },
             }).then(function (response) {
                Toast.fire({
                   icon: 'success',
                   title: 'Deleted Successfully',
                });
                table.ajax.reload();
             }).catch(function (error) {
                Toast.fire({
                   icon: 'error',
                   title: error,
                });
             });
          };
       });
    });
 
    //Modal Cancel
    $('#btn_cancel').click(function () {
       // Reset Fields to Defaults
       $('#txt_typename').removeClass('form-error');
       $('.error-info').html('');
       $('#chk_status').prop("checked", true);
       $('#select2_status').val([]).trigger('change');
    });
 
 });