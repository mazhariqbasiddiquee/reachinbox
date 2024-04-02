  const express = require('express');
  const {google} = require('googleapis');
  const { OpenAI } = require('openai-node');
  const axios = require('axios');
  const nodemailer = require('nodemailer');
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const app = express();
  const {mailRouter}=require("./route/mail.route");
const { default: mongoose } = require('mongoose');
  app.use(express.json())
  app.use("/mail",mailRouter)
  require('dotenv').config()
  
  const clientId = "520555494456-047arde7g5hlhkvgtp07jkqkr4s6crh8.apps.googleusercontent.com"
  const clientSecret ="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"
  const redirectUrl = "https://reachinbox-3q2k.onrender.com/auth/google/callback"

  
  const scopes = ['https://www.googleapis.com/auth/blogger','https://www.googleapis.com/auth/calendar','https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/gmail.modify'];
  
  app.get("/", (req, res) => {
    res.send('<a id="anchor" href="https://reachinbox-3q2k.onrender.com/login">continue with google</a>');
});





  app.get("/login", async(req,res)=>{
      try {
          const authUrl = getAuthUrl();
          res.redirect(authUrl);      
      } catch (error) {
          console.error(error);
      }
  })
  
  app.get("/auth/google/callback", async(req,res)=>{
      const code = req.query.code;
  
      try {
    
        const tokens = await exchangeCodeForTokens(code);
    
        message(tokens)
          res.send({ tokens });
    
      } catch (error) {
    
        console.error('Error exchanging code for tokens:', error);
        res.status(500).send('Error occurred during authentication');
      }
  })
  
  async function exchangeCodeForTokens(code) {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      return tokens;
    }
    

    
  
  function getAuthUrl() {
      const oauth2Client = new google.auth.OAuth2(`${clientId}`, `${clientSecret}`, `${redirectUrl}`);
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
      });
      return authUrl;
    }



    //  getting 















    async function message(tokens) {
      const auth = new google.auth.OAuth2(
          clientId,
          clientSecret,
          redirectUrl
      );
  
      auth.setCredentials(tokens);
  
      try {
          const gmail = google.gmail({ version: 'v1', auth });
  
          const res = await gmail.users.messages.list({
              userId: 'me',
              maxResults: 10
          });
  
          const messages = res.data.messages;
          for (const message of messages) {
              try {
                  const msg = await gmail.users.messages.get({
                      userId: 'me',
                      id: message.id
                  });
  
                  if (msg.data.payload) {
                      const headers = msg.data.payload.headers;
                      const subject = headers.find(header => header.name === 'Subject').value;
  
                      
                      const sender = headers.find(header => header.name === 'From').value;
  
                    
                      const receiver = headers.find(header => header.name === 'To').value;
  
                     
                      const messageId = msg.data.id;
  
                      const bodyPart = msg.data.payload.parts?.[0];
                      const body = bodyPart ? bodyPart.body.data : undefined;
                      const decodedBody = body ? Buffer.from(body, 'base64').toString('utf-8') : '';
                     let res=await axios.get(`https://reachinbox-3q2k.onrender.com/mail/${messageId}`)
                      // console.log(res)
                      if(!res.data){
                        let response= await run(decodedBody);
                        

                        axios.post("https://reachinbox-3q2k.onrender.com/mail/add", {
                          mailid: messageId,
                          label: response ? "Interested" : "Notinterested"
                      }, {
                          headers: {
                              "Content-Type": "application/json"
                          }
                      })
                      .then(response => {
                          console.log('Response:', response.data);
                      })
                      .catch(error => {
                          console.error('Error:', error);
                      });
                         if(response){
                          const emailLines = [
                            `From: ${receiver}`,
                            `To: ${sender}`,
                            'Content-type: text/html;charset=iso-8859-1',
                            'MIME-Version: 1.0',
                            'Subject: Reachinbox',
                            '',
                            'if you are willing to hop on to a demo call by suggesting a time.'
                        ];
                        
                          const email = emailLines.join('\r\n').trim();
                          const base64Email = Buffer.from(email).toString('base64');
                        
                          await gmail.users.messages.send({
                            userId: 'me',
                            requestBody: {
                              raw: base64Email
                            }
                          });
                        
                         }


                      }
                      
                     
                    
                
                      
                  }
              } catch (error) {
                  console.error('Error fetching or analyzing message:', error);
              }
          }
      } catch (error) {
          console.error('Error fetching messages:', error);
      }
  }
  
  





   const geminie=process.env.geminie

 


   const genAI = new GoogleGenerativeAI(geminie);

   async function run(decodedBody) {
   
     const model = genAI.getGenerativeModel({ model: "gemini-pro"});
   
     const content = `${decodedBody}\nIf the email shows interest in learning more, you can offer to schedule a demo call.`;
   
     const result = await model.generateContent(content);
     const response = await result.response;
     const text = response.text();
    
   
 
     const interestedRegex = /learn more|schedule a demo|interested in knowing more/i;
     if (interestedRegex.test(text)) {
       return true
     } else {
       return false
     }
   }



   







  app.listen(process.env.PORT, ()=>{
    mongoose.connect("mongodb+srv://mazhariqbal:iqbal@cluster0.hrvyke3.mongodb.net/mailserver?retryWrites=true&w=majority")
      console.log('Server running at 4500');
  })
