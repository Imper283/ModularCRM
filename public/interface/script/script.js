// Init
let userName = document.getElementById("user-name")
userName.innerText = document.cookie.match(/name=([^;]*)/)[1] || ""

// Controls
let controlsTip = document.getElementById("sidebar-controls-tip")
let logoutBtn = document.getElementById("controls-logout")

logoutBtn.addEventListener("click", async ()=>{
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        window.location.href = '/'
    } catch (error) {
        console.error("Ошибка выхода")
    }
})




// Module loader
let sidePanel = document.getElementById("sidebar-panel")
let mainWindow = document.getElementById("main-window")
let windowCloseBtn = document.getElementById("window-controls")
let moduleName = document.getElementById("window-module-name")
let moduleDraw = document.getElementById("module-draw")

let isWindowOpened = false
let curOpenedModule = ""

windowCloseBtn.addEventListener("click",()=>{
    closeWindow()
})

function closeWindow(){
    if(isWindowOpened){
        mainWindow.style.display = "none"
        isWindowOpened = false
    }
}
function openWindow(){
    if(!isWindowOpened){
        mainWindow.style.display = "flex"
        isWindowOpened = true
    }
}


let Modules = {}
async function loadModules(){
    let result;
    try {
        const response = await fetch('/api/module/getAvailable', {
            method: 'GET'
        });
        if (response.ok) {
            result = await response.json()
        } else {
            const errorData = await response;
            errorLabel.innerText = errorData.message;
        }
    } catch (error) {
        console.error(error);
    }
    for(let key in result){
        try {
            let module = document.createElement("div")
            module.innerText = key
            module.className = "module-block"
            module.addEventListener("click", async ()=>{
                if(!isWindowOpened){
                    openWindow()
                }
                moduleName.innerText = key
                moduleDraw.src = result[key]
            })
            sidePanel.insertBefore(module, null)
        } catch (error) {
            console.error(`Error during loading ${key} module: `, error)
        }
    }
}

loadModules()


// Time date visuals
let timeElement = document.getElementById("footer-time")
let dateElement = document.getElementById("footer-date")

function formatTime(Number){
    if(Number<=9){
        return "0"+String(Number)
    }else{
        return String(Number)
    }
}

function updateTime(){
    let time = new Date()
    timeElement.innerText = formatTime(time.getHours())+":"+formatTime(time.getMinutes())
}
function updateDate(){
    let date = new Date()
    dateElement.innerText = formatTime(date.getDay())+"."+formatTime(date.getMonth())+"."+formatTime(date.getFullYear())
}

updateTime()
setInterval(()=>{
    updateTime()
},900)

updateDate()
setInterval(()=>{
    updateDate()
},60000)