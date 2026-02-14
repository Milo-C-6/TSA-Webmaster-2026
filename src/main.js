const themeToggleElem = document.getElementById("themeToggle");

// Theme toggler
themeToggleElem.addEventListener("click", function(event) {
    if (document.documentElement.classList.contains("dark")) {
        localStorage.theme = "light";
        themeToggleElem.children[0].src = "/src/media/sun.svg"
    } else {
        localStorage.theme = "dark";
        themeToggleElem.children[0].src = "/src/media/moon.svg"
    }
    document.documentElement.classList.toggle("dark");
});

// context menu for the theme toggler
themeToggleElem.addEventListener("contextmenu", function(event) {
    event.preventDefault();
    if (document.getElementById("themeMenu")) {
        return false;
    }
    const conMenu = document.createElement("div");
    conMenu.id = "themeMenu";
    conMenu.classList.add("fixed", "w-40", "bg-gray-50", "rounded-sm", "z-10", "transition-all");
    conMenu.style.left = event.clientX-40 +"px";
    conMenu.style.top = event.clientY +"px";
    const items = [];
    for (i = 0; i < 3; i++) {
        const option = document.createElement("a");
        option.classList.add("block", "w-full", "hover:bg-gray-100", "rounded-sm");
        option.href = "javascript:void(0)";;
        const highRule = document.createElement("hr") ;
        highRule.classList.add("m-auto");
        highRule.setAttribute("width", "95%");
        items.push(option);
        if (i != 2) {
            items.push(highRule);
        }
    }
    items[0].innerHTML = "Light Theme";
    items[0].onclick = function() {
        if (localStorage.getItem("theme") != "light") {
            localStorage.theme = "light"
            document.documentElement.classList.remove("dark")
            themeToggleElem.children[0].src = "/src/media/sun.svg"
        }
    }
    items[2].innerHTML = "Dark Theme";
    items[2].onclick = function() {
        if (localStorage.getItem("theme") != "dark") {
            localStorage.theme = "dark"
            document.documentElement.classList.add("dark")
            themeToggleElem.children[0].src = "/src/media/moon.svg"
        }
    }
    items[4].innerHTML = "System Default";
    items[4].onclick = function() {
        if (localStorage.getItem("theme") != null) {
            localStorage.removeItem("theme");
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                document.documentElement.classList.add("dark");
                themeToggleElem.children[0].src = "/src/media/moon.svg"
            } else {
                document.documentElement.classList.remove("dark");
                themeToggleElem.children[0].src = "/src/media/sun.svg"
            }
        }
    }
    conMenu.append.apply(conMenu, items);
    document.body.append(conMenu);
}, false);

document.body.onmouseup = function(event) {
    if (document.getElementById("themeMenu") && event.button == 0) {
        document.getElementById("themeMenu").style.opacity = 0;
        setTimeout(function(){
            document.getElementById("themeMenu").remove();
        }, 150)
    }
}