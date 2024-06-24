var sidemenubtn = document.getElementById('sidemenubtn')
var sidemenu = document.getElementById('sidemenu')
var logincontainer = document.getElementById('logincontainer')
var bottomarea = document.getElementById('bottomarea')
var sideopen = false;
window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
        sidemenu.classList.remove('active')
        logincontainer.style.zIndex = '1'
        bottomarea.style.backgroundColor = 'rgba(0, 0, 0, 0)'
        sidemenubtn.style.color = 'black'
        sidemenubtn.style.border = 'none'
        sideopen = false
    }
})
bottomarea.addEventListener('click', function () {
    sidemenu.classList.remove('active')
    logincontainer.style.zIndex = '1'
    bottomarea.style.backgroundColor = 'rgba(0, 0, 0, 0)'
    sidemenubtn.style.color = 'black'
    sidemenubtn.style.border = 'none'
    sideopen = false
})


sidemenubtn.addEventListener('click', function () {
    sidemenu.classList.toggle('active')
    if (sideopen) {
        logincontainer.style.zIndex = '1'
        bottomarea.style.backgroundColor = 'rgba(0, 0, 0, 0)'
        sidemenubtn.style.color = 'black'
        sidemenubtn.style.border = 'none'
        sideopen = false
    } else {
        logincontainer.style.zIndex = '-1'
        bottomarea.style.backgroundColor = 'rgba(0, 0, 0, 0.95)'
        sidemenubtn.style.color = 'orange'
        sideopen = true
    }
})

var homebtn = document.getElementById('homebtn')
var rigisterbtn = document.getElementById('rigisterbtn')
var loginbtn = document.getElementById('loginbtn')
var homebtnforside = document.getElementById('homebtnforside')
var rigisterbtnforside = document.getElementById('rigisterbtnforside')
var loginbtnforside = document.getElementById('loginbtnforside')

homebtnforside.addEventListener('click', function () {
    window.location.href = '/'
})

rigisterbtnforside.addEventListener('click', function () {
    window.location.href = '/register'
})

loginbtnforside.addEventListener('click', function () {
    window.location.href = '/login'
})

homebtn.addEventListener('click', function () {
    window.location.href = '/'
})

rigisterbtn.addEventListener('click', function () {
    window.location.href = '/register'
})

loginbtn.addEventListener('click', function () {
    window.location.href = '/login'
})
