import emailjs from '@emailjs/browser';

export function initEmailJS() {
  emailjs.init("YOUR_PUBLIC_KEY_HERE");
}

export function sendRegistrationEmail(fullName: string, gender: string, email: string, whatsapp: string) {
  const templateParams = {
    name: fullName,
    gender: gender,
    email: email,
    whatsapp: whatsapp,
    _subject: 'New Kairo User Registration',
    _replyto: email
  };
  emailjs.send('service_kairo', 'template_kairo_registration', templateParams)
    .then((response: unknown) => {
      console.log('Email sent successfully:', response);
    })
    .catch((error: unknown) => {
      console.error('Error sending email:', error);
      sendRegistrationEmailFallback(fullName, gender, email, whatsapp);
    });
}

export function sendRegistrationEmailFallback(fullName: string, gender: string, email: string, whatsapp: string) {
  const formData = new FormData();
  formData.append('name', fullName);
  formData.append('gender', gender);
  formData.append('email', email);
  formData.append('whatsapp', whatsapp);
  formData.append('_subject', 'New Kairo User Registration');
  formData.append('_replyto', email);

  fetch('https://formspree.io/f/xpzvgjzw', {
    method: 'POST',
    body: formData,
    headers: { 'Accept': 'application/json' }
  })
  .then(response => {
    if (response.ok) {
      console.log('Fallback email sent successfully');
    } else {
      console.error('Fallback email failed');
    }
  })
  .catch(error => {
    console.error('Error sending fallback email:', error);
  });
}