$(document).ready(function () {

   var searchInput = function() { return $('#search-input').val(); }
   var activeFilter = function() { return $('#active-filter').val(); }

   // Local Variables
   let chk_status = true;
   let action_type, url;
   let alert_msg = '';

   // Colors
   $('.color-palette').click(function () {
      let bg_color = $(this).css('background-color');
      let hex = rgb2hex(bg_color);
      $('#txt_color').val(hex).css('background-color', bg_color).addClass('text-light')
   });

   // Status Select2 Config
   $('.select2_status').select2({
      allowClear: true,
      placeholder: 'Select status',
      // cache: true,
   });

   // Status Select2 Config
   $('#select2-types').select2({
      allowClear: true,
      placeholder: 'Select category type',
      // cache: true,
   });

   // Groups Select2 Config
   $('#select2-groups').select2({
      allowClear: true,
      placeholder: 'Select groups',
      cache: true,
   });

   // clear form status select2 field on modal close
   $('#formModal').on('hidden.bs.modal', function (e) {
      $('#select2_status').val([]).trigger('change');
   })

   // Remove Status Fields
   $('.form-wrapper').on('click', '.btn-remove', function () {
      $(this).parents("div.form-row").remove()
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
      "pageLength": 20,
      "ajax": {
         url: '/api/requests/forms/?format=datatables',
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
                  data = ($('#changeRequestFormHidden').val() == 'true') ? `<a href="#" class='btn-link-orange action-link btn_edit'>${row.name}</a>` : row.name
               }
               return data
            },
         }, // Name
         { data: "prefix" }, // Name
         {
            data: "color",
            render: function (data, type, row) {
               data = `<div class= "circle" style = "background-color:${row.color};" ></div>`;
               return data
            }
         }, // Color
         {
            data: 'date_created',
            render: function (data, type, row) {
               if (type == 'display') {
                  var datetime = moment(row.date_created).format('MMM DD, YYYY h:mm:ss a');
                  data = `<p class="title mb-1">${datetime}</p>`
               }
               return data
            },
         }, // Date Create
         {
            data: 'date_created',
            render: function (data, type, row) {
               if (type == 'display') {
                  var datetime = moment(row.date_modified).format('MMM DD, YYYY h:mm:ss a');
                  data = `<p class="title mb-1">${datetime}</p>`
               }
               return data
            },
         }, // Date Update
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
      ],
      "order": [[ 3, "desc" ]],
   });

   // Get Checkbox State
   $('#chk_status').click(function () {
      chk_status = ($(this).prop("checked") == true) ? true : false;
   });

   $('#btn_add').click(function () {
      let counter = $('.form-wrapper .form-row').length + 1;
      addStatusRow(counter);
   });

   // CREATE / POST
   $('#btn-create-form').on('click', function () {
      // Assign AJAX Action Type and URL
      action_type = 'POST';
      url = '/api/requests/forms/';
      alert_msg = 'Saved Successfully';

      $("#formModal").modal();
      $(".modal-title").text('Add Form');
      $('.form-wrapper').empty();
      for (let i = 1; i <= 4; i++) addStatusRow(i);

      resetForm();
      prettyPrint();
   });

   // UPDATE / PUT
   $('#dt_forms tbody').on('click', '.btn_edit', function () {
      const groups = new Array();
      const types = new Array();

      const dt_data = table.row($(this).parents('tr')).data();
      const id = dt_data['id'];
      const status = dt_data['status'];
      
      dt_data['group'].forEach( group => groups.push(group.id));
      dt_data['category_types'].forEach( type => types.push(type.id));
      
      // Assign AJAX Action Type/Method and URL
      action_type = 'PUT';
      url = `/api/requests/forms/${id}/`;
      alert_msg = 'Update Successfully';

      // Open Modal
      // Modal Config
      $("#formModal").modal();
      $(".modal-title").text('Update Form');
      $('.form-wrapper').empty();
      updateStatusOrder(status);

      // Populate Fields
      resetForm();
      $('#txt_typename').val(dt_data['name']);
      $('#txt_prefix').val(dt_data['prefix']);
      $('#txt_color').val(dt_data['color']).css('background-color', dt_data['color']).addClass('text-light');
      $('#select2-groups').val(groups).trigger('change');
      $('#select2-types').val(types).trigger('change');
      $('#txt_json').val(JSON.stringify(dt_data['fields']));
      $('#chk_status').prop("checked", dt_data['is_active']);
      setStatusOrder(status)

      // Format Textarea value to JSON
      prettyPrint();
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let success = validateForms();
      if (success == 1) {
         const data = new Object()
         data.name = $('#txt_typename').val();
         data.prefix = $('#txt_prefix').val();
         data.color = $('#txt_color').val();
         data.groups = $('#select2-groups').val();
         data.category_types = $('#select2-types').val();
         data.status = getStatusRowValues();
         data.fields = JSON.parse($('#txt_json').val());
         data.is_active = chk_status;

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
            $('#select2_groups').val([]).trigger('change');
            $('#select2_status').val([]).trigger('change');
            table.ajax.reload();
         }).catch(function (error) { // error
            if (error.response.data.name) {
               $('#txt_typename').addClass('form-error');
               $('#name_error').html(`* ${error.response.data.name}`)
            } else {
               $('#txt_typename').removeClass('form-error');
               $('#name_error').html('')
            }
            if (error.response.data.prefix) {
               $('#txt_prefix').addClass('form-error');
               $('#prefix_error').html(`* ${error.response.data.name}`)
            } else {
               $('#txt_prefix').removeClass('form-error');
               $('#prefix_error').html('')
            }
            if (error.response.data.color) {
               $('#txt_color').addClass('form-error');
               $('#color_error').html(`* ${error.response.data.color}`)
            } else {
               $('#txt_color').removeClass('form-error');
               $('#color_error').html('')
            }
            Toast.fire({
               icon: 'error',
               title: error,
            });
         });
      } 
   });

   //Modal Cancel
   $('#btn_cancel').click(function () {
      resetForm()
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
   
   var prettyPrint = function () {
      // prettify textarea to JSON format Fn
      let obj = JSON.parse($('#txt_json').val());
      let pretty = JSON.stringify(obj, undefined, 4);
      $('#txt_json').val(pretty);
   };

   var getStatusRowValues = function() {
      const arr = new Array();
      const form_row = $(".form-wrapper div.form-row");
   
      form_row.each(function () {
         const status = $(this).find('div.form-group select');
         const order = $(this).find('div.form-group input.txt_order');
         const is_client = $(this).find('div.form-group input.client-box');
         const is_head = $(this).find('div.form-group input.head-box');
         const has_approving = $(this).find('div.form-group input.approving-box');
         const has_pass_fail = $(this).find('div.form-group input.pass-fail-box');
   
         if (status.val() != '' && order.val() != '') {
            arr.push({
               'status': status.val(),
               'order': order.val(),
               'is_client' : (is_client.is(":checked")) ? true : false,
               'is_head' : (is_head.is(":checked")) ? true : false,
               'has_approving' : (has_approving.is(":checked")) ? true : false,
               'has_pass_fail' : (has_pass_fail.is(":checked")) ? true : false,
            });
   
            $(this).find('div.form-group').removeClass('has-error');;
            $(this).find('.txt_order').removeClass('form-error');
            $(this).find('div.form-group').find('.status-error').html('');
         } else {
            $(this).find('div.form-group').addClass('has-error');
            $(this).find('.txt_order').addClass('form-error');
            $(this).find('div.form-group').find('.status-error').html('*This field row may not be blank');
         }
      });
      
      return arr
   };

   var setStatusOrder = function(status) {
      let counter = 1;
      status.forEach(stat => {
         $(`#status_${counter}`).val(stat.id).trigger('change');
         $(`#order_${counter}`).val(stat.order);
         $(`#chk_is_client_${counter}`).prop("checked", stat.is_client_step);
         $(`#chk_is_head_${counter}`).prop("checked", stat.is_head_step);
         $(`#chk_has_approving_${counter}`).prop("checked", stat.has_approving);
         $(`#chk_has_pass_fail_${counter}`).prop("checked", stat.has_pass_fail);
   
         counter++;
      });
   };

   var validateForms = function() {
      var success = 1;

      // Validate Request Details
      if ($('#txt_typename').val() == '') {
         $('#txt_typename').addClass('form-error');
         $('#name_error').html('*This field may not be blank')
         success--;
      } else {
         $('#txt_typename').removeClass('form-error');
         $('#name_error').html('');
      }
      
      if ($('#txt_prefix').val() == '') {
         $('#txt_prefix').addClass('form-error');
         $('#prefix_error').html('*This field may not be blank')
         success--;
      } else {
         $('#txt_prefix').removeClass('form-error');
         $('#prefix_error').html('');
      }
   
      if ($('#txt_color').val() == '') {
         $('#txt_color').addClass('form-error');
         $('#color_error').html('*This field may not be blank')
         success--;
      } else {
         $('#txt_color').removeClass('form-error');
         $('#color_error').html('');
      }
   
      const form_row = $(".form-wrapper div.form-row");
      form_row.each(function () {
         const status = $(this).find('div.form-group select');
         const order = $(this).find('div.form-group input');
   
         if (status.val() != '' && order.val() != '') {
            $(this).find('div.form-group').removeClass('has-error');;
            $(this).find('.txt_order').removeClass('form-error');
            $(this).find('div.form-group').find('.status-error').html('');
         } else {
            $(this).find('div.form-group').addClass('has-error');
            $(this).find('.txt_order').addClass('form-error');
            $(this).find('div.form-group').find('.status-error').html('*This field row may not be blank');
            success--;
         }
      });
   
      return success;
   };

   var rgb2hex = function(bg_color) {
      var rgb = bg_color.replace(/\s/g,'').match(/^rgba?\((\d+),(\d+),(\d+)/i);
      return (rgb && rgb.length === 4) ? "#" +
         ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
         ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
         ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : bg_color;   
   };

   var resetForm = function() {
      let samp_json = [{
         "title": "",
         "form_field": [
            {
               "id": "",
               "type": "",
               "value" : null,
               "option": null,
               "required" : false
            }
         ],
         "is_admin": true
      }]

      $('#txt_typename').removeClass('form-error').val('');
      $('#txt_prefix').removeClass('form-error').val('');
      $('#txt_color').removeClass('form-error').val('').css('background-color', 'unset').removeClass('text-light');
      $("#select2-groups").val([]).trigger('change');
      $("#select2-types").val([]).trigger('change');
      $('#chk_status').prop("checked", true);
      
      $(".select2_status").val([]).trigger('change');
      $(".txt_order").val('');
      $('.client-box').prop("checked", false);
      $('.head-box').prop("checked", false);
      $('.approving-box').prop("checked", false);
      $('.pass-fail-box').prop("checked", false);

      $('#txt_json').val(JSON.stringify(samp_json));
   };

   var addStatusRow = function(count) {
      let row = formStatusRow(count);
      $(".form-wrapper").append(row)

      // Select2 Config
      $('.select2_status').select2({
         allowClear: true,
         placeholder: 'Select status',
         // cache: true,
      });
   };
});