$(document).ready(function () {
    $('.file-type').each((index, element) => {
       let file_type = fileType($(element).data().mimetype, media_type);
       $(element).addClass(file_type);
    });
 
    $('#dt_attachments').DataTable({
       "searching": false,
       "responsive": true,
       "lengthChange": false,
       "pageLength": 10,
    })
 
    $('#dd_edit_departments').select2({ // department select2
       allowClear: true,
       placeholder: 'Select Department',
       cache: true,
    });
 
    $('#dd_edit_categories').select2({ // categories select2
       allowClear: true,
       placeholder: 'Select Category',
       cache: true,
    });
  
    // SElECT ON CHANGE EVENT
    var department = $("#dd_edit_departments option:selected").val();
    $('#dd_edit_departments').on('change', function () { // department dropdown
       department = $($(this), "option:selected").val();
    });

    var category = $("#dd_edit_categories option:selected").val();
    $('#dd_edit_categories').on('change', function () { // categories dropdown
       category = $($(this), "option:selected").val();
    });
 
    // File Upload
    var file_arr = new Array();
    $('#file_upload').on('change', function() {
       const files = this.files;
       const file_table = $("#file_table");
 
       Object.values(files).forEach(file => {
          let type = fileType(file.type, media_type);
          let size = fileSize(file.size);
 
          if (type == 'invalid') { // If file is not registered
             this.value = "";
             Toast.fire({
                icon: 'error',
                title: 'File type is not supported!',
             })
          } else if (size == 'invalid') { // If file is more than 25MB
             this.value = "";
             Toast.fire({
                icon: 'error',
                title: 'File is too big!',
             })
          } else {
             file_table.prepend(
                `<tr>
                   <td><span class="far fa-lg ${type} mr-2"></span>${file.name}</td>
                   <td> - </td>
                   <td> - </td>
                   <td> ${size} </td>
                   <td> - </td>
                </tr>`
             );
             file_arr.push(file);
          }
       });
    })
 
    $("#btn_update").click(function (e) {
       e.preventDefault();
 
       let success = validateForms();
       if (success == 1) {
          const ticket_id = $(this).attr('ticket_id')
 
          // Data
          data = new Object();
          data.form_data = getFormDetailValues();
          data.category = category;
          data.department = department;
          data.is_active = ($('#is_active_switch').is(":checked")) ? true : false;
 
          axios({
             method: 'PATCH',
             url: `/api/requests/lists/${ticket_id}/`,
             data: data,
             headers: axiosConfig,
          }).then(function (response) { // success
              socket.send(
                JSON.stringify({ticket_id: response.data.ticket_id}) // send ticket_id to websocket
             )
 
             // disable submit button
             $(this).attr('disabled', true)
             $.when(
                Toast.fire({
                   icon: 'success',
                   title: 'Update Successfully',
                }),
                $('.overlay').removeClass('d-none')
             ).then(function () {
                $(location).attr('href', '/requests/lists')
             });
 
          }).catch(function (error) { // error
             Toast.fire({
                icon: 'error',
                title: error,
             });
          });
       }
    });
 
 });
 
function validateForms() {
    let success = 1;
 
    // Validate Request Details
    if ($('#dd_edit_categories').val() == '') {
       $('#dd_edit_categories').next().find('.select2-selection').addClass('form-error');
       $('#error-info-category').html('*This field cannot be empty')
       success--;
    } else {
       $('#dd_edit_categories').next().find('.select2-selection').removeClass('form-error');
       $('#error-info-category').html('');
    }
 
    if ($('#dd_edit_departments').val() == '') {
       $('#dd_edit_departments').next().find('.select2-selection').addClass('form-error');
       $('#error-info-department').html('*This field cannot be empty')
       success--;
    } else {
       $('#dd_edit_departments').next().find('.select2-selection').removeClass('form-error');
       $('#error-info-department').html('')
    }
 
    // Validate Request Form Fields
    const form_fields = $('.form_field_detail');
    
    form_fields.each(function(index, val) {      
       if(val.required == true) {
          if ($(this).val() == '') {
             $(this).addClass('form-error').next().html('*This field cannot be empty');
             success--;
          } else {
             $(this).removeClass('form-error').next().html('');
          }
       }
 
       // if($(this).children().length > 0 && $(this).data().requiredId == 'False') {
       //    let check_count = $(this).find('input:checkbox:checked').length;
          
       //    if (check_count == 0 ) {
       //       $(this).next().html('*Please select at least one')
       //    }
       // }
    });
 
    return success;
}
 
function getFormDetailValues() {
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