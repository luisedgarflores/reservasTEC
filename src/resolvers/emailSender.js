var nodemailer = require('nodemailer');
// email sender function
exports.sendEmail = function (mailBody, subject, addressee, transporter) {
  // Definimos el transporter
  // Definimos el email
  var mailOptions = {
    from: 'Reservas Campus Puebla',
    to: addressee,
    subject,
    text: mailBody
  };
  // Enviamos el email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return error
    } else {
      console.log("Email sent");
      return true
    }
  });
};