// استيراد الدوال اللازمة من Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// بيانات مشروعك في Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBsIaCjE7QOQ6QkhqhCIMA3sLdMvxBxPHk",
  authDomain: "shaglni-c64c0.firebaseapp.com",
  projectId: "shaglni-c64c0",
  storageBucket: "shaglni-c64c0.firebasestorage.app",
  messagingSenderId: "768887356636",
  appId: "1:768887356636:web:d836c1d5d30167279c8819",
  measurementId: "G-5P0MNGPMG0"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

let currentUserUid = null;

// دالة لإضافة رسالة إلى الواجهة
const appendMessage = (message, sender) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
};

// مصادقة المستخدم بشكل مجهول (Anonymous)
signInAnonymously(auth)
    .then((userCredential) => {
        currentUserUid = userCredential.user.uid;
        appendMessage('مرحباً! أنا مساعدك الافتراضي. كيف يمكنني خدمتك اليوم؟', 'ai');
        console.log('Signed in as:', currentUserUid);
    })
    .catch((error) => {
        console.error('Error signing in:', error);
    });

// الاستماع إلى الرسائل في الوقت الفعلي
const messagesCollection = collection(db, "messages");
const q = query(messagesCollection, orderBy("timestamp"));

onSnapshot(q, (snapshot) => {
    // إفراغ صندوق الدردشة قبل العرض لتجنب التكرار
    chatBox.innerHTML = '';
    
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            const messageData = change.doc.data();
            const sender = (messageData.uid === currentUserUid) ? 'user' : 'ai';
            appendMessage(messageData.text, sender);
        }
    });
});

// إرسال رسالة جديدة
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageText = userInput.value.trim();

    if (messageText !== '' && currentUserUid) {
        try {
            await addDoc(messagesCollection, {
                text: messageText,
                uid: currentUserUid,
                timestamp: new Date()
            });
            userInput.value = '';
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }
});
