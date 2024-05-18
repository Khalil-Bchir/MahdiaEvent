
const nodemailer=require("nodemailer");
// For this example to work, you need to set up a sending domain,
// and obtain a token that is authorized to send from the domain

const sendEmail=async(subject,message,to,from)=>{
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "9671f77710bf14",
      pass: "cb7e4c9c8bb232"
    }
  });
   transport.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: message,
    function (err,info) {
      if (err){
        console.log(err);
      }
      else{
        console.log(info);
      }
      
    }
  })}
  module.exports = sendEmail;