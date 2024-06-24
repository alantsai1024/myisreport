var sidemenubtn = document.getElementById('sidemenubtn')
var sidemenu = document.getElementById('sidemenu')
var registercontainer = document.getElementById('registercontainer')
var bottomarea = document.getElementById('bottomarea')
var sideopen = false;

//隨時監聽視窗寬度

window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
        sidemenu.classList.remove('active')
        registercontainer.style.zIndex = '1'
        bottomarea.style.backgroundColor = 'rgba(0, 0, 0, 0)'
        sidemenubtn.style.color = 'black'
        sidemenubtn.style.border = 'none'
        sideopen = false
    }
})
bottomarea.addEventListener('click', function () {
    sidemenu.classList.remove('active')
    registercontainer.style.zIndex = '1'
    bottomarea.style.backgroundColor = 'rgba(0, 0, 0, 0)'
    sidemenubtn.style.color = 'black'
    sidemenubtn.style.border = 'none'
    sideopen = false
})


sidemenubtn.addEventListener('click', function () {
    sidemenu.classList.toggle('active')
    if (sideopen) {
        registercontainer.style.zIndex = '1'
        bottomarea.style.backgroundColor = 'rgba(0, 0, 0, 0)'
        sidemenubtn.style.color = 'black'
        sidemenubtn.style.border = 'none'
        sideopen = false
    } else {
        registercontainer.style.zIndex = '-1'
        bottomarea.style.backgroundColor = 'rgba(0, 0, 0, 0.95)'
        sidemenubtn.style.color = 'orange'
        sideopen = true
    }
})

var homebtn = document.getElementById('homebtn')
var rigisterbtn = document.getElementById('rigisterbtn')
var loginbtn = document.getElementById('loginbtn')
var homebtnforside = document.getElementById('homebtnforside')
var loginbtnforside = document.getElementById('loginbtnforside')

homebtn.addEventListener('click', function () {
    window.location.href = '/loginsuccess'
})

loginbtn.addEventListener('click', function () {
    window.location.href = '/auth/logout'
})

var homebtnforside = document.getElementById('homebtnforside')
var loginbtnforside = document.getElementById('loginbtnforside')

homebtnforside.addEventListener('click', function () {
    window.location.href = '/loginsuccess'
})

loginbtnforside.addEventListener('click', function () {
    window.location.href = '/auth/logout'
})