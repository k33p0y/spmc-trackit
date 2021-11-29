$(document).ready(function () {
    // show notice modal
    $('#btn_register').click(function () {
        // reset form in modal
        $('#chk_agree').prop('checked', false);
        $('#btn_agree').prop('disabled', true);

        // modal option
        $('#noticeModal').modal({
            show: true,
            backdrop: 'static',
            keyboard: false,
        });
    });

    // notice modal event
    $('#noticeModal').on('shown.bs.modal', function (e) {
        // Checkbox change event enable button
        $('#chk_agree').change(function () {
            if (this.checked) $('#btn_agree').prop('disabled', false);
            else $('#btn_agree').prop('disabled', true);
        });
        // Aggree button
        $('#btn_agree').click(function () {
            $('#noticeModal').modal('hide');
            $(location).attr('href', '/registration');
        });
    })
})