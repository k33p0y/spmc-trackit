$(document).ready(function () {
   // LOCAL VARIABLES
   let dd_type_id, dd_form_id, dd_department_id, dd_category_id;

   // SELECT2 CONFIGURATION
   $('#dd_departments').select2({ // department select2
      allowClear: true,
      placeholder: 'Select Department',
      cache: true,
   });

   $('#dd_forms').select2({ // request form select2
      allowClear: true,
      placeholder: 'Select Form',
      cache: true,
   });

   $('#dd_types').select2({ // category type select2
      allowClear: true,
      placeholder: 'Select Category Type',
      cache: true,
   });

   $('#dd_categories').select2({ // categories select2
      allowClear: true,
      placeholder: 'Select Category',
      cache: true,
   });

   // SElECT ON CHANGE EVENT
   $('#dd_departments').on('change', function () { // department dropdown
      dd_department_id = $("#dd_departments option:selected").val();
   });

   $('#dd_forms').on('change', function () { // request form dropdown
      dd_form_id = $("#dd_forms option:selected").val();
      doTheThing(dd_form_id)
         .then((data) => {
            fields_arr = data.fields;
            generateForm(fields_arr);
         })
   });

   $('#dd_types').on('change', function () { // category type dropdown
      dd_type_id = $("#dd_types option:selected").val();
   });

   $('#dd_categories').on('change', function () { // categories dropdown
      dd_category_id = $("#dd_categories option:selected").val();
   });
});