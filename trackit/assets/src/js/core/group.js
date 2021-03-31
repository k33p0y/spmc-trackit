$(document).ready(function () {
   let action_type, url;
   let alert_msg = '';

   var searchInput = function() { return $('#search-input').val(); }

   // Select2 Config
   $('#select2-permissions').select2({
      allowClear: true,
      placeholder: 'Select permissions',
      cache: true,
   });
 
   // RETRIEVE / GET
   let table = $('#dt_group').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 10,
      "ajax": {
         url: '/api/core/group/?format=datatables',
         type: "GET",
         data: {
            "search": searchInput,
         }
      },
      "columns": [
         { 
            data: "name",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = ($('#changeGroupHidden').val() == 'true') ? `<a href="#" class='btn-link-orange action-link btn_edit'>${row.name}</a>` : row.name
               }
               return data
            },
         },
         { data: "user_count" },
      ],
   });
   
   // Create new group button
   $('#btn-create-group').click(function(e){
      // Assign Axios Action Type and URL
      action_type = 'POST';
      url = '/api/core/group/';

      $("#select2-permissions").val([]).trigger('change'); // reset select2 before loading modal

      $("#modal-add-group").modal();
      $(".modal-title").text('Add Group');
      $('#txt-group-name').val('');
   });

   // UPDATE / PUT
   $('#dt_group tbody').on('click', '.btn_edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];

      // Assign AJAX Action Type/Method and URL
      action_type = 'PUT';
      url = `/api/core/group/${id}/`;

      // // Open Modal
      // // Rename Modal Title
      $("#modal-add-group").modal();
      $(".modal-title").text('Update Group');

      // // Populate Fields
      $('#txt-group-name').val(dt_data['name']);
      $('#select2-permissions').val(dt_data['permissions']).trigger('change');
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      let success = 1;

      // Data
      data.name = $('#txt-group-name').val();
      data.permissions = $('#select2-permissions').val();;

      // Validation
      if ($('#txt-group-name').val() == '') {
         $('#txt-group-name').addClass('form-error');
         $('#group-name-error').html('*This field cannot be empty');
         success--;
      } else {
         $('#txt-group-name').removeClass('form-error');
         $('#group-name-error').html('');
      }
      
      if (success){ // if form is valid
         axios({
            method: action_type,
            url: url,
            data: data,
            headers: axiosConfig,
         }).then(function (response) { // success
            toastSuccess('Success');            
            $("#form").trigger("reset"); // reset form
            $("#select2-permissions").val([]).trigger('change'); // reset select2
            $('#modal-add-group').modal('toggle');
            table.ajax.reload();
         }).catch(function (error) { // error
            if (error.response.data.name) {
                $('#txt-group-name').addClass('form-error');
                $('#group-name-error').html(`*${error.response.data.name}`)
            } else {
                $('#txt-group-name').removeClass('form-error');
                $('#group-name-error').html('')
            }
            toastError(error);
         });
      }
   });

   // Search Bar onSearch Event
   $("#search-input").on('search', function () {
      table.ajax.reload();
      return false; // prevent refresh
   });

   // Search Bar onClick Event
   $("#execute-search").click(function () {
      table.ajax.reload();
      return false; // prevent refresh
   });

});