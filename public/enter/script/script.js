const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('submit');
const errorLabel = document.getElementById('error-label');

submitButton.addEventListener('click', async (event) => {
    event.preventDefault(); // Предотвращаем стандартное поведение формы
    
    const login = loginInput.value;
    const password = passwordInput.value;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login, password }),
        });
        
        if (response.ok) {
            // Успешная аутентификация
            window.location.href = '/'; // Перенаправление на основной интерфейс
        } else {
            const errorData = await response.json();
            errorLabel.innerText = errorData.message; // Показать сообщение об ошибке
        }
    } catch (error) {
        console.error(error);
        errorLabel.innerText = 'Ошибка при отправке данных'
    }
});
