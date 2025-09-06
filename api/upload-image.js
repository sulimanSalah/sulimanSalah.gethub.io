<script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
    import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

    // **هذه هي إعدادات Firebase الحقيقية الخاصة بك**
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

    const form = document.getElementById('employee-form');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const jobTitle = document.getElementById('jobTitle').value;
        const jobLocation = document.getElementById('jobLocation').value;
        const photoFile = document.getElementById('photo').files[0];
        const previousWorksFiles = document.getElementById('previousWorks').files;

        if (!photoFile) {
            showMessage('يرجى اختيار صورة شخصية.', 'error');
            return;
        }

        try {
            const profileImageUrl = await uploadImage(photoFile);

            const previousWorksUrls = await Promise.all(
                Array.from(previousWorksFiles).map(file => uploadImage(file))
            );

            await addDoc(collection(db, "employees"), {
                fullName,
                jobTitle,
                jobLocation,
                profileImageUrl,
                previousWorksUrls,
                timestamp: serverTimestamp(),
            });

            showMessage('تم تسجيل الموظف بنجاح!', 'success');
            form.reset();

        } catch (error) {
            console.error("خطأ في عملية التسجيل:", error);
            showMessage(`حدث خطأ: ${error.message}`, 'error');
        }
    });

    async function uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json(); // تغيير هنا
            throw new Error(errorData.error);       // تغيير هنا
        }

        const { url } = await response.json();
        return url;
    }

    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}-message`;
        messageDiv.classList.remove('hidden');
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
</script>
