$(document).ready(function () {
    // select2 config
    $('#select2_department').select2({
        placeholder: 'Department',
        allowClear: true,
    });

    // autofill username
    $('#txt_firstname, #txt_lastname').keyup(function () {
        createUsername();
    });

    // prevent field to enter letters
    $("#txt_contact").keyup(function () {
        $("#txt_contact").val(this.value.match(/[0-9]*/));
    });

})