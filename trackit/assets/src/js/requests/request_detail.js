$(document).ready(function () {
   // show admin field wrapper 
   if ($('#row-field-admin .form-admin-wrapper').children().length > 0) {
      $('#row-field-admin').removeClass("d-none");
   }

   // Load File Icons In Attachment Table
   $('.file-type').each((index, element) => {
      let file_type = fileType($(element).data().mimetype, media_type);
      $(element).addClass(file_type);
   });

   $('#select2_types').select2({ // department select2
      allowClear: true,
      placeholder: 'Select category Type',
      cache: true,
   });

   $('#select2_categories').select2({ // categories select2
      allowClear: true,
      placeholder: 'Select category',
      cache: true,
      sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
   });

   // SElECT ON CHANGE EVENT
   $('#select2_types').on('change', function () { // category type dropdown
      category_type = $("#select2_types option:selected").val();

      axios.get('/api/config/category', {
         params: {
            "category_type" : category_type,
            "is_active": 0
         }
      }, axiosConfig).then(res => {
         $("#select2_categories")
            .empty()
            .append('<option></option>')
            .removeAttr('disabled');

         res.data.forEach(category => {
            $("#select2_categories").append(`<option value='${category.id}'>${category.name}</option>`)
         });
      });
   });

   var category = $("#select2_categories option:selected").val();
   $('#select2_categories').on('change', function () { // categories dropdown
      category = $($(this), "option:selected").val();
   });
   

   $("#btn_update").click(function (e) {
      e.preventDefault();

      const ticket = $(".ticket-no").data().ticketId;
      let success = validateForms();
      if (success == 1) {

         // Data
         data = new Object();
         data.form_data = getFormDetailValues();
         data.description = $('#txt_description').val();
         data.category = category;
         data.is_active = ($('#is_active_switch').is(":checked")) ? true : false;

         axios({
            method: 'PUT',
            url: `/api/requests/lists/${ticket}/`,
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
            toastError(error);
         });
      }
   });

   // Generate Reference No
   $('#btn_generate').click(function() {
      let id = $(this).data().ticketId;
      let form = $('#form_id').data().formId;

      axios({
         url: `/api/requests/lists/${id}/`,
         method: "PATCH",
         data: {request_form: form},
         headers: axiosConfig
      }).then(function (response) {
         // Show Spinners
         $(".ref-spinner").removeClass('d-none');
         $("#ref_context").html('');

         setTimeout(function() { 
            $(".ref-spinner").addClass('d-none');
            $("#ref_context").removeClass('text-light').html(response.data.reference_no);
            $("#btn_generate").remove()
         }, 1200);
      }).catch(function (error) {
         Toast.fire({
            icon: 'error',
            title: error.response.data,
         });
      });
   });

   let validateForms = function () {
      let success = 1;
   
      // Validate Request Details
      if ($('#txt_description').val() == '') {
         $('#txt_description').addClass('form-error');
         $('#error-info-desc').html('*This field may not be blank')
         success--;
      } else {
         $('#txt_description').next().find('.select2-selection').removeClass('form-error');
         $('#error-info-desc').html('');
      }

      if ($('#select2_categories').val() == '') {
         $('#select2_categories').next().find('.select2-selection').addClass('form-error');
         $('#error-info-category').html('*This field may not be blank')
         success--;
      } else {
         $('#select2_categories').next().find('.select2-selection').removeClass('form-error');
         $('#error-info-category').html('');
      }
      
      if ($('#select2_types').val() == '') {
         $('#select2_types').next().find('.select2-selection').addClass('form-error');
         $('#error-info-type').html('*This field may not be blank')
         success--;
      } else {
         $('#select2_types').next().find('.select2-selection').removeClass('form-error');
         $('#error-info-type').html('');
      }
      
      // Validate Request Form Fields
      // const form_fields = $('.form_field_detail');
      
      // form_fields.each(function(index, val) {      
      //    if(val.required == true) {
      //       if ($(this).val() == '') {
      //          $(this).addClass('form-error').next().html('*This field cannot be empty');
      //          success--;
      //       } else {
      //          $(this).removeClass('form-error').next().html('');
      //       }
      //    }
   
      //    // if($(this).children().length > 0 && $(this).data().requiredId == 'False') {
      //    //    let check_count = $(this).find('input:checkbox:checked').length;
            
      //    //    if (check_count == 0 ) {
      //    //       $(this).next().html('*Please select at least one')
      //    //    }
      //    // }
      // });
   
      return success;
   }

   let getFormDetailValues = function() {
      const form_fields = $('.form_field_detail');
      const form_data = new Array()
      
      form_fields.each(function(index, val) {
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
         
         form_data.push({
            "id" : val.id,
            "type" : type,
            "value" : answer,
         });
      });
   
      return form_data;
   }
});