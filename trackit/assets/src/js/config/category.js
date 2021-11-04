$(document).ready(function () {

   // Select2 Config
   $('#select2_categorytypes').select2({allowClear: true, placeholder: 'Select category type',});
   $('#select2_groups').select2({allowClear: true, placeholder: 'Select groups',});
   $('.select-filter-multiple').select2({placeholder: "All"});
   $('.select-filter').select2();
  
   var searchInput = function() { return $('#search-input').val(); }
   var typeFilter = function() { return $('#type-filter').val(); }
   var activeFilter = function() { return $('#active-filter').val(); }
   var groupFilter = function() { return $('#group-filter').val(); }

   // Local Variables
   let method, url, action;

   // GET
   // List Table
   let table = $('#dt_category').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 20,
      "ajax": {
         url: '/api/config/list/category/?format=datatables',
         type: "GET",
         data: {
            "search": searchInput,
            "category_type": typeFilter,
            "groups": groupFilter,
            "is_active": activeFilter,
         }
      },
      "columns": [
         {
            data: "name",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = ($('#changeCategoryHidden').val() == 'true') ? `<a href="#" class='btn-link-orange action-link btn_edit'>${row.name}</a>` : row.name
               }
               return data
            },
         }, 
         { 
            data: "groups",
            render: function (data, type, row) {
               if (type == 'display') {
                  var data = '';
                  if (row.groups) {
                     row.groups.forEach(group => {
                        data += `<span class="td-badge text-nowrap text-light mr-1" style="background-color: #FD7E14">${group.name}</span>`;
                     })
                  }
               }
               return data
            }
         },
         { data: "category_type.name" },
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
         }
      ],
   });

   // CREATE / POST
   $('#btn-create-category').click(function (e) {
      // Set Axios method and URL
      method = 'POST';
      action = 'CREATE';
      url = '/api/config/category/'
      
      // Modal
      $("#modalCategory").modal();
      $(".modal-title").text('Add Category');

      // Reset Form
      removeFieldErrors('categoryname');
      removeFieldErrors('categorytypes');
      $('#txt_categoryname').val('');
      $('#select2_categorytypes').val('').trigger('change');
      $('#select2_groups').val([]).trigger('change');
      $('#chk_status').prop("checked", true);
   });

   // UPDATE / PUT
   $('#dt_category tbody').on('click', '.btn_edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];
      
      // Return id for each group
      let category_groups = new Array();
      dt_data['groups'].forEach(group => {category_groups.push(group.id)})

      // Set axios method and url
      method = 'PUT';
      action = 'UPDATE'
      url = `/api/config/category/${id}/`;

      // Modal
      $("#modalCategory").modal();
      $(".modal-title").text('Update Cataegory');

      // Populate Fields
      removeFieldErrors('categoryname');
      removeFieldErrors('categorytypes');
      $('#txt_categoryname').val(dt_data['name']);
      $('#select2_categorytypes').val(dt_data['category_type'].id).trigger('change');
      $('#select2_groups').val(category_groups).trigger('change');
      $('#chk_status').prop("checked", dt_data['is_active']);
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let data = new Object();
      data.name = $('#txt_categoryname').val();
      data.category_type = $('#select2_categorytypes').val();
      data.groups = $('#select2_groups').val();
      data.is_active = ($("#chk_status").prop("checked")) ? true : false;

      axios({
         method: method,
         url: url,
         data: data,
         headers: axiosConfig,
      }).then(res => {
         toastSuccess('Success');
         $("#modalCategory").modal('toggle');
         table.ajax.reload();
      }).catch(err => {
         if (err.response.data.name) showFieldErrors(err.response.data.name, 'categoryname'); else removeFieldErrors('categoryname');
         if (err.response.data.category_type) showFieldErrors(err.response.data.category_type, 'categorytypes'); else removeFieldErrors('categorytypes');
      }) 
   });

   //Modal Cancel
   $('#btn_cancel').click(function () {
      // Reset Form
      $('#txt_categoryname').val('');
      $('#select2_categorytypes').val('').trigger('change');
      $('#select2_groups').val([]).trigger('change');
      $('#chk_status').prop("checked", true);
   });

   // // //  Filters
   // Search Bar onSearch Event
   $("#search-input").on('search', function () {
      table.ajax.reload();
      return false; // prevent refresh
   });

   // Search Bar keyPress Event
   $('#search-input').keypress(function(event){
      let keycode = event.keyCode || event.which;
      if (keycode == '13') table.ajax.reload();
   });

   // Search Bar onClick Event
   $("#execute-search").click(function () {
      table.ajax.reload();
      return false; // prevent refresh
   });

   // Apply Filter
   $("#btn_apply").click(function () {
      console.log($('#group-filter').val())
      table.ajax.reload();
      return false; // prevent refresh
   });

   // Clear Filter
   $("#btn_clear").click(function () {
      $('#form-filter').trigger("reset");
      $("#chk_status").prop("checked");
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
      if (field === 'categoryname') $(`#txt_${field}`).addClass('form-error');
      if (field === 'categorytypes') $(`#select2_${field}`).next().find('.select2-selection').addClass('form-error');
      
      // Error message
      let msg = '';
      obj.forEach(error => {msg += `${error} `});
      $(`#${field}_error`).html(`*${msg} `);
   };

   let removeFieldErrors = function(field){
      if (field === 'categoryname') $(`#txt_${field}`).removeClass('form-error');
      if (field === 'categorytypes') $(`#select2_${field}`).next().find('.select2-selection').removeClass('form-error');
      $(`#${field}_error`).html(``)
   };

});