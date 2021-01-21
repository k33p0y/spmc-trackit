$(document).ready(function () {

   var searchInput = function() { return $('#search-input').val(); }
   var isActive = function() { return $('#form-active-select').val(); }

   // Local Variables
   let chk_status = true;
   let action_type, url;
   let alert_msg = '';

   // Spectrum Picker
   $('#txt_color').spectrum({
      type: "text",
      showPalette: false,
   });

   // Select2 Config
   $('.select2_status').select2({
      allowClear: true,
      placeholder: 'Select Status',
      // cache: true,
   });

   $('#form-active-select').select2({
      allowClear: true,
      placeholder: 'Is Active',
      // cache: true,
   });

   // clear form status select2 field on modal close
   $('#formModal').on('hidden.bs.modal', function (e) {
      $('#select2_status').val([]).trigger('change');
   })

   // Add Status Fields
   $('#btn_add').click(function () {
      const form_wrapper = $('.form-wrapper');
      form_wrapper.append(form_row)

      // Select2 Config
      $('.select2_status').select2({
         allowClear: true,
         placeholder: 'Select Status',
         // cache: true,
      });
   });

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
      "pageLength": 25,
      "ajax": {
         url: '/api/requests/forms/?format=datatables',
         type: "GET",
         data: {
            "search_input": searchInput,
            "is_active": isActive
         },
      },
      "columns": [
         { data: "name" }, // Name
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
         {
            data: null,
            render: function (data, type, row) {
               data = '';
               if($('#changeRequestFormHidden').val() == 'true') {
                  data = data + "<a href='#' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>";
               }
               if($('#deleteRequestFormHidden').val() == 'true') {
                  data = data + "<a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>";
               }
               return data
            },
         }
      ],
      "order": [[ 3, "desc" ]],
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
      url = '/api/requests/forms/';
      alert_msg = 'Saved Successfully';

      let samp_json = [{
         "title": "",
         "fields": [
            {
               "id": "",
               "name": null,
               "size": "",
               "type": "",
               "answer": null,
               "option": null
            }
         ],
         "is_admin": true
      }]

      $("#formModal").modal();
      $(".modal-title").text('New Form');
      $("#btn_delete").hide()
      $('#txt_typename').val('');
      $('#txt_color').val('');
      $('#txt_json').val(JSON.stringify(samp_json));

      const form_wrapper = $('.form-row-extras').empty();
      for (let i = 0; i <= 2; i++) {
         form_wrapper.append(form_row)

         // Select2 Config
         $('.select2_status').select2({
            allowClear: true,
            placeholder: 'Select Status',
            // cache: true,
         });
      }

      prettyPrint();
   });

   // UPDATE / PUT
   $('#dt_forms tbody').on('click', '.btn_edit', function () {
      const dt_data = table.row($(this).parents('tr')).data();
      const id = dt_data['id'];
      const status = dt_data['status'];

      // Assign AJAX Action Type/Method and URL
      action_type = 'PUT';
      url = `/api/requests/forms/${id}/`;
      alert_msg = 'Update Successfully';

      // Open Modal
      // Modal Config
      $("#formModal").modal();
      $(".modal-title").text('Update Form');
      $("#btn_delete").show();
      $(".form-wrapper").empty();
      updateStatusOrder(status)

      // Populate Fields
      $('#txt_typename').val(dt_data['name']);
      $('#txt_color').val(dt_data['color']);
      $('#txt_json').val(JSON.stringify(dt_data['fields']));
      setStatusOrder(status)

      // Format Textarea value to JSON
      prettyPrint();
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let success = 0;
      const data = new Object()

      // Data
      data.name = $('#txt_typename').val();
      data.color = $('#txt_color').val();
      data.status = getStatusOrder();
      data.fields = JSON.parse($('#txt_json').val());
      data.is_active = chk_status;
      data.is_archive = false;

      // Validation for typename
      let nameInput = false;
      let name_message = $('#txt_typename').siblings('small');
      let name_input = name_message.siblings('input');
      if ($('#txt_typename').val() == '') {
         name_input.addClass('form-error');
         name_message.html('*This field cannot be empty');
      } else {
         name_input.removeClass('form-error');
         name_message.html('');
         nameInput = true;
      }

      // Validation for color
      let colorInput = false;
      let color_message = $('#txt_color').parent().siblings('small');
      let color_input = color_message.siblings('span').children('input');
      if ($('#txt_color').val() == '') {
         color_input.addClass('form-error');
         color_message.html('*This field cannot be empty');
      } else {
         color_input.removeClass('form-error');
         color_message.html('');
         colorInput = true;
      }

      // Validation for status and order
      let statusOrderInput = false;
      const form_row = $(".form-wrapper div.form-row");
   
      console.log(form_row);
   
      form_row.each(function () {
         const status = $(this).find('div.form-group select');
         const order = $(this).find('div.form-group input');
   
         if (status.val() != '' && order.val() != '') {
            $(this).find('div.form-group').removeClass('has-error');;
            $(this).find('.txt_order').removeClass('form-error');
            $(this).find('div.form-group').find('.status-error').html('');
            statusOrderInput = true;
         } else {
            $(this).find('div.form-group').addClass('has-error');
            $(this).find('.txt_order').addClass('form-error');
            $(this).find('div.form-group').find('.status-error').html('*This field row cannot be empty');
         }
      });


      if(nameInput && colorInput && statusOrderInput) { success = 1; }

      // console.log(data);

      // // Form is Valid
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
            $('#select2_status').val([]).trigger('change');
            table.ajax.reload();
         }).catch(function (error) { // error
            if (error.response.data.name) {
               $('#txt_typename').addClass('form-error');
               $('.name-error').html(`* ${error.response.data.name}`)
            } else {
               $('#txt_typename').removeClass('form-error');
               $('.name-error').html('')
            }
            if (error.response.data.color) {
               $('#txt_color').addClass('form-error');
               $('.color-error').html(`* ${error.response.data.color}`)
            } else {
               $('#txt_color').removeClass('form-error');
               $('.color-error').html('')
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
               url: `/api/requests/forms/${id}/ `,
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
      $('#txt_color').removeClass('form-error');
      $('.error-info').html('');
      $('#chk_status').prop("checked", true);
      $('#select2_status').val([]).trigger('change');
   });

   // RELOAD TABLE
   $("#btn_reload").click(function () {
      table.ajax.reload();
   });

   //SEARCH
   $("#execute-search").click(function () {
      table.ajax.reload();
      return false; // prevent refresh
   });

});


function prettyPrint() {
   let obj = JSON.parse($('#txt_json').val());
   let pretty = JSON.stringify(obj, undefined, 4);
   $('#txt_json').val(pretty);
}

function getStatusOrder() {
   const arr = new Array();
   const form_row = $(".form-wrapper div.form-row");

   console.log(form_row);

   form_row.each(function () {
      const status = $(this).find('div.form-group select');
      const order = $(this).find('div.form-group input');

      if (status.val() != '' && order.val() != '') {
         arr.push({
            'status': status.val(),
            'order': order.val()
         });
         $(this).find('div.form-group').removeClass('has-error');;
         $(this).find('.txt_order').removeClass('form-error');
         $(this).find('div.form-group').find('.status-error').html('');
      } else {
         $(this).find('div.form-group').addClass('has-error');
         $(this).find('.txt_order').addClass('form-error');
         $(this).find('div.form-group').find('.status-error').html('*This field row cannot be empty');
      }
   });

   console.log(arr);
   return arr
}

function setStatusOrder(status) {
   let counter = 1;

   status.forEach(stat => {
      $(`#status_${counter}`).val(stat.id).trigger('change');
      $(`#order_${counter}`).val(stat.order);
      counter++;
   });
}