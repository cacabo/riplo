// Import frameworks
const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

// Import JSON
const projects = require('./src/json/projects.json');

// Set the API key for sendgrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Constants used for setting meta tags
const defaultProps = {
  title: 'Riplo',
  description: 'Driven group of student developers',
  keywords: 'Riplo,cameron,cabo,adam,ripley,penn,upenn,freelance,dev,developer,react,node,express,app,apps,application,css,html,ruby,native,handlebars,hbs,js,jsx,javascript',
  image: '/img/bg.png',
  siteName: 'Riplo',
  url: 'riplo.io'
};

// Helper function to set default props
const renderProps = (props) => (
  Object.assign(defaultProps, props)
);

// Helper function to render a not found page
const renderNotFound = (res) => {
  res.status(404).render('not-found', {
    title: `${defaultProps.title} | Not Found`,
  });
};

/**
 * BEGIN ROUTING
 */

// Homepage
router.get('/', (req, res) => {
  res.render('home', renderProps({
    projects,
  }));
});

// Handle sending an email through the contact form
router.post('/contact', (req, res) => {
  // Ensure environment variables are in place
  let error = '';
  if (!process.env.EMAILS) error = 'EMAILS list not found';
  else if (!process.env.SENDGRID_API_KEY) error = 'SENDGRID_API_KEY not found';
  if (error) {
    res.send({success: false, error});
    return;
  }

  // Parse variables from the body
  const {
    firstName,
    lastName,
    email,
    subject,
    body,
  } = req.body;

  // Error checking on parameters
  if (!firstName) error = 'First name must be populated';
  else if (!lastName) error = 'Last name must be populated';
  else if (!email) error = 'Email must be populated';
  else if (!body) error = 'Body must be populated';
  else if (!subject) error = 'Subject must be populated';
  else if (firstName.length > 100) error = 'First name limited to 100 characters';
  else if (lastName.length > 100) error = 'Last name limited to 100 characters';
  else if (email.length > 150) error = 'Email limited to 150 characters';
  else if (subject.length > 200) error = 'Subject limited to 200 characters';
  else if (body.length > 10000) error = 'Body limited to 10,000 characters';

  // Relay information back to the website
  if (error) {
    res.send({ success: false, error });
    return;
  }

  // Construct the message
  const text = `Email from Riplo\nName: ${firstName} ${lastName}\n${body}`;
  const html = `<p>Email from Riplo</p><p><strong>Name:</strong> ${firstName} ${lastName}</p><p>${body}</p>`;
  const baseMsg = {
    from: email,
    subject,
    text,
    html,
  };

  // Send the message to each recipient in the env variable
  const recipients = process.env.EMAILS.split(',');
  const awaitEmails = recipients.map(recipient => {
    const msg = Object.assign(baseMsg, { to: recipient });

    return sgMail.send(msg)
      .then(() => ({ success: true }))
      .catch(sendgridError => {
        ({ success: false, error: sendgridError.message });
      });
  });

  Promise.all(awaitEmails).then(results => {
    let i;

    for (i = 0; i < results.length; i++) {
      if (!results[i].success) {
        res.send(results[i]);
        return;
      }
    }

    res.send(results[0]);
  });
});

// Handle 404 error
// NOTE this is reached if no other route above was matched
router.get('*', (req, res) => renderNotFound(res));

// Export the router
module.exports = router;
