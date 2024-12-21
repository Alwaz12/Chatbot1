const chatBody = document.querySelector(".chat-body");
const  messageInput = document.querySelector(".message-input");
const SandMsg = document.getElementById("sand-message");
const fileInput = document.getElementById("file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancel = document.getElementById("cancel-file");
const chatbotToggler = document.getElementById("chatbot-toggler");
const chatbotClose = document.getElementById("close-chatbot");


// API Setup here......
const API_KEY = `AIzaSyCh3zJBB2YBMXjueNAU_CFa2z673VEXgHA`;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
const userData = {
    message:  null,
    file: {
        data: null,
        mime_type: null
    }
 }

 const initialInputHeight = messageInput.scrollHeight;

// Create message element with dyanmic classes and return it

const createMessageElement = (content, ...classes) =>{
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}
//     generate bot response using api 
   const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    //  API Request  option 
          const requestOption = {
            method:"POST",
            header: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{text: userData.message}, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
                }]
            })
          }

    try {
        //  Fetch bot response from API 
        const response = await fetch(API_URL, requestOption);
        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);

        // Extract and Display bot's response text
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        messageElement.innerText = apiResponseText;
        

    } catch (error){
        console.log(error);
         messageElement.innerText = error.message;
         messageElement.style.color = "#ff0000";       
    } finally {
        //   Reset user' data file data , emoving thinking indicator and scrill chat to bottom 
        userData.file = {};
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }      
   }


// Handle outgoing user message
const handleOutgoingMessage = (e) => {
    e.preventDefault(e);

    userData.message = messageInput.value.trim();
    messageInput.value = "";
    fileUploadWrapper.classList.remove("file-uploaded");

    // Create And display User message 
   const messageContent = `<div class="message-text"></div> ${userData.file.data ? `<img src= "data:
                           ${userData.file.mime_type}; base64String, 
                           ${userData.file.data}" class= "attachment"/>` : ""}`;
   const outgoingMessageDiv =  createMessageElement(messageContent, "user-message");
   outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
   chatBody.appendChild(outgoingMessageDiv);
   chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

//     simulate bot respone with thinking indicator after a deley 
   setTimeout(() => {
    const messageContent = `<div class="message bot-message thinking">
                <div class="message-text">
                    <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div></div>
                </div>
            </div>`;
    const incomingMessageDiv =  createMessageElement(messageContent, "bot-message", "thinking");
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    generateBotResponse(incomingMessageDiv);
   },400);
};

// handle Enter key press for sending message

messageInput.addEventListener("keydown", (e) => {
    let  userMessage = e.target.value.trim();
    if(e.key === "Enter" && userMessage){
        handleOutgoingMessage(e);
        
    }
});
// Adjust input filed height dyanmically
messageInput.addEventListener("input", () => {
   messageInput.style.height = `${initialInputHeight}px`;
   messageInput.style.height = `${messageInput.scrollHeight}px`;
   document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > 
   initialInputHeight ? "15px" : "32px";
});

// Handle file iinput change 
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if(!file) return;

   const reader = new FileReader();
   reader.onload = (e) => {
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
      const base64String = e.target.result.split(",")[1];

// Store file data and user data 
    userData.file = {
        data: base64String,
        mime_type: file.type
    }
       fileInput.value = "";
    
   }

   reader.readAsDataURL(file);
});

// Cancel File Upload 
fileCancel.addEventListener("click", () => {
 userData.file = {};
 fileUploadWrapper.classList.remove("file-uploaded");

});

// ......Emoji Scrpit here......

const picker = new EmojiMart.Picker({
   theme: "light",
   skinTonePosition: "none",
   previewPosition: "none",
   onEmojiSelect: (emoji) => {
      const { selectionStart: start, selectionEnd: end } = messageInput;
      messageInput.setRangeText(emoji.native, start, end, "end");
      messageInput.focus();
   },

   onClickOutside: (e) => {
   if(e.target.id === "emoji-picker"){
    document.body.classList.toggle("show-emoji-picker");
   } else {
    document.body.classList.remove("show-emoji-picker");
   }
   }
});

document.querySelector(".chat-form").appendChild(picker);

SandMsg.addEventListener("click", (e) => handleOutgoingMessage(e));
document.getElementById("file-upload").addEventListener("click", () => fileInput.click());
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
chatbotClose.addEventListener("click", () => document.body.classList.remove("show-chatbot"));