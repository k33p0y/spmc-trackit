$(document).ready(function () {

   var searchInput = function () { return $('#search-input').val(); }
   var activeFilter = function () { return $('#active-filter').val(); }

   // Local Variables
   let action_type, url;

   // color on change
   $('#color_picker').on('click', '.color-palette', function () {
      $('.color-palette').removeClass('active');
      $(this).addClass('active')
   });

   // Status Select2 Config
   $('#select2_types').select2({
      allowClear: true,
      placeholder: 'Select category type',
      // cache: true,
   });

   // Groups Select2 Config
   $('#select2_groups').select2({
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
   $('#close_dropdown').click(function () { toggleFilter() });

   // Close Dropdown When Click Outside 
   $(document).on('click', function (e) { toggleFilter() });

   // Dropdown Prevent From closing
   $('.dropdown-filter').on('hide.bs.dropdown', function (e) {
      if (e.clickEvent) e.preventDefault();
   });

   // RETRIEVE / GET
   // List Table
   let table = $('#dt_forms').DataTable({
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
         url: '/api/requests/forms/all/?format=datatables',
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
         {
            data: "prefix"
         }, // Prefix
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
            data: 'date_modified',
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
      "order": [[3, "desc"]],
   });

   // CREATE / POST
   $('#btn-create-form').on('click', function () {
      // Assign AJAX Action Type and URL
      action_type = 'POST';
      url = '/api/requests/forms/crud/';

      $("#formModal").modal();
      $(".modal-title").text('Add Form');
      $('.form-wrapper').empty();
      for (let i = 1; i <= 4; i++) addStatusRow(i);

      resetForm();
      prettyPrint();
   });

   // UPDATE / PUT
   $('#dt_forms tbody').on('click', '.btn_edit', function () {
      const dt_data = table.row($(this).parents('tr')).data();
      const id = dt_data['id'];

      const groups = new Array();
      const types = new Array();
      dt_data['group'].forEach(group => groups.push(group.id));
      dt_data['category_types'].forEach(type => types.push(type.id));

      // Assign AJAX Action Type/Method and URL
      action_type = 'PUT';
      url = `/api/requests/forms/crud/${id}/`;

      // Open Modal
      // Modal Config
      $("#formModal").modal();
      $(".modal-title").text('Update Form');
      $('.form-wrapper').empty();
      updateStatusOrder(dt_data['status']);

      // Populate Fields
      resetForm();
      $('#txt_name').val(dt_data['name']);
      $('#txt_prefix').val(dt_data['prefix']);
      // color field
      $('#color_picker').data('color', dt_data['color']);
      $('#color_picker').attr('data-color', dt_data['color']);
      $('#color_picker .color-palette').each(function () {
         let color_pallete = $(this).css('background-color');
         let color_data = $('#color_picker').data().color
         if (color_pallete == color_data || rgb2hex(color_pallete) == color_data) {
            $(this).addClass('active')
         }
      });
      $('#select2_groups').val(groups).trigger('change');
      $('#select2_types').val(types).trigger('change');
      $('#txt_json').val(JSON.stringify(dt_data['fields']));
      $('#chk_status').prop("checked", dt_data['is_active']);
      setStatusRowValues(dt_data['status'])

      // Format Textarea value to JSON
      prettyPrint();
   });

   // Add row   
   $('#btn_add').click(function () {
      let counter = $('.form-wrapper .form-row').length + 1;
      addStatusRow(counter);
   });

   // select2 officer on change count selected
   $('.form-wrapper').on('change', '.select2_officer', function () {
      const badgeEl = $(this).next().next();
      badgeEl.html($(this).val().length);
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();
      $(this).prop('disabled', false); // disable button      

      if (validateForm()) {
         axios({
            method: action_type,
            url: url,
            data: {
               name: $('#txt_name').val(),
               prefix: $('#txt_prefix').val(),
               color: $('#color_picker .active').css('background-color'),
               group: $('#select2_groups').val(),
               category_types: $('#select2_types').val(),
               status: getStatusRowValues(),
               fields: JSON.parse($('#txt_json').val()),
               is_active: ($('#chk_status').prop("checked") == true) ? true : false,
            },
            headers: axiosConfig,
         }).then(function (response) { // success
            toastSuccess('Success');
            $("#btn_submit").prop('disabled', false); // enable button
            $('#formModal').modal('toggle');
            table.ajax.reload();
         }).catch(function (error) { // error
            toastError(error.response.statusText);
            if (error.response.data.name) showFieldErrors(error.response.data.name, 'name'); else removeFieldErrors('name');
            if (error.response.data.prefix) showFieldErrors(error.response.data.prefix, 'prefix'); else removeFieldErrors('prefix');
            if (error.response.data.color) showFieldErrors(error.response.data.color, 'color'); else removeFieldErrors('color');
         });
      }
   });

   // checkbox is_client on change event
   $('.form-wrapper').on('change', '.client-box', function () {
      let rowEl = $(this).parents('.form-row'); // parent row
      disableSelect(rowEl);
   });
   // checkbox is_client on change event
   $('.form-wrapper').on('change', '.head-box', function () {
      let rowEl = $(this).parents('.form-row'); // parent row
      disableSelect(rowEl);
   });

   let disableSelect = function (rowEl) {
      const select = rowEl.find('div.select2-officer-wrap select') // officer dropdown
      const client_box = rowEl.find('div.form-group input.client-box') // client checkbox
      const head_box = rowEl.find('div.form-group input.head-box') // head checkbox
      if (client_box.is(":checked") || head_box.is(":checked") ) {
         if (select.val()) select.val([]).trigger('change'); // clear dropdown if has values
         select.prop('disabled', true) 
      } else select.prop('disabled', false);
   } 

   let showFieldErrors = function (obj, field) {
      $("#btn_submit").prop('disabled', false); // enable button

      // Get error message
      let msg = '';
      obj.forEach(error => { msg += `${error} ` });
      $(`#${field}_error`).html(`*${msg} `) // display message

      // Add error class change border color to red
      $(`#txt_${field}`).addClass('form-error');
   };

   let removeFieldErrors = function (field) {
      // Remove error class for border color
      $(`#txt_${field}`).removeClass('form-error');
      $(`#${field}-error`).html('');
   };

   var prettyPrint = function () {
      // prettify textarea to JSON format Fn
      let obj = JSON.parse($('#txt_json').val());
      let pretty = JSON.stringify(obj, undefined, 4);
      $('#txt_json').val(pretty);
   };

   var addStatusRow = function (count) {
      let row = formStatusRow(count);
      $(".form-wrapper").append(row)

      // Select2 Config
      $('.select2_status').select2({
         allowClear: true,
         placeholder: 'Select status',
         // cache: true,
      });

      // Select2 Config
      $('.select2_officer').select2({
         allowClear: false,
         placeholder: 'Select officer',
         matcher: function (params, data) {
            let stringMatch = function (term, candidate) {
               return candidate && candidate.toLowerCase().indexOf(term.toLowerCase()) >= 0;
            }
            // If there are no search terms, return all of the data
            if ($.trim(params.term) === '') {
               return data;
            }
            // Do not display the item if there is no 'text' property
            if (typeof data.text === 'undefined') {
               return null;
            }
            // Match text of option
            if (stringMatch(params.term, data.text)) {
               return data;
            }
            // Match attribute "data-foo" of option
            if (stringMatch(params.term, $(data.element).attr('data-groups'))) {
               return data;
            }
            // Return `null` if the term should not be displayed
            return null;
         },
         templateResult: function (state) {
            let data = $(state.element).data()
            let option = $(`<div><div class="font-weight-bold">${state.text}</div> ${data ? `<div class='text-xs'>${data.groups}</div>` : ''}</div>`);
            return option
         },
         templateSelection: function (state) {
            if (!state.id) return 'Select officer';
            return state.text;
         },
         // cache: true,
      });
   };

   var getStatusRowValues = function () {
      const arr = new Array();
      const form_row = $(".form-wrapper div.form-row");

      form_row.each(function () {
         const status = $(this).find('div.select2-status-wrap select');
         const order = $(this).find('div.form-group input.txt_order');
         const officer = $(this).find('div.select2-officer-wrap select');
         const is_client = $(this).find('div.form-group input.client-box');
         const is_head = $(this).find('div.form-group input.head-box');
         const has_approving = $(this).find('div.form-group input.approving-box');
         const has_pass_fail = $(this).find('div.form-group input.pass-fail-box');
         const has_event = $(this).find('div.form-group input.event-box');

         if (status.val() != '' && order.val() != '') {
            arr.push({
               'status': status.val(),
               'order': order.val(),
               'officer': officer.val(),
               'is_client': (is_client.is(":checked")) ? true : false,
               'is_head': (is_head.is(":checked")) ? true : false,
               'has_approving': (has_approving.is(":checked")) ? true : false,
               'has_pass_fail': (has_pass_fail.is(":checked")) ? true : false,
               'has_event': (has_event.is(":checked")) ? true : false
            });
         }
      });
      return arr
   };

   var setStatusRowValues = function (status) {
      status.forEach(stat => {
         let officers = $.map(stat.officer, function( value, i ) { return value.id })
         $(`#status_${stat.id}`).val(stat.status_id).trigger('change');
         $(`#order_${stat.id}`).val(stat.order);
         $(`#officer_${stat.id}`).val(officers).trigger('change');
         $(`#chk_is_client_${stat.id}`).prop("checked", stat.is_client_step);
         $(`#chk_is_head_${stat.id}`).prop("checked", stat.is_head_step);
         $(`#chk_has_approving_${stat.id}`).prop("checked", stat.has_approving);
         $(`#chk_has_pass_fail_${stat.id}`).prop("checked", stat.has_pass_fail);
         $(`#chk_has_event_${stat.id}`).prop("checked", stat.has_event);
      });
   };

   var validateForm = function () {
      var success = true;
      const form_row = $(".form-wrapper div.form-row");

      if ($('#txt_name').val()) {
         $('#txt_name').removeClass('form-error');
         $('#name_error').html('');
      } else {
         $('#txt_name').addClass('form-error');
         $('#name_error').html('*This field may not be blank.')
         success = false;
      }

      if ($('#txt_prefix').val()) {
         $('#txt_prefix').removeClass('form-error');
         $('#prefix_error').html('');
      } else {
         $('#txt_prefix').addClass('form-error');
         $('#prefix_error').html('*This field may not be blank.')
         success = false;
      }

      if ($('.color-palette').hasClass('active')) {
         $('#color_error').html('');
      } else {
         $('#color_error').html('**This field is required.')
         success = false;
      }

      form_row.each(function () {
         const status = $(this).find('div.select2-status-wrap select');
         const order = $(this).find('div.form-group input');
         const officer = $(this).find('div.select2-officer-wrap select');
         const is_client = $(this).find('div.form-group input.client-box');
         const is_head = $(this).find('div.form-group input.head-box');

         if (status.val() != '' && order.val() != '') {
            $(this).find('div.select2-status-wrap').removeClass('has-error');;
            $(this).find('.txt_order').removeClass('form-error');
            $(this).find('div.select2-status-wrap').find('.status-error').html('');
         } else {
            $(this).find('div.select2-status-wrap').addClass('has-error');
            $(this).find('.txt_order').addClass('form-error');
            $(this).find('div.select2-status-wrap').find('.status-error').html('*This field row may not be blank.');
            success = false;
         }

         // // validate officer dropdown if is_client or is_head is not
         // if (is_client.is(":checked") || is_head.is(":checked")) {
         //    $(this).find('div.select2-officer-wrap').removeClass('has-error');
         //    $(this).find('div.select2-officer-wrap').find('.officer-error').html('');
         // } else {
         //    if (officer.val() != '') {
         //       $(this).find('div.select2-officer-wrap').removeClass('has-error');
         //       $(this).find('div.select2-officer-wrap').find('.officer-error').html('');
         //    } else {
         //       $(this).find('div.select2-officer-wrap').addClass('has-error');
         //       $(this).find('div.select2-officer-wrap').find('.officer-error').html('*This field may not be blank.');
         //       success = false;
         //    }
         // }
      });
      return success;
   };

   var rgb2hex = function (bg_color) {
      var rgb = bg_color.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+)/i);
      return (rgb && rgb.length === 4) ? "#" +
         ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
         ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
         ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : bg_color;
   };

   var resetForm = function () {
      let samp_json = [{
         "title": "",
         "form_field": [
            {
               "id": "",
               "type": "",
               "value": null,
               "option": null
            }
         ],
         "is_admin": false,
         "is_required": true,
         "is_multi_field": false,
      }]

      $('#txt_name').removeClass('form-error').val('');
      $('#txt_prefix').removeClass('form-error').val('');
      $('#color_picker').attr('data-color', null);
      $('#color_picker').removeData('color');
      $('.color-palette').removeClass('active');
      $("#select2_groups").val([]).trigger('change');
      $("#select2_types").val([]).trigger('change');
      $('#chk_status').prop("checked", true);

      $(".select2_status").val([]).trigger('change');
      $(".txt_order").val('');
      $(".select2_officer").val([]).trigger('change');
      $('.client-box').prop("checked", false);
      $('.head-box').prop("checked", false);
      $('.approving-box').prop("checked", false);
      $('.pass-fail-box').prop("checked", false);

      $('#txt_json').val(JSON.stringify(samp_json));
   };
});