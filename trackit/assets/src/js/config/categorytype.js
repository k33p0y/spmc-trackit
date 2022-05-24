$(document).ready(function () {

   var searchInput = function() { return $('#search-input').val(); }
   var activeFilter = function() { return $('#active-filter').val(); }

   // Local Variables
   let method, url;

   // GET
   // List Table
   let table = $('#dt_category_type').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverSide": true,
      "processing": true,
      "language": {
         processing: $('#table_spinner').html()
      },
      "pageLength": 20,
      "ajax": {
         url: '/api/config/categorytype/?format=datatables',
         type: "GET",
         data: {
            "search": searchInput,
            "is_active": activeFilter
         },
      },
      "columns": [
         {
            data: "name",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = ($('#changeTypeHidden').val() == 'true') ? `<a href="#" class='btn-link-orange action-link btn_edit'>${row.name}</a>` : row.name
               }
               return data
            },
         }, // Name
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
         } // Is Active
      ],
   });

   // CREATE / POST
   $('#btn-create-type').on('click', function () {
      // Assign AJAX Action Type and URL
      method = 'POST';
      url = '/api/config/categorytype/'

      $("#formModal").modal();
      $(".modal-title").text('Add Category Type');
      $('#txt_typename').val('');
   });

   // UPDATE / PUT
   $('#dt_category_type tbody').on('click', '.btn_edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];

      // Assign AJAX Action Type/Method and URL
      method = 'PUT';
      url = `/api/config/categorytype/${id}/`;

      // Open Modal
      // Rename Modal Title
      $("#formModal").modal();
      $(".modal-title").text('Update Cataegory Type');

      // Populate Fields
      $('#txt_typename').val(dt_data['name']);
      $('#chk_status').prop("checked", dt_data['is_active']);
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      let data = new Object();
      data.name = $('#txt_typename').val();
      data.is_active = $('#chk_status').is(':checked');

      axios({
         method: method,
         url: url,
         data: data,
         headers: axiosConfig,
      }).then(response => {
         toastSuccess('Success');
         $('#formModal').modal('toggle');
         $("#form").trigger("reset");
         $('.error-info').html(''); 
         table.ajax.reload();
      }).catch(error => {
         toastError(error.response.statusText);
         if (error.response.data.name) showFieldErrors(error.response.data.name, 'typename'); else removeFieldErrors('name');
      })
   });

   //Modal Cancel
   $('#btn_cancel').click(function () {
      // Reset Fields to Defaults
      $('#txt_typename').removeClass('form-error');
      $('.error-info').html('');
      $('#chk_status').prop("checked", true);
   });

   // // //  Filters
   // Select2 config
   $('.select-filter').select2();

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

   // Apply Filter
   $("#btn_apply").click(function () {
      table.ajax.reload();
      return false; // prevent refresh
   });

   // Clear Filter
   $("#btn_clear").click(function () {
      $('#form-filter').trigger("reset");
      $('#form-filter select').trigger("change");
      table.ajax.reload();
      return false; // prevent refresh
   });
   
   // Close Dropdown 
   $('#close_dropdown').click(function (){ toggleFilter() });

   // Close Dropdown When Click Outside 
   $(document).on('click', function (e) { toggleFilter() });

   // Dropdown Prevent From closing
   $('.dropdown-filter').on('hide.bs.dropdown', function (e) {
      if (e.clickEvent) e.preventDefault();      
   });

   let showFieldErrors = function(obj, field){
      let errors = ''
      $(`#txt_${field}`).addClass('form-error');
      for (i=0; i<obj.length; i++) errors += `${obj[i]} `;
      $(`#${field}_error`).html(`*${errors}`)
   };

   let removeFieldErrors = function(field){
      $(`#txt_${field}`).removeClass('form-error');
      $(`#${field}_error`).html(``)
   };
});