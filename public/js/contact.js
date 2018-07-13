// Handle submitting the contact page
$(document).ready(function setFormListener() {
  // Isolate elements
  var $contactMessage = $('#contact-page-message');
  var $contactPageForm = $('#contact-form');
  var $submitButton = $('#submit-button');

  if ($contactPageForm) {
    // When the contact form is submitted
    $contactPageForm.submit(function handleSubmit(event) {
      // Prevent the default action
      event.preventDefault();

      // Style button
      $submitButton.addClass('disabled');
      $submitButton.val('Sending...');

      // Parse and format form data
      var str = $(this).serialize();

      // Actually make the request
      $.post('/contact', str, function handleResponse(data) {
        if (!data.success) {
          // If sending the message was unsuccessful
          $contactMessage.html(`<div class="alert alert-danger marg-bot-1">${data.error}</div>`);

          // Reset the button
          $submitButton.removeClass('disabled');
          $submitButton.val('Send');
        } else {
          // If sending the message was successful
          $contactMessage.html('<div></div>');
          $contactPageForm.html('<div><div class="alert alert-success">Your email was sent successfully! We will get back to you as quickly as possible.');
        }
      }).fail(function handleFailure() {
        // If there was some other error
        $contactMessage.html('<div class="alert alert-danger marg-bot-1">Something went wrong. Check the form and try again.</div>');

        // Reset the button
        $submitButton.removeClass('disabled');
        $submitButton.val('Send');
      });
    });
  }
});
