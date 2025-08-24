import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 1. إعدادات Firebase
// قم باستبدال هذه الإعدادات بمعلومات مشروعك
const firebaseConfig = {
    apiKey: "AIzaSyBsIaCjE7QOQ6QkhqhCIMA3sLdMvxBxPHk",
    authDomain: "shaglni-c64c0.firebaseapp.com",
    projectId: "shaglni-c64c0",
    storageBucket: "shaglni-c64c0.firebasestorage.app",
    messagingSenderId: "768887356636",
    appId: "1:768887356636:web:11ec1d6991add3309c8819",
    measurementId: "G-98GQGZS09W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // تهيئة خدمة المصادقة

// 2. المتغيرات والعناصر الرئيسية
let currentUser = null; 
let currentChatId = null; 
let unsubscribeFromMessages = null; // نستخدم هذا لإيقاف الاستماع للرسائل عند تغيير المحادثة

const chatsList = document.getElementById('chatsList');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const chatPartnerName = document.getElementById('chatPartnerName');

// 3. هنا تبدأ المصادقة!
// هذا الكود يستمع لحالة المستخدم، سواء كان مسجلاً أو لا.
// وهو يعمل تلقائياً عند تحميل الصفحة.
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("المستخدم مسجل الدخول:", currentUser.uid);
        // عند تسجيل الدخول، نبدأ بجلب المحادثات
        fetchChats(); 
    } else {
        currentUser = null;
        console.log("المستخدم غير مسجل الدخول.");
        chatsList.innerHTML = '<p class="text-gray-500 text-center mt-8">الرجاء تسجيل الدخول لعرض رسائلك.</p>';
        messagesContainer.innerHTML = '<p class="text-gray-500 text-center mt-8">يجب عليك تسجيل الدخول للمراسلة.</p>';
        disableChatInput();
    }
});

function disableChatInput() {
    messageInput.disabled = true;
    sendMessageBtn.disabled = true;
    messageInput.placeholder = 'يجب عليك تسجيل الدخول للمراسلة.';
}

function enableChatInput() {
    messageInput.disabled = false;
    sendMessageBtn.disabled = false;
    messageInput.placeholder = 'اكتب رسالتك هنا...';
    messageInput.focus();
}

// 4. دالة لجلب وعرض المحادثات
function fetchChats() {
    if (!currentUser) return;

    const q = query(collection(db, "chats"), where("members", "array-contains", currentUser.uid));

    // onSnapshot تستمع للتغييرات في قاعدة البيانات وتحدث القائمة تلقائياً
    onSnapshot(q, (snapshot) => {
        chatsList.innerHTML = '';
        if (snapshot.empty) {
            chatsList.innerHTML = '<p class="text-gray-500 text-center mt-8">لا توجد محادثات حتى الآن.</p>';
        }

        snapshot.forEach(doc => {
            const chat = doc.data();
            const chatId = doc.id;
            const otherUserId = chat.members.find(id => id !== currentUser.uid);
            
            // في الواقع، ستحتاج إلى جلب اسم المستخدم من قاعدة بياناتك (مثلاً من مجموعة employees)
            // لجعل هذا يعمل بشكل صحيح
            const otherUserName = `المستخدم: ${otherUserId.substring(0, 5)}...`;

            const chatItem = document.createElement('div');
            chatItem.classList.add('chat-item', 'p-3', 'border-b', 'border-gray-200', 'cursor-pointer', 'hover:bg-gray-100');
            chatItem.dataset.chatId = chatId;
            chatItem.innerHTML = `
                <div class="font-semibold text-gray-800">${otherUserName}</div>
                <div class="text-sm text-gray-500 truncate">${chat.lastMessage || 'لا توجد رسائل'}</div>
            `;
            chatItem.addEventListener('click', () => {
                selectChat(chatId, otherUserName);
            });
            chatsList.appendChild(chatItem);
        });
    });
}

// 5. دالة لعرض رسائل المحادثة المحددة
function selectChat(chatId, partnerName) {
    if (currentChatId === chatId) return; 

    // إيقاف الاستماع للمحادثة السابقة لمنع تداخل الرسائل
    if (unsubscribeFromMessages) {
        unsubscribeFromMessages();
    }
    
    currentChatId = chatId;
    chatPartnerName.textContent = partnerName;
    messagesContainer.innerHTML = '';
    enableChatInput();
    
    const messagesRef = collection(db, "chats", currentChatId, "messages");
    const q = query(messagesRef, orderBy("timestamp"));

    // onSnapshot تستمع للتغييرات في رسائل المحادثة الحالية
    unsubscribeFromMessages = onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = '';
        snapshot.forEach(doc => {
            const message = doc.data();
            const messageBubble = document.createElement('div');
            messageBubble.classList.add('message-bubble', message.senderId === currentUser.uid ? 'sent' : 'received');
            messageBubble.textContent = message.text;
            messagesContainer.appendChild(messageBubble);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

// 6. دالة لإرسال رسالة جديدة
async function sendMessage() {
    const text = messageInput.value.trim();
    if (text === "" || !currentUser || !currentChatId) return;

    const messageData = {
        senderId: currentUser.uid,
        text: text,
        timestamp: serverTimestamp()
    };

    try {
        const messagesRef = collection(db, "chats", currentChatId, "messages");
        await addDoc(messagesRef, messageData);
        // أيضاً نقوم بتحديث آخر رسالة في المحادثة
        const chatDocRef = doc(db, "chats", currentChatId);
        await updateDoc(chatDocRef, {
            lastMessage: text,
            lastUpdated: serverTimestamp()
        });
        messageInput.value = '';
    } catch (e) {
        console.error("خطأ في إرسال الرسالة:", e);
        alert("فشل إرسال الرسالة. الرجاء المحاولة مرة أخرى.");
    }
}

// 7. ربط الأزرار بالكود
sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// عند تحميل الصفحة، يتم تفعيل onAuthStateChanged تلقائياً
