$(document).ready(function () {
   // Check if user has already done or skip walkthrough
   axios.get('/api/config/tour/').then(res => { // response
      const response = res.data.results;
      let request = new Object();
      // if has response and is_explore value is false; call walkthrough fn with PUT method and url
      // if empty response; call walkthrough fn with POST method to create instance  
      if (response.length > 0 && !response[0].is_explore_req_detail) {
         request.method = 'PUT';
         request.url = `/api/config/tour/${response[0].id}/`;
         exploreRequestDetail(request);
      }
      else if (response.length == 0) {
         request.method = 'POST';
         request.url = `/api/config/tour/`;
         exploreRequestDetail(request);
      }
   }).catch(err => { // error
      toastError(err.response.statusText) // alert
   });


   $('#select2_categorytype').select2();
   $('#select2_category').select2({ // categories select2
      allowClear: true,
      placeholder: 'Select category',
      cache: true,
   });
   $('.form-select').select2();
   $('.form-datetime').datetimepicker({
      icons: {
         time: 'fas fa-clock',
         date:'fas fa-calendar',
      }
   });
   
   // show admin field wrapper 
   if ($('#row-field-admin .form-admin-wrapper').children().length > 0) {
      $('#row-field-admin').removeClass("d-none");
   }

   // Load File Icons In Attachment Table
   $('.file-type').each((index, element) => {
      let file_type = fileType($(element).data().mimetype, media_type);
      $(element).addClass(file_type);
   });

   // SElECT ON CHANGE EVENT
   $('#select2_categorytype').on('change', function () { // category type dropdown
      const category_type = $("#select2_categorytype option:selected").val();
      axios.get('/api/config/list/category/dropdown', {
         params: {
            "category_type" : category_type,
            "is_active": 0
         }
      }, axiosConfig).then(res => {
         $("#select2_category")
            .empty()
            .removeAttr('disabled');

         res.data.forEach(category => {
            $("#select2_category").append(`<option value='${category.id}'>${category.name}</option>`)
         });
      });
   });

   $("#btn_update").click(function (e) {
      e.preventDefault();
      const ticket = $(".ticket-no").data().ticketId;

      // Data
      data = new Object();
      data.form_data = getFormDetailValues();
      data.request_form = $("#request_form").data().formId
      data.description = $('#txt_description').val();
      data.category = $('#select2_category').val();
      data.is_active = ($('#is_active_switch').is(":checked")) ? true : false;

      axios({
         method: 'PUT',
         url: `/api/requests/ticket/crud/${ticket}/`,
         data: data,
         headers: axiosConfig,
      }).then(async function (response) {    
         // disable submit button
         $(this).attr('disabled', true);
         // Call upload Fn
         if (file_arr.length > 0) await uploadAttachment(ticket, file_arr) 
         // Alert
         $.when(toastSuccess('Success')).then(function () {$('#btn_view')[0].click()})
         // send notif
         socket_notification.send(JSON.stringify({type: 'notification', data: {object_id: ticket, notification_type: 'ticket'}}))          
      }).catch(function (error) { // error
         toastError(error.response.statusText)
         if (error.response.data.description) showFieldErrors(error.response.data.description, 'description'); else removeFieldErrors('description');
         if (error.response.data.category) showFieldErrors(error.response.data.category, 'category'); else removeFieldErrors('category');
         if (error.response.data.form_data) showFieldErrors(error.response.data.form_data, 'formfields'); else removeFieldErrors('formfields');
      });
   });

   // Generate Reference No
   $('#btn_generate').click(function() {
      let id = $(this).data().ticketId;

      axios({
         url: `/api/requests/ticket/generate_reference/${id}/`,
         method: "PATCH",
         headers: axiosConfig
      }).then(function (response) {
         // Show Spinners
         $(".ref-spinner").removeClass('d-none');
         $("#ref_context").html('');
         $("#btn_generate").prop('disabled', true)

         setTimeout(function() { 
            $(".ref-spinner").addClass('d-none');
            $("#ref_context").removeClass('text-light').html(response.data.reference_no);
            $("#btn_generate").remove()
         }, 800);
      }).catch(function (error) {
         toastError(error.response.statusText)
      });
   });

   let showFieldErrors = function(obj, field) {
      // Get error message
      let msg = '';
      obj.forEach(error => {msg += `${error} `});
      // Add error class change border color to red
      if (field == 'description') $(`#txt_${field}`).addClass('form-error');
      if (field == 'category') {
         $(`#select2_${field}`).next().find('.select2-selection').addClass('form-error');
         if ($('#select2_categorytype').val()) {
            $('#select2_categorytype').next().find('.select2-selection').removeClass('form-error');
            $('#categorytype-error').html('')
         } else {
            $('#select2_categorytype').next().find('.select2-selection').addClass('form-error');
            $('#categorytype-error').html(`*${msg}`)
         }
      }
      if (field == 'formfields') {
         $('.error-formfields').html('');
         obj.forEach(error => {
            $(`#${error.field_id}`).addClass('form-error');
            $(`#${error.field_error}-error`).append(`*${error.message} `)
         });
      }
      // display message
      $(`#${field}-error`).html(`*${msg}`)
   };

   let removeFieldErrors = function(field, type) {
      // Remove error class for border color
      if (type === 'select') $(`#select2_${field}`).next().find('.select2-selection').removeClass('form-error');
      else $(`#txt_${field}`).removeClass('form-error');
      $(`#${field}-error`).html('')
   };

   let getFormDetailValues = function() {
      const form_fields = $('.form_field_detail');
      const form_data = new Array()
      
      form_fields.each(function(index, val) {
         const is_required = ($(this).attr("is_required").toLowerCase() === 'true') ? true : false;
         const is_multifield = ($(this).attr("is_multifield").toLowerCase() === 'true') ? true : false;
  
         if ($(this).children().length > 0) {
            let nodes = $(this).children();
            var answer = new Array();
            var type;

            nodes.each(function(index, element) {
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
         if (val.type == 'select-one') {
            var answer = new Array();
            var type = val.type;
            var selected_val =  $(`#${val.id}`).val();

            $(`#${val.id} option`).each(function(i, opt) {
               answer.push({
                  "option_id": opt.value,
                  "option_name" : opt.text,
                  "option_value": (opt.value == selected_val) ? true : false
               });
            });           
         }

         form_data.push({
            "id" : val.id,
            "type" : type,
            "value" : answer,
            "is_required" : is_required,
            "is_multifield" : is_multifield,
            "title" : 'None'
         });
      });
      return form_data;
   }

   // walkthrough click event
   $('.tour-me').click(function() {
      exploreRequestDetail();
   });
});