$(document).ready(function () {
   $('#select2_types').select2();
   $('#select2_categories').select2({});

   // Load Dropdown Category Type
   axios.get( `/api/requests/lists/${$(".ticket-no").data().ticketId}/`).then(result => {
      const type = result.data.category.map((category) => {return category.category_type_id});
      const categories = result.data.category.map((category) => {return category.id});

      $('#select2_types').val(type[0]).select2();
      $('#select2_categories').val(categories).select2({
         allowClear: true,
         placeholder: 'Select category',
         sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
      });
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

   $("#btn_update").click(function (e) {
      e.preventDefault();

      const ticket = $(".ticket-no").data().ticketId;
      let is_valid = validateForms();
      if (is_valid) {

         // Data
         data = new Object();
         data.form_data = getFormDetailValues();
         data.description = $('#txt_description').val();
         data.category = $('#select2_categories').val();
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

      axios({
         url: `/api/requests/${id}/generate-reference/`,
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
         toastError(error)
      });
   });

   let validateForms = function () {
      let is_valid = true;
      
      // validate text & textarea fields
      $('.form-text-required').each(function(){
         if($(this).val() == '') {
            $(this).addClass('form-error').next().html('*This field may not be blank')
            is_valid = false;
         } else {
            $(this).removeClass('form-error').next().html('')
         }
      });

      // validate dropdown fields
      $('.form-select-required').each(function(){
         if($(this).val() == '') {
            $(this).next().find('.select2-selection').addClass('form-error')
            $(this).siblings('.error-info').html('*This field may not be blank')
            is_valid = false;
         } else {
            $(this).next().find('.select2-selection').removeClass('form-error')
            $(this).siblings('.error-info').html('')
         }
      });

      // validate checkbox & radio btn fields
      $('.form-option-required').each(function() {
         let parent = $(this); 
         let options = parent.children().find('input');
         
         options.each(function (i, item) {
            // option name
            if (item.type === "radio") var option = `input[name='${item.name}']`; // get input name for radio button
            if (item.type === "checkbox") var option = `.${$(this).prop('class')}`; // get class for checkbox
               
            // validate 
            if ($(`${option}:checked`).length === 0) {
               parent.next().html('*Please select an option')
               is_valid = false;
            } else {
               parent.next().html('');
            }
         });
      });

      // Validate multiple form field
      $('.form-field-required').each(function() {
         let parent = $(this);
         let field = parent.children('input');
         let options = parent.children().find('input');
         
         // radio or checkbox
         options.each(function (i, item) {
            // option name
            if (item.type === "radio") var option = `input[name='${item.name}']`; // get input name for radio button
            if (item.type === "checkbox") var option = `.${$(this).prop('class')}`; // get class for checkbox
              
            // validate 
            if ($(`${option}:checked`).length === 0) {
               parent.next().html('*Please select an option')
               is_valid = false;
            } else {
               field.removeClass('form-error')
               parent.next().html('');
            }
            
            // textfield
            if (field.val() == '') {
               field.addClass('form-error')
               parent.next().html('*This field may not be blank')
               is_valid = false;
            } 
         });
      });
      
      return is_valid;
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